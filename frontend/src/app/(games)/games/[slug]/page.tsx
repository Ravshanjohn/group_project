'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { game_store } from '@/src/stores/games.store';
import { gameComponentMap } from '../../components/games.config';
import LoadingSpinner from '@/src/components/LoadingSpinner';

const GamePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const gameData = await game_store.getState().getGameBySlug(slug);
        setGame(gameData);
      } catch (error) {
        console.error('Error fetching game:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchGame();
    }
  }, [slug]);

  if (loading) {
    return < LoadingSpinner />;
  }

  if (!game) {
    return <div>Game not found</div>;
  }

  const GameComponent = gameComponentMap[slug as string];
  if (!GameComponent) {
    return <div>Game not implemented</div>;
  }

  return <GameComponent />;
};

export default GamePage;