'use client'

import { useState, useEffect, useCallback } from 'react'
import { game_store } from '@/src/stores/games.store'

type Cell = 'X' | 'O' | null
type GamePhase = 'choosing' | 'playing' | 'over'
type PlayerSymbol = 'X' | 'O'

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
]

const checkWinner = (board: Cell[]): { winner: Cell; line: number[] } | null => {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line }
    }
  }
  return null
}

const isBoardFull = (board: Cell[]) => board.every(cell => cell !== null)

// Minimax for Hard AI
const minimax = (board: Cell[], isMaximizing: boolean, depth: number): number => {
  const result = checkWinner(board)
  if (result?.winner === 'O') return 10 - depth
  if (result?.winner === 'X') return depth - 10
  if (isBoardFull(board)) return 0

  if (isMaximizing) {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O'
        best = Math.max(best, minimax(board, false, depth + 1))
        board[i] = null
      }
    }
    return best
  } else {
    let best = Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X'
        best = Math.min(best, minimax(board, true, depth + 1))
        board[i] = null
      }
    }
    return best
  }
}

const getAIMove = (board: Cell[], difficulty: string): number => {
  const empty = board.map((v, i) => (v === null ? i : -1)).filter(i => i !== -1)
  if (empty.length === 0) return -1

  if (difficulty === 'Easy') {
    // Pure random
    return empty[Math.floor(Math.random() * empty.length)]
  }

  if (difficulty === 'Medium') {
    // Win if possible
    for (const i of empty) {
      const b = [...board]; b[i] = 'O'
      if (checkWinner(b)?.winner === 'O') return i
    }
    // Block player win
    for (const i of empty) {
      const b = [...board]; b[i] = 'X'
      if (checkWinner(b)?.winner === 'X') return i
    }
    // Take center if free
    if (board[4] === null) return 4
    // Random
    return empty[Math.floor(Math.random() * empty.length)]
  }

  // Hard: minimax
  let bestScore = -Infinity
  let bestMove = empty[0]
  for (const i of empty) {
    const b = [...board] as Cell[]
    b[i] = 'O'
    const score = minimax(b, false, 0)
    if (score > bestScore) {
      bestScore = score
      bestMove = i
    }
  }
  return bestMove
}

