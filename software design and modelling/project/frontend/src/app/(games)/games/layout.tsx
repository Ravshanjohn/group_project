'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import RightSideBarMenu from '../components/RightSideBarMenu';
import { game_store } from '@/src/stores/games.store';
import type { DBGame } from '../components/games.types';

const GamesLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [selectedGame, setSelectedGame] = useState<DBGame | null>(null);

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const slug = pathSegments.length > 1 ? pathSegments[1] : pathSegments[0];

    if (slug && slug !== 'games') {
      game_store.getState().getGameBySlug(slug)
        .then((data) => setSelectedGame(data))
        .catch(() => setSelectedGame(null));
    } else {
      setSelectedGame(null);
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-main flex w-full">
      {children}
      {selectedGame && <RightSideBarMenu selectedGame={selectedGame} />}
    </div>
  );
};

export default GamesLayout;