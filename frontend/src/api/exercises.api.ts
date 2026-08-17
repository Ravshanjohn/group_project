import instance from "../lib/axios";
import { toast } from "react-hot-toast";
import { useUIStore } from "../stores/ui.store";
import { getErrorMessage } from "../lib/errors";

interface exercisesApi {
  getExerciseBySlug: (slug: string) => Promise<any>;
  getAllExercises: () => Promise<any[]>;
  getInitialCode: (slug: string, language_id: number) => Promise<any>;
  getTestCase: (slug: string) => Promise<any>;
  getExerciseSignature: (slug: string) => Promise<any>;
  getExerciseLanguages: (slug: string) => Promise<any[]>;
  handleExerciseEvent: (slug: string, language_id: number, reason: string, code: string) => Promise<void>;
}

export const exercises_api: exercisesApi = {

  getExerciseBySlug: async (slug) => {
    useUIStore.getState().setLoading('exercises', true);
    try {
      const res = await instance.get(`/exercises/${slug}`);
      if (!res.data.success) throw new Error("Exercise not found or inaccessible");
      return res.data.exercise;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      useUIStore.getState().setLoading('exercises', false);
    }
  },

  getAllExercises: async () => {
    useUIStore.getState().setLoading('exercises', true);
    try {
      const res = await instance.get('/exercises');
      if (!res.data.success) throw new Error("Failed to fetch exercises");
      return res.data.exercises;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      useUIStore.getState().setLoading('exercises', false);
    }
  },

  getInitialCode: async (slug, language_id) => {
    useUIStore.getState().setLoading('exercises', true);
    try {
      const res = await instance.get(`/exercises/initial-code/${slug}`, {
        params: { language_id },
      });
      if (!res.data.success) throw new Error("Failed to fetch initial code");
      return res.data.initial_code;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      useUIStore.getState().setLoading('exercises', false);
    }
  },

  getTestCase: async (slug) => {
    useUIStore.getState().setLoading('exercises', true);
    try {
      const res = await instance.get(`/exercises/test-case/${slug}`);
      if (!res.data.success) throw new Error("Failed to fetch exercise test case");
      return res.data;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      useUIStore.getState().setLoading('exercises', false);
    }
  },

  getExerciseSignature: async (slug) => {
    useUIStore.getState().setLoading('exercises', true);
    try {
      const res = await instance.get(`/exercises/signature/${slug}`);
      if (!res.data.success) throw new Error("Failed to fetch exercise signature");
      return res.data.signature;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      useUIStore.getState().setLoading('exercises', false);
    }
  },

  getExerciseLanguages: async (slug) => {
    useUIStore.getState().setLoading('exercises', true);
    try {
      const res = await instance.get(`/exercises/get-exercise-languages/${slug}`);
      if (!res.data.success) throw new Error("Failed to fetch exercise languages");
      return res.data.languages;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      useUIStore.getState().setLoading('exercises', false);
    }
  },

  handleExerciseEvent: async (slug, language_id, reason, code) => {
    useUIStore.getState().setLoading('exercises', true);
    try {
      const res = await instance.post(`/exercises/record-exercise-event/${slug}`, {
        reason,
        code,
        language_id,
      });
      if (!res.data.success) throw new Error("Failed to record exercise event");
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      useUIStore.getState().setLoading('exercises', false);
    }
  },
};