const TicTacToeAIPage = () => {
  const GameSlug = 'tic-tac-toe'
  const selectedDifficulty = game_store((state) => state.selectedDifficulty)
  const { setUserScore, setIsGameActive } = game_store()

  const [gamePhase, setGamePhase] = useState<GamePhase>('choosing')
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [winResult, setWinResult] = useState<{ winner: Cell; line: number[] } | null>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)

  const [playerSymbol, setPlayerSymbol] = useState<PlayerSymbol>('X')
  const [firstPlayerSymbol, setFirstPlayerSymbol] = useState<PlayerSymbol>('X')
  const [roundNumber, setRoundNumber] = useState(0)

  const [scores, setScores] = useState({ player: 0, tie: 0, computer: 0 })

  // Cleanup on unmount
  useEffect(() => {
    // Lock difficulty when entering AI game
    setIsGameActive(true)
    return () => { setIsGameActive(false) }
  }, [setIsGameActive])

  const handleChooseSymbol = (symbol: PlayerSymbol) => {
    setPlayerSymbol(symbol)
    setFirstPlayerSymbol(symbol)
    setRoundNumber(0)
    startNewRound(symbol)
  }

  const startNewRound = (symbol: PlayerSymbol) => {
    setBoard(Array(9).fill(null))
    setWinResult(null)
    setIsDraw(false)
    setGamePhase('playing')
    setAiThinking(false)
    setIsPlayerTurn(symbol === playerSymbol)
  }

  const resetRound = useCallback(() => {
    const nextFirstPlayer = firstPlayerSymbol === 'X' ? 'O' : 'X'
    setFirstPlayerSymbol(nextFirstPlayer)
    setRoundNumber(r => r + 1)
    startNewRound(nextFirstPlayer === playerSymbol ? playerSymbol : (playerSymbol === 'X' ? 'O' : 'X'))
  }, [playerSymbol, firstPlayerSymbol])

  const handleGameEnd = useCallback((result: 'player' | 'computer' | 'tie', newBoard: Cell[], winLine: number[] | null) => {
    const newScores = {
      player: result === 'player' ? scores.player + 1 : scores.player,
      tie: result === 'tie' ? scores.tie + 1 : scores.tie,
      computer: result === 'computer' ? scores.computer + 1 : scores.computer,
    }
    setScores(newScores)

    if (result === 'player') {
      setWinResult({ winner: playerSymbol, line: winLine! })
    } else if (result === 'computer') {
      const computerSymbol = playerSymbol === 'X' ? 'O' : 'X'
      setWinResult({ winner: computerSymbol, line: winLine! })
    } else {
      setIsDraw(true)
    }
    setGamePhase('over')
    setIsGameActive(false)
  }, [scores, playerSymbol, setIsGameActive])

  // AI move effect
  useEffect(() => {
    if (gamePhase !== 'playing' || isPlayerTurn) return

    setAiThinking(true)
    const delay = selectedDifficulty === 'Easy' ? 300 : selectedDifficulty === 'Medium' ? 500 : 700
    const computerSymbol = playerSymbol === 'X' ? 'O' : 'X'

    const timer = setTimeout(() => {
      const move = getAIMove(board, selectedDifficulty)
      if (move === -1) return

      const newBoard = [...board] as Cell[]
      newBoard[move] = computerSymbol
      setBoard(newBoard)
      setAiThinking(false)

      const winner = checkWinner(newBoard)
      if (winner) {
        handleGameEnd('computer', newBoard, winner.line)
      } else if (isBoardFull(newBoard)) {
        handleGameEnd('tie', newBoard, null)
      } else {
        setIsPlayerTurn(true)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [board, isPlayerTurn, gamePhase, selectedDifficulty, playerSymbol, handleGameEnd])

  const handleCellClick = (index: number) => {
    if (gamePhase !== 'playing') return
    if (board[index] !== null) return
    if (!isPlayerTurn || aiThinking) return

    const newBoard = [...board] as Cell[]
    newBoard[index] = playerSymbol
    setBoard(newBoard)

    const winner = checkWinner(newBoard)
    if (winner) {
      handleGameEnd('player', newBoard, winner.line)
    } else if (isBoardFull(newBoard)) {
      handleGameEnd('tie', newBoard, null)
    } else {
      setIsPlayerTurn(false)
    }
  }

  const endSession = () => {
    // Submit the player's total wins as their score
    if (GameSlug && selectedDifficulty) {
      setUserScore(GameSlug, scores.player, 'finished', selectedDifficulty.toLowerCase())
    }
    
    setIsGameActive(false)
    setBoard(Array(9).fill(null))
    setWinResult(null)
    setIsDraw(false)
    setScores({ player: 0, tie: 0, computer: 0 })
    setGamePhase('choosing')
    
    // Go back to mode select
    window.history.back()
  }

  const getCellStyle = (index: number) => {
    const isWinningCell = winResult?.line.includes(index)
    const val = board[index]
    
    // Base styles for the cell
    let base = 'w-full aspect-square flex items-center justify-center text-7xl font-black transition-all duration-200 cursor-pointer select-none '
    
    // Add borders to create the classic tic-tac-toe grid
    if (index > 2) base += 'border-t-4 border-white ' // Not top row
    if (index % 3 !== 0) base += 'border-l-4 border-white ' // Not left col

    if (isWinningCell) {
      return base + 'text-yellow-400 scale-105'
    }
    if (val !== null) {
      return base + 'text-zinc-400 cursor-default'
    }
    if (gamePhase === 'playing' && isPlayerTurn && !aiThinking) {
      return base + 'hover:bg-white/5'
    }
    return base + 'cursor-not-allowed'
  }

  const overlayContent = () => {
    // Choose symbol overlay
    if (gamePhase === 'choosing') {
      return (
        <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-xl border border-zinc-600/50 z-10'>
          <div className='font-black text-4xl mb-3'
            style={{
              color: 'rgb(var(--text_header))'
            }}
          >Choose Your Symbol</div>
          <div className='text-sm mb-10'
            style={{
              color: 'rgb(var(--text_header_secondary))'
            }}
          >Who plays first?</div>
          <div className='flex gap-6'>
            <button
              onClick={() => handleChooseSymbol('X')}
              className='flex flex-col items-center gap-3 px-10 py-8 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-blue-500/30 min-w-[140px]'
            >
              <span className='text-6xl'>X</span>
              <span className='text-lg'>Play First</span>
            </button>
            <button
              onClick={() => handleChooseSymbol('O')}
              className='flex flex-col items-center gap-3 px-10 py-8 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-red-500/30 min-w-[140px]'
            >
              <span className='text-6xl'>O</span>
              <span className='text-lg'>Let AI Start</span>
            </button>
          </div>
        </div>
      )
    }

    // Round result overlay
    if (gamePhase === 'over') {
      const resultText = winResult?.winner === playerSymbol
        ? 'You Win!'
        : winResult?.winner && winResult.winner !== playerSymbol
        ? 'AI Wins!'
        : 'It\'s a Draw!'
      const resultColor = winResult?.winner === playerSymbol
        ? 'text-blue-400'
        : winResult && winResult.winner !== playerSymbol
        ? 'text-red-400'
        : 'text-yellow-400'

      return (
        <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-xl border border-zinc-600/50 z-10'>
          <div className={`font-black text-5xl mb-2 drop-shadow-lg ${resultColor}`}>{resultText}</div>
          <div className='text-sm mb-8'
            style={{
              color: 'rgb(var(--text_header_secondary))'
            }}
          >Round {roundNumber + 1}</div>
          <div className='flex gap-3'>
            <button
              onClick={resetRound}
              className='px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-green-500/30'
            >
              🔄 Next Round
            </button>
            <button
              onClick={endSession}
              className='px-8 py-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-semibold text-lg rounded-xl transition-all duration-200 border border-zinc-600/50'
            >
              Quit
            </button>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className='flex-1 flex items-center justify-center bg-main'>
      <div className='w-full max-w-4xl bg-secondary border border-zinc-700 rounded-2xl p-6 shadow-xl shadow-black/40'>
        <div className='flex flex-col gap-4'>

          {/* Header */}
          <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold'
              style={{
                color: 'rgb(var(--text_header))',
              }}
            >Tic-Tac-Toe vs AI</h1>
            <button
              onClick={endSession}
              disabled={gamePhase === 'choosing'}
              className='px-3 py-1.5 font-semibold text-sm rounded-md border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
            >
              End Game
            </button>
            <div className='text-zinc-400 text-sm'>
              {gamePhase === 'playing' && (
                aiThinking
                  ? <span className='text-amber-400 animate-pulse'>AI ({playerSymbol === 'X' ? 'O' : 'X'}) thinking...</span>
                  : <span className='text-green-400'>Your turn ({playerSymbol})</span>
              )}
              {gamePhase === 'choosing' && <span className='text-blue-400'>Select your symbol</span>}
            </div>
          </div>

          {/* Scoreboard */}
          <div className='flex justify-center gap-12 mt-4 mb-2'>
            <div className='flex flex-col items-center'>
              <div className='font-medium text-sm mb-1 uppercase tracking-wider'
                style={{
                  color: 'rgb(var(--text_header_secondary))'
                }}
              >PLAYER (X)</div>
              <div className='font-bold text-4xl'
                style={{
                  color: 'rgb(var(--text_header))'
                }}
              >{scores.player}</div>
            </div>
            <div className='flex flex-col items-center'>
              <div className='font-medium text-sm mb-1 uppercase tracking-wider'
                style={{
                  color: 'rgb(var(--text_header_secondary))'
                }}
              >TIE</div>
              <div className='font-bold text-4xl'
                style={{
                  color: 'rgb(var(--text_header))'
                }}
              >{scores.tie}</div>
            </div>
            <div className='flex flex-col items-center'>
              <div className='font-medium text-sm mb-1 uppercase tracking-wider'
                style={{
                  color: 'rgb(var(--text_header_secondary))'
                }}
              >COMPUTER (O)</div>
              <div className='font-bold text-4xl'
                style={{
                  color: 'rgb(var(--text_header))'
                }}
              >{scores.computer}</div>
            </div>
          </div>

          {/* Board */}
          <div className='flex justify-center relative'>
            <div className='w-[400px] h-[400px] relative bg-black p-4 rounded-xl'>
              <div className='grid grid-cols-3 w-full h-full'>
                {board.map((cell, i) => (
                  <button
                    key={i}
                    onClick={() => handleCellClick(i)}
                    className={getCellStyle(i)}
                  >
                    {cell && (
                      <span className='text-zinc-400'>
                        {cell}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Overlays */}
              {overlayContent()}
            </div>
          </div>

          {/* Footer hint */}
          <div className='text-sm text-center'
            style={{
              color: 'rgb(var(--text_header_secondary))'
            }}
          >
            {gamePhase === 'playing'
              ? `Round ${roundNumber + 1} · ${selectedDifficulty} difficulty`
              : gamePhase === 'over'
              ? 'Click Next Round to play again or Quit to return'
              : 'Select your symbol to begin'}
          </div>

        </div>
      </div>
    </div>
  )
}

export default TicTacToeAIPage
