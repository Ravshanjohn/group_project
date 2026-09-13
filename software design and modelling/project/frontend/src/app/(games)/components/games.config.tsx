'use client';

import LoadingSpinner from '@/src/components/LoadingSpinner';
import dynamic from 'next/dynamic';

// Dynamically import game components
const SnakePage = dynamic(() => import('../games/snake/page'), {
  loading: () => < LoadingSpinner />,
});

const BouncingBallPage = dynamic(() => import('../games/breakout/page'), {
  loading: () => < LoadingSpinner />,
});

const TicTacToeSelectPage = dynamic(() => import('../games/tic-tac-toe/select/page'), {
  loading: () => < LoadingSpinner />,
});

export const gameComponentMap: Record<string, React.ComponentType<any>> = {
  'snake': SnakePage,
  'bouncing-ball': BouncingBallPage,
  'tic-tac-toe': TicTacToeSelectPage,
};
