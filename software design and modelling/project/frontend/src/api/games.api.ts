import instance from "../lib/axios";
import { toast } from "react-hot-toast";
import { useUIStore } from "../stores/ui.store";
import { getErrorMessage } from "../lib/errors";

interface gamesApi {
  getGameBySlug: (slug: string) => Promise<any>;
  fetchAllActiveGames: () => Promise<any[]>;
  getScoresByDifficulty: (difficulty: string, game_slug: string) => Promise<any[]>;
  findUserScore: (game_slug: string, difficulty: string) => Promise<any>;
  setUserScore: (game_slug: string, score: number, status: string, difficulty: string) => Promise<any>;
  getUserXp: () => Promise<number>;
  getUserBalance: () => Promise<number>;
  setUserBalance: (amount: number) => Promise<number | null>;
}

export const games_api: gamesApi = {

  getGameBySlug: async (slug) => {
    useUIStore.getState().setLoading('games', true);
    try {
      const res = await instance.get(`/games/slug/${slug}`);
      return res.data.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "getGameBySlug"));
      throw error;
    } finally {
      useUIStore.getState().setLoading('games', false);
    }
  },

  fetchAllActiveGames: async () => {
    useUIStore.getState().setLoading('games', true);
    try {
      const res = await instance.get('/games');
      return res.data.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "fetchAllActiveGames"));
      throw error;
    } finally {
      useUIStore.getState().setLoading('games', false);
    }
  },

  getScoresByDifficulty: async (difficulty, game_slug) => {
    useUIStore.getState().setLoading('games', true);
    try {
      const res = await instance.get('/games/score/leaderboard', {
        params: { game_slug, difficulty },
      });
      return res.data.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "getScoresByDifficulty"));
      throw error;
    } finally {
      useUIStore.getState().setLoading('games', false);
    }
  },

  findUserScore: async (game_slug, difficulty) => {
    useUIStore.getState().setLoading('games', true);
    try {
      const res = await instance.get('/games/find/score', {
        params: { game_slug, difficulty },
      });
      return res.data.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "findUserScore"));
      throw error;
    } finally {
      useUIStore.getState().setLoading('games', false);
    }
  },

  getUserXp: async () => {
    try {
      const res = await instance.get('/user/balance');
      if (res.data.error) return 0;
      return res.data.data ?? 0;
    } catch {
      return 0;
    }
  },

  getUserBalance: async () => {
    return games_api.getUserXp();
  },

  setUserBalance: async (amount) => {
    try {
      const res = await instance.post('/games/score', { amount });
      if (res.data.error) return null;
      return res.data.data?.balance ?? amount;
    } catch {
      return null;
    }
  },

  setUserScore: async (game_slug, score, status, difficulty) => {
    useUIStore.getState().setLoading('games', true);
    try {
      const res = await instance.post('/games/set/score', {
        game_slug,
        score,
        status,
        difficulty,
      });
      return res.data.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "setUserScore"));
      throw error;
    } finally {
      useUIStore.getState().setLoading('games', false);
    }
  },
};
