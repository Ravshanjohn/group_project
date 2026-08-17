'use client'

import { useRouter } from 'next/navigation'
import { game_store } from '@/src/stores/games.store'

const TicTacToeSelect = () => {
  const router = useRouter()
  const selectedDifficulty = game_store((state) => state.selectedDifficulty)
  const { setIsGameActive } = game_store()

  const handleSelectMode = (mode: 'ai' | 'human') => {
    setIsGameActive(true)
    if (mode === 'ai') {
      router.push('/games/tic-tac-toe/ai')
    } else {
      router.push('/games/tic-tac-toe/human')
    }
  }

  return (
    <div className='flex-1 flex items-center justify-center'>
      <div className='w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-8 shadow-xl shadow-black/40'>
        <div className='flex flex-col gap-8 items-center justify-center'>
          
          {/* Title */}
          <div className='text-center'>
            <h1 className='text-5xl font-black text-white mb-3'>Tic-Tac-Toe</h1>
            <p className='text-zinc-400 text-lg'>Choose your opponent</p>
          </div>

          {/* Mode Selection Buttons */}
          <div className='flex gap-8 mt-6'>
            {/* AI Button */}
            <button
              onClick={() => handleSelectMode('ai')}
              className='flex flex-col items-center gap-4 px-12 py-8 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-blue-500/30 hover:border-blue-400/60 min-w-[220px]'
            >
              <span className='text-6xl'>🤖</span>
              <span className='text-2xl'>vs AI</span>
              <span className='text-sm font-semibold text-blue-200 opacity-90 mt-2'>{selectedDifficulty} difficulty</span>
            </button>

            {/* Human Button (Coming Soon) */}
            <button
              disabled
              className='flex flex-col items-center gap-4 px-12 py-8 bg-zinc-700/40 text-zinc-500 font-bold rounded-2xl border border-zinc-600/30 cursor-not-allowed min-w-[220px] relative'
              title='Coming soon'
            >
              <span className='text-6xl opacity-50'>👥</span>
              <span className='text-2xl'>vs Human</span>
              <span className='absolute top-4 right-4 bg-amber-600 text-amber-100 text-xs font-semibold px-3 py-1 rounded-full'>Coming Soon</span>
            </button>
          </div>

          {/* Difficulty Info */}
          <div className='mt-8 text-center text-zinc-400 text-sm max-w-md'>
            <p>Play against the AI and challenge yourself across different difficulty levels. Track your wins and compete for the highest score!</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default TicTacToeSelect
