import instance from "../lib/axios";
import { toast } from "react-hot-toast";
import { useUIStore } from "../stores/ui.store";
import { getErrorMessage } from "../lib/errors";

interface AdminApi {
  getExercises: () => Promise<any[]>;
  changeExerciseStatus: (exerciseId: number, status: string) => Promise<any>;
  changeExerciseDifficulty: (exerciseId: number, difficulty: string) => Promise<any>;
  changeExercisePrice: (exerciseId: number, xp: number) => Promise<any>;
  toggleExerciseActive: (exerciseId: number) => Promise<any>;
  getMaps: () => Promise<any[]>;
  getMapExercises: (mapId: number) => Promise<any[]>;
  addExerciseToMap: (mapId: number, exerciseId: number) => Promise<any>;
  removeExerciseFromMap: (mapId: number, exerciseId: number) => Promise<any>;
}

export const admin_api: AdminApi = {
  getExercises: async () => {
    useUIStore.getState().setLoading('admin', true);
    try {
      const res = await instance.get('/admin/exercises');
      return res.data.data ?? [];
    } catch (error) {
      toast.error(getErrorMessage(error));
      return [];
    } finally {
      useUIStore.getState().setLoading('admin', false);
    }
  },

  changeExerciseStatus: async (exerciseId, status) => {
    try {
      const res = await instance.patch(`/admin/exercise/${exerciseId}/status`, { status });
      return res.data.data;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return null;
    }
  },

  changeExerciseDifficulty: async (exerciseId, difficulty) => {
    try {
      const res = await instance.patch(`/admin/exercise/${exerciseId}/difficulty`, { difficulty });
      return res.data.data;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return null;
    }
  },

  changeExercisePrice: async (exerciseId, xp) => {
    try {
      const res = await instance.patch(`/admin/exercise/${exerciseId}/xp`, { xp });
      return res.data.data;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return null;
    }
  },

  toggleExerciseActive: async (exerciseId) => {
    try {
      const res = await instance.patch(`/admin/exercise/${exerciseId}`);
      return res.data.data;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return null;
    }
  },

  getMaps: async () => {
    useUIStore.getState().setLoading('admin', true);
    try {
      const res = await instance.get('/admin/maps');
      return res.data.data ?? [];
    } catch (error) {
      toast.error(getErrorMessage(error));
      return [];
    } finally {
      useUIStore.getState().setLoading('admin', false);
    }
  },

  getMapExercises: async (mapId) => {
    useUIStore.getState().setLoading('admin', true);
    try {
      const res = await instance.get(`/admin/map/${mapId}/exercises`);
      const data = res.data.data;

      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.exercises)) return data.exercises;

      return [];
    } catch (error) {
      toast.error(getErrorMessage(error));
      return [];
    } finally {
      useUIStore.getState().setLoading('admin', false);
    }
  },

  addExerciseToMap: async (mapId, exerciseId) => {
    try {
      const res = await instance.post(`/admin/map/${mapId}/exercise/${exerciseId}`);
      return res.data;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return null;
    }
  },

  removeExerciseFromMap: async (mapId, exerciseId) => {
    try {
      const res = await instance.delete(`/admin/map/${mapId}/exercise/${exerciseId}`);
      return res.data;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return null;
    }
  },
};
