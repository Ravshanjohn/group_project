import { create } from 'zustand';
import type { Difficulty } from '@/src/app/(games)/components/games.types';
import { games_api } from '../api/games.api';

interface Store {
  selectedDifficulty: Difficulty;
  leaderboardRefreshTrigger: number;
  isGameActive: boolean;
  balance: number;
  setSelectedDifficulty: (difficulty: Difficulty) => void;
  setIsGameActive: (isActive: boolean) => void;
  getGameBySlug: (slug: string) => Promise<any>;
  fetchAllActiveGames: () => Promise<any>;
  getScoresByDifficulty: (difficulty: string, game_slug: string) => Promise<any>;
  setUserScore: (game_slug: string, score: number, status: string, difficulty: string) => Promise<any>;
  getUserXp: () => Promise<number>;
  setUserBalance: (amount: number) => Promise<number | null>;
}

export const game_store = create<Store>((set, get) => ({
  selectedDifficulty: 'Easy',
  leaderboardRefreshTrigger: 0,
  isGameActive: false,
  balance: 0,

  setSelectedDifficulty: (difficulty) => {
    set({ selectedDifficulty: difficulty });
  },

  setIsGameActive: (isActive) => {
    set({ isGameActive: isActive });
  },

  getGameBySlug: async (slug) => {
    return games_api.getGameBySlug(slug);
  },

  fetchAllActiveGames: async () => {
    return games_api.fetchAllActiveGames();
  },

  getScoresByDifficulty: async (difficulty, game_slug) => {
    return games_api.getScoresByDifficulty(difficulty, game_slug);
  },

  setUserScore: async (game_slug, score, status, difficulty) => {
    const safeScore = Number(score) || 0;
    const data = await games_api.setUserScore(game_slug, safeScore, status, difficulty);

    if (safeScore > 0) {
      const newBalance = await games_api.setUserBalance(safeScore);
      if (newBalance !== null) {
        set({ balance: newBalance });
      }
    }

    set({ leaderboardRefreshTrigger: get().leaderboardRefreshTrigger + 1 });
    return data;
  },

  getUserXp: async () => {
    const xp = await games_api.getUserXp();
    set({ balance: xp });
    return xp;
  },

  setUserBalance: async (amount) => {
    const newBalance = await games_api.setUserBalance(amount);
    if (newBalance !== null) {
      set({ balance: newBalance });
    }
    return newBalance;
  },
}));
