'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const TicTacToePage = () => {
  const router = useRouter()

  useEffect(() => {
    // Redirect to select page
    router.replace('/games/tic-tac-toe/select')
  }, [router])

  return null
}

export default TicTacToePage

