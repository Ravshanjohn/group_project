'use client'

import { useState, useEffect, useRef } from "react"
import { game_store } from '@/src/stores/games.store';

const SnakePage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameTick, setGameTick] = useState(0);
  const selectedDifficulty = game_store((state) => state.selectedDifficulty);
  const { setUserScore, setIsGameActive } = game_store();
  const game_slug = 'snake';

  

  const gameState = useRef({
    snake: [{ x: 150, y: 150 }, { x: 140, y: 150 }, { x: 130, y: 150 }],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: { x: 250, y: 150 },
    score: 0,
    gameOver: false,
  });

  const GRID_SIZE = 10;
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 500;

  // Determine game speed based on difficulty
  const getGameSpeed = () => {
    switch (selectedDifficulty) {
      case 'Easy':
        return 100; // 150ms per tick
      case 'Medium':
        return 80; // 100ms per tick
      case 'Hard':
        return 50;  // 70ms per tick
      default:
        return 100;
    }
  };

  // Generate random food position
  const generateFood = () => {
    const x = Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)) * GRID_SIZE;
    const y = Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)) * GRID_SIZE;
    return { x, y };
  };

  // Cleanup on unmount - ensure game is marked as inactive
  useEffect(() => {
    return () => {
      setIsGameActive(false);
    };
  }, []);

  // Handle keyboard input (always listening)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // allow Enter/Space to start or restart
      if ((e.key === "Enter" || e.key === " ") && (!gameStarted || gameOver)) {
        handleStartGame();
        return;
      };

      if (e.key === "+") {
        const state = gameState.current;

        // add a new segment at the current tail position
        const tail = state.snake[state.snake.length - 1];
        state.snake.push({ x: tail.x, y: tail.y });

        state.score++;
        setScore(state.score);

        

        // trigger a render
        setGameTick((t) => t + 1);
        return;
      }

      if (!gameStarted || gameOver) return;

      const { direction } = gameState.current;
      switch (e.key) {
        case "r":
        case "R":
          setUserScore(game_slug, gameState.current.score, 'finished', selectedDifficulty.toLowerCase());
          setGameOver(true);
          break;
        case "ArrowUp":
        case "w":
        case "W":
          if (direction.y === 0) gameState.current.nextDirection = { x: 0, y: -1 };
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (direction.y === 0) gameState.current.nextDirection = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (direction.x === 0) gameState.current.nextDirection = { x: -1, y: 0 };
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (direction.x === 0) gameState.current.nextDirection = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted, gameOver]);

  // Game loop - runs when game is active
  useEffect(() => {
    if (!gameStarted || gameOver ) return;

    const gameLoop = setInterval(() => {
      const state = gameState.current;

      // Update direction
      state.direction = state.nextDirection;

      // Calculate new head position
      const head = state.snake[0];
      const newHead = {
        x: head.x + state.direction.x * GRID_SIZE,
        y: head.y + state.direction.y * GRID_SIZE,
      };

      // Check wall collision 
      if(newHead.x < 0) {
        newHead.x = CANVAS_WIDTH - GRID_SIZE;
      }else if(newHead.x > CANVAS_WIDTH - GRID_SIZE) {
        newHead.x = 0;
      }else if(newHead.y < 0) {
        newHead.y = CANVAS_HEIGHT - GRID_SIZE;
      }else if(newHead.y > CANVAS_HEIGHT - GRID_SIZE) {
        newHead.y = 0;
      }

      // Check self collision
      if (state.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        setIsGameActive(false);
        setUserScore(game_slug, state.score, 'finished', selectedDifficulty.toLowerCase());
        gameState.current.gameOver = true;
        return;
      }

      state.snake.unshift(newHead);

      // Check food collision
      if (newHead.x === state.food.x && newHead.y === state.food.y) {
        state.score++;
        setScore(state.score);
        state.food = generateFood();
      } else {
        state.snake.pop();
      }

      setGameTick(prev => prev + 1);
    }, getGameSpeed());

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, selectedDifficulty]);

  // Render game - runs every frame regardless of game state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const state = gameState.current;

    // Draw snake
    ctx.fillStyle = "#00ff00";
    state.snake.forEach((segment, index) => {
      ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
    });

    // Draw head with different color
    ctx.fillStyle = "#00cc00";
    ctx.fillRect(state.snake[0].x, state.snake[0].y, GRID_SIZE, GRID_SIZE);

    // Draw food
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(state.food.x, state.food.y, GRID_SIZE, GRID_SIZE);

    // Draw grid lines (optional)
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= CANVAS_WIDTH; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i <= CANVAS_HEIGHT; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }
  }, [gameTick]);

  const handleStartGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setIsGameActive(true);
    gameState.current = {
      snake: [{ x: 150, y: 150 }, { x: 140, y: 150 }, { x: 130, y: 150 }],
      direction: { x: 1, y: 0 },
      nextDirection: { x: 1, y: 0 },
      food: generateFood(),
      score: 0,
      gameOver: false,
    };
    setScore(0);
  };

  return (
    <div className='flex-1 flex items-center justify-center bg-main'>
      <div className='w-full max-w-4xl bg-secondary border border-zinc-700 rounded-2xl p-6 shadow-xl shadow-black/40'>
        <div className='flex flex-col gap-4'>
          <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold'
              style={{
                color: 'rgb(var(--text_header))',
              }}
            >Snake Game</h1>
            <div>
                <button
                  onClick={() => {
                    if (gameStarted && !gameOver && game_slug && selectedDifficulty) {
                      setUserScore(game_slug, gameState.current.score, 'finished', selectedDifficulty.toLowerCase());
                    }
                    setGameOver(true);
                  }}
                  disabled={!gameStarted || gameOver}
                  className={"px-3 py-1.5 font-semibold text-sm rounded-md border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500/10 transition-colors duration-200"}
                >
                  End Game
                </button>
              </div>
            <div className='flex items-center gap-4'>
              <div className='text-lg font-semibold'
                style={{
                  color: 'rgb(var(--text_header))'
                }}
              >Score: {score}</div>
            </div>
          </div>
          
          {/* Canvas container with relative positioning for overlay */}
          <div className='flex justify-center relative'>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className='border-2 border-zinc-600 rounded-lg bg-main'
            />
            
            {/* Overlay modal that appears when game hasn't started or has ended */}
            {(!gameStarted || gameOver) && (
              <div className='absolute inset-0 flex flex-col items-center justify-center bg-main backdrop-blur-md rounded-lg border border-zinc-600/50'>
                {gameOver && (
                  <div className='text-red-400 font-bold text-5xl mb-8 drop-shadow-lg'>Game Over!</div>
                )}
                {!gameOver && (
                  <div className='text-green-400 font-bold text-4xl mb-8 drop-shadow-lg'>Ready to Play?</div>
                )}
                <button
                  onClick={handleStartGame}
                  className='px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-green-500/30'
                >
                  {gameOver ? '🔄 Restart Game' : '🎮 Start Game'}
                </button>
                <div className='text-zinc-300 text-sm mt-4 text-center max-w-xs'>
                  {gameOver ? 'Try again to beat your score!' : 'Use arrow keys or WASD to control the snake'}
                </div>
              </div>
            )}
          </div>

          <div className='text-sm text-center'
            style={{
              color: 'rgb(var(--text_header_secondary))'
            }}
          >
            Use Arrow Keys to move the snake
          </div>
        </div>
      </div>
    </div>
  )
}

export default SnakePage