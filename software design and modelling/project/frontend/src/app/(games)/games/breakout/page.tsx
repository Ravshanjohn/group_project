'use client'

import {  useEffect, useRef, useState } from "react";
import { game_store } from '@/src/stores/games.store';

const BreakOutPage = () => {
  const game_slug = 'breakout';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const selectedDifficulty = game_store((state) => state.selectedDifficulty);
  const { setUserScore, setIsGameActive } = game_store();

  useEffect(() => {
    return () => {
      setIsGameActive(false);
    };
  }, []);

  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 500;
  const BRICKS_ROWS = 12;
  const BRICKS_COLS = 7;
  
  //Brick controllable properties
  const BRICK_HEIGHT = 2;      // Height of each brick (in percentage)
  const BRICK_MARGIN = 0;      // Margin/gap between bricks (in percentage)
  const BRICK_TOP_OFFSET = 10; // Distance from top of canvas (in percentage)

  // Get speed multiplier based on difficulty
  const getSpeedMultiplier = () => {
    switch (selectedDifficulty) {
      case 'Easy':
        return 0.7;  // 30% slower
      case 'Medium':
        return 1.0;  // Normal speed
      case 'Hard':
        return 1.4;  // 40% faster
      default:
        return 1.0;
    }
  };

  const gameState = useRef({
    // Ball properties: position (0-100%), size, and velocity
    ball: {
      width: 2,
      height: 2,
      positionX: 48.5,
      positionY: 10,
      sx: 0.5,  // Horizontal speed
      sy: 0.5,  // Vertical speed
    },
    // Paddle properties: position, size, and movement speed
    paddle: {
      width: 12,
      height: 2,
      position: 50,  // Center position (0-100%)
      speed: 1.5,
      bottom: 1,     // Distance from bottom (0-100%)
    },
    // Game boundary constraints
    gameArea: {
      left: 0,
      right: 100 - 2.5,
      top: 100 - 2.5,
      bottom: 0,
    },
    // Keyboard state for paddle movement
    keys: {
      left: false,
      right: false,
    },
    // Array of brick objects that track broken/active bricks
    brickData: [] as { row: number; col: number; status: boolean; x: number; y: number; width: number; height: number }[],
    score: 0,
    gameRunning: false,
  });

  //  Generate brick grid based on BRICKS_ROWS, BRICKS_COLS and brick properties 
  const generateBricks = () => {
    const bricks = [];
    // Calculate brick width accounting for margins
    const brickWidth = (100 / BRICKS_COLS) - BRICK_MARGIN;
    
    for (let row = 0; row < BRICKS_ROWS; row++) {
      for (let col = 0; col < BRICKS_COLS; col++) {
        bricks.push({
          row,
          col,
          status: false,
          x: (col * 100) / BRICKS_COLS + BRICK_MARGIN / 2,
          y: 100 - (row * (BRICK_HEIGHT + BRICK_MARGIN) + BRICK_TOP_OFFSET),
          width: brickWidth,
          height: BRICK_HEIGHT,
        });
      }
    }
    gameState.current.brickData = bricks;
  };

  // Keyboard & Mouse handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !gameStarted) {
        startGame();
        return;
      }
      if (!gameStarted || gameOver) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A')
        gameState.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')
        gameState.current.keys.right = true;

      if(e.key === 'r' || e.key === 'R') {
        setGameStarted(false);
        setIsGameActive(false);
        setUserScore(game_slug, gameState.current.score, 'finished', selectedDifficulty.toLowerCase());
        setGameOver(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A')
        gameState.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')
        gameState.current.keys.right = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!gameStarted || gameOver) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const paddlePositionPercent = (mouseX / CANVAS_WIDTH) * 100;

      const { paddle } = gameState.current;
      paddle.position = Math.max(paddle.width / 2, Math.min(100 - paddle.width / 2, paddlePositionPercent));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gameStarted, gameOver]);

  const startGame = () => {
    // Generate fresh brick grid
    setIsGameActive(true);
    generateBricks();
    gameState.current.gameRunning = true;
    gameState.current.score = 0;
    // Reset ball to center-top with initial velocity (adjusted by difficulty)
    const speedMultiplier = getSpeedMultiplier();
    gameState.current.ball = {
      width: gameState.current.ball.width,
      height: gameState.current.ball.height,
      positionX: 48.5,
      positionY: 5,
      sx: 0.5 * speedMultiplier,
      sy: 0.5 * speedMultiplier,
    };
    // Reset paddle to center
    gameState.current.paddle.position = 50;
    setScore(0);
    setGameStarted(true);
    setGameOver(false);
  };

  //  Check if ball hits any brick and handle collision 
  const breakBricks = () => {
    const { ball, brickData } = gameState.current;

    for (let i = 0; i < brickData.length; i++) {
      const brick = brickData[i];
      if (brick.status) continue;

      const ballLeft = ball.positionX;
      const ballRight = ball.positionX + ball.width;
      const ballBottom = ball.positionY;
      const ballTop = ball.positionY + ball.height;

      const brickLeft = brick.x;
      const brickRight = brick.x + brick.width;
      const brickBottom = brick.y;
      const brickTop = brick.y + brick.height;

      const isColliding = !(
        brickRight < ballLeft ||
        brickLeft > ballRight ||
        brickTop < ballBottom ||
        brickBottom > ballTop
      );

      if (isColliding) {
        brick.status = true;
        gameState.current.score++;
        setScore(gameState.current.score);

        const overlapLeft = ballRight - brickLeft;
        const overlapRight = brickRight - ballLeft;
        const overlapTop = brickTop - ballBottom;
        const overlapBottom = ballTop - brickBottom;

        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);

        if (minOverlapX < minOverlapY) {
          ball.sx *= -1;
        } else {
          ball.sy *= -1;
        }

        break;
      }
    }
  };

  //  Check ball collisions with walls, paddle, and bricks 
  const checkCollision = () => {
    const { ball, paddle, gameArea } = gameState.current;

    // Wall collision
    if (ball.positionX <= gameArea.left) {
      ball.positionX = gameArea.left;
      ball.sx *= -1;
    }
    if (ball.positionX >= gameArea.right) {
      ball.positionX = gameArea.right;
      ball.sx *= -1;
    }

    // Top collision
    if (ball.positionY >= gameArea.top) {
      ball.positionY = gameArea.top;
      ball.sy *= -1;
    }

    // Bottom - game over
    if (ball.positionY <= gameArea.bottom) {
      setGameStarted(false);
      setGameOver(true);
      setIsGameActive(false);
      setUserScore(game_slug, gameState.current.score, 'finished', selectedDifficulty.toLowerCase());
      gameState.current.gameRunning = false;
      return;
    }

    // Paddle collision
    const ballBottom = ball.positionY;
    const ballTop = ball.positionY + ball.height;
    const ballLeft = ball.positionX;
    const ballRight = ball.positionX + ball.width;

    const paddleTop = paddle.bottom + paddle.height;
    const paddleBottom = paddle.bottom;
    const paddleLeft = paddle.position - paddle.width / 2;
    const paddleRight = paddle.position + paddle.width / 2;

    const isXOverlap = ballRight >= paddleLeft && ballLeft <= paddleRight;
    const isYOverlap = ballBottom <= paddleTop && ballTop >= paddleBottom;

    if (isXOverlap && isYOverlap && ball.sy < 0) {
      ball.sy *= -1;
      const hitOffset = ball.positionX + ball.width / 2 - paddle.position;
      ball.sx = (hitOffset / (paddle.width / 2)) * 0.6;
    }

    breakBricks();
  };

  //  Update ball position and check for collisions 
  const moveBall = () => {
    const { ball } = gameState.current;
    ball.positionX += ball.sx;
    ball.positionY += ball.sy;
    checkCollision();
  };

  //  Move paddle based on keyboard input (arrow keys/A/D) 
  const movePaddle = () => {
    const { paddle, keys } = gameState.current;

    if (keys.left) {
      paddle.position -= paddle.speed;
      if (paddle.position <= paddle.width / 2) paddle.position = paddle.width / 2;
    }
    if (keys.right) {
      paddle.position += paddle.speed;
      if (paddle.position >= 100 - paddle.width / 2)
        paddle.position = 100 - paddle.width / 2;
    }
  };

  //  Draw all game elements on canvas 
  const render = (ctx: CanvasRenderingContext2D) => {
    const { ball, paddle, brickData } = gameState.current;

    // Clear canvas with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw all active bricks (cyan with black border)
    brickData.forEach((brick) => {
      if (!brick.status) {
        const x = (brick.x / 100) * CANVAS_WIDTH;
        const y = CANVAS_HEIGHT - ((brick.y + brick.height) / 100) * CANVAS_HEIGHT;
        const w = (brick.width / 100) * CANVAS_WIDTH;
        const h = (brick.height / 100) * CANVAS_HEIGHT;

        ctx.fillStyle = '#00ff7b';
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 4);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw ball (white circle)
    const ballX = (ball.positionX / 100) * CANVAS_WIDTH + (ball.width / 100) * CANVAS_WIDTH / 2;
    const ballY = CANVAS_HEIGHT - (ball.positionY / 100) * CANVAS_HEIGHT - (ball.height / 100) * CANVAS_HEIGHT / 2;
    const ballRadius = (ball.width / 100) * CANVAS_WIDTH / 2;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw paddle (red rounded rectangle)
    const paddleX = ((paddle.position - paddle.width / 2) / 100) * CANVAS_WIDTH;
    const paddleY = CANVAS_HEIGHT - ((paddle.bottom + paddle.height) / 100) * CANVAS_HEIGHT;
    const paddleW = (paddle.width / 100) * CANVAS_WIDTH;
    const paddleH = (paddle.height / 100) * CANVAS_HEIGHT;

    ctx.fillStyle = '#CD5C5C';
    ctx.beginPath();
    ctx.roundRect(paddleX, paddleY, paddleW, paddleH, 5);
    ctx.fill();
  };

  // Main game loop - runs every frame using requestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationID: number;

    const gameLoop = () => {
      const state = gameState.current;

      // Always render, even if not started (shows static initial state)
      if (state.gameRunning && !gameOver) {
        movePaddle();
        moveBall();
      }
      render(ctx);

      animationID = requestAnimationFrame(gameLoop);
    };

    animationID = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationID);
  }, [gameStarted, gameOver]);

  

  // Render UI: Title, Canvas, Score, and Control Buttons 
  return (
    <div className='flex-1 flex items-center justify-center bg-main'>
      <div className='w-full max-w-4xl bg-secondary border border-zinc-700 rounded-2xl p-6 shadow-xl shadow-black/40'>
        <div className='flex flex-col gap-4'>
          <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold'
              style={{
                color: 'rgb(var(--text_header))',
              }}
            >
              Bouncing Ball
            </h1>
            <div>
              <button
                onClick={() => {
                  if (gameStarted && !gameOver && game_slug && selectedDifficulty) {
                    setUserScore(game_slug, gameState.current.score, 'finished', selectedDifficulty.toLowerCase());
                  }
                  setGameOver(true);
                }}
                disabled={!gameStarted || gameOver}
                className={"px-3 py-1.5 font-semibold text-sm rounded-md border border-red-500/30  text-red-400 hover:bg-red-500/20 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500/10 transition-colors duration-200"}
              >
                End Game
              </button>
            </div>
            <div className='flex items-center gap-4'>
              <div className='text-lg font-semibold'
                style={{
                  color: "rgb(var(--text_header))"
                }}
              >
                Score: {score}
              </div>
            </div>
          </div>
          
          {/* Canvas container with relative positioning for overlay */}
          <div className='flex justify-center relative'>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className='border-2 border-zinc-600  rounded-lg'
            />
              
            {/* Overlay modal that appears when game hasn't started or has ended */}
            {(!gameStarted || gameOver) && (
              <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-lg border border-zinc-600/50'>
                {gameOver && (
                  <div className='text-red-400 font-bold text-5xl mb-8 drop-shadow-lg'>Game Over!</div>
                )}
                {!gameOver && (
                  <div className='text-blue-400 font-bold text-4xl mb-8 drop-shadow-lg'>Ready to Break?</div>
                )}
                <button
                  onClick={startGame}
                  className='px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-zinc-300 font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-blue-500/30'
                >
                  {gameOver ? '🔄 Restart Game' : '🏓 Start Game'}
                </button>
                <div className='text-zinc-500 text-sm mt-4 text-center max-w-xs'>
                  {gameOver ? 'Try again to break more bricks!' : 'Use arrow keys or A/D to move the paddle'}
                </div>
              </div>
            )}
          </div>

          <div className='text-zinc-500 text-sm text-center'>
            Use Arrow Keys or A/D to move paddle | Enter to start
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakOutPage;