'use client';

import { difficultyConfig, mapChallengeLevelsToDifficulties, type DBGameResponse } from '../components/games.types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { game_store } from '@/src/stores/games.store';
import { games_api } from '@/src/api/games.api';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { useUIStore } from '@/src/stores/ui.store';
import { Coins } from 'lucide-react';

const GamesPage = () => {
  const router = useRouter();
  const [games, setGames] = useState<DBGameResponse[]>([]);
  const balance = game_store((state) => state.balance);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const [data, xp] = await Promise.all([
          game_store.getState().fetchAllActiveGames(),
          game_store.getState().getUserXp(),
        ]);
        setGames(data);
        // balance is updated by the store, so no local setter is needed
        void xp;
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        useUIStore.getState().setLoading('games', false);
      }
    };

    fetchGames();
  }, []);

  

  
  return (
    <div className="flex-1 px-8 py-10 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: 'rgb(var(--text_header))' }}>
            Earn GP by playing games
          </h1>
          <p className="text-lg mt-2" style={{ color: 'rgb(var(--text_header_secondary))' }}>Select a game to start playing</p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl shrink-0"
          style={{ backgroundColor: 'var(--zinc_900)', border: '1px solid var(--zinc_800)' }}
        >
          <Coins size={18} style={{ color: 'var(--blue_400)' }} />
          <span className="text-lg font-bold" style={{ color: 'var(--white)' }}>{balance}</span>
          <span className="text-xs" style={{ color: 'var(--zinc_500)' }}>XP</span>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
        {games.map((game) => {
          const difficulties = mapChallengeLevelsToDifficulties(game.challenge_levels);
          return (
            <div
              key={game.slug}
              className="group relative flex flex-col bg-surface border border-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Media area */}
              <div className="relative w-full h-80 bg-zinc-800 overflow-hidden border-b border-zinc-800">
                {game.media_url ? (
                  <img
                    src={game.media_url}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <svg
                      className="w-10 h-10 text-zinc-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"
                      />
                    </svg>
                    <span className="text-zinc-500 text-xs">No preview yet</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Card body */}
              <div className="flex flex-col flex-1 p-5 gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-bold leading-snug flex-1" style={{ color: 'rgb(var(--text_header))' }}>
                    {game.name || (
                      <span className="text-zinc-500 italic font-normal">
                        Untitled Game
                      </span>
                    )}
                  </h2>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {difficulties.map((diff) => {
                      const cfg = difficultyConfig[diff];
                      return (
                        <span
                          key={diff}
                          className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${cfg.badge}`}
                        >
                          {diff}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <button className="mt-auto w-full py-2.5 rounded-xl bg-secondary border border-zinc-700 text-sm font-semibold tracking-wide transition-colors duration-200 hover:cursor-pointer"
                  style={{ color: 'rgb(var(--text_option_header))' }}
                  onClick={() => router.push(`/games/${game.slug}`)}
                >
                  Select
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {useUIStore((state) => state.loading.games) && (
        <LoadingSpinner />
      )}

    </div>
  );
};

export default GamesPage;
