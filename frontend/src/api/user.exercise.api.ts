import instance from "../lib/axios";
import { toast } from "react-hot-toast";
import { useUIStore } from "../stores/ui.store";
import { getErrorMessage } from "../lib/errors";

interface userExerciseApi {
  getUserCode: (slug: string, language_id: number) => Promise<any>;
  saveUserCode: (slug: string, code: string, language_id: number) => Promise<void>;
  setUserExerciseStatus: (slug: string, status: string) => Promise<void>;
  setUserExerciseViewed: (slug: string) => Promise<void>;
  setUserExerciseCompleted: (slug: string) => Promise<void>;
  getUserExercisesCompleted: () => Promise<{ completed_exercises: any[]; exercises: any[] }>;
}

export const user_exercise_api: userExerciseApi = {

  getUserCode: async (slug, language_id) => {
    useUIStore.getState().setLoading('user_exercise', true);
    try {
      const res = await instance.get(`/user/exercises/get-user-code/${slug}`, {
        params: { language_id },
      });
      if (!res.data.success) throw new Error("Failed to fetch user code");
      return res.data.user_code;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      useUIStore.getState().setLoading('user_exercise', false);
    }
  },

  saveUserCode: async (slug, code, language_id) => {
    useUIStore.getState().setLoading('user_exercise', true);
    try {
      const res = await instance.post(`/user/exercises/save-user-code/${slug}`, {
        code,
        language_id,
      });
      if (!res.data.success) throw new Error("Failed to save user code");
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      useUIStore.getState().setLoading('user_exercise', false);
    }
  },

  setUserExerciseStatus: async (slug, status) => {
    useUIStore.getState().setLoading('user_exercise', true);
    try {
      const res = await instance.post(`/user/exercises/set-exercise-user-status/${slug}`, {
        status,
      });
      if (!res.data.success) throw new Error("Failed to update exercise status");
      toast.success(res.data.message || "Exercise status updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      useUIStore.getState().setLoading('user_exercise', false);
    }
  },

  setUserExerciseViewed: async (slug) => {
    useUIStore.getState().setLoading('uexercise', true);
    try {
      const res = await instance.post(`/user/exercises/set-exercise-user-viewed/${slug}`, {});
      if (!res.data.success) throw new Error("Failed to set exercise viewed status");
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      useUIStore.getState().setLoading('uexercise', false);
    }
  },

  setUserExerciseCompleted: async (slug) => {
    useUIStore.getState().setLoading('user_exercise', true);
    try {
      const res = await instance.post(`/user/exercises/set-exercise-user-completed/${slug}`, {});
      if (!res.data.success) throw new Error("Failed to mark exercise as completed");
      toast.success(res.data.message || "Exercise marked as completed");
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      useUIStore.getState().setLoading('user_exercise', false);
    }
  },

  getUserExercisesCompleted: async () => {
    useUIStore.getState().setLoading('user_exercise', true);
    try {
      const res = await instance.get('/user/exercises/get-user-exercises-completed');
      if (!res.data.success) throw new Error("Failed to fetch completed exercises");
      return {
        completed_exercises: res.data.completed_exercises ?? [],
        exercises: res.data.exercises ?? [],
      };
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      useUIStore.getState().setLoading('user_exercise', false);
    }
  },
};
