import { create } from 'zustand';
import { user_exercise_api } from '../api/user.exercise.api';
import { exercises_store } from './exercises.store';

interface Exercise {
  id: number;
  name: string;
  slug: string;
  difficulty?: string;
  icon?: string;
  media_url?: string;
  [key: string]: any;
}

interface Store {
  exercise: any | null;
  output: any | null;
  testCases: any[] | null;
  exercises: Exercise[];
  completedExerciseIds: number[];
  setUserExerciseStatus: (slug: string, status: string) => Promise<void>;
  setUserExerciseViewed: (slug: string) => Promise<void>;
  getUserCode: (slug: string, language_id: number) => Promise<void>;
  saveUserCode: (slug: string, code: string, language_id: number) => Promise<void>;
  setUserExerciseCompleted: (slug: string) => Promise<void>;
  getUserExerciseCompleted: () => Promise<void>;
}

export const user_exercise_store = create<Store>((set) => ({
  exercise: null,
  output: null,
  testCases: null,
  exercises: [],
  completedExerciseIds: [],

  setUserExerciseStatus: async (slug, status) => {
    try {
      await user_exercise_api.setUserExerciseStatus(slug, status);
    } catch {}
  },

  setUserExerciseViewed: async (slug) => {
    try {
      await user_exercise_api.setUserExerciseViewed(slug);
    } catch {}
  },

  getUserCode: async (slug, language_id) => {
    try {
      const userCode = await user_exercise_api.getUserCode(slug, language_id);
      exercises_store.setState((state: any) => ({
        exercise: { ...state.exercise, user_code: userCode },
      }));
    } catch {}
  },

  saveUserCode: async (slug, code, language_id) => {
    try {
      await user_exercise_api.saveUserCode(slug, code, language_id);
    } catch {}
  },

  setUserExerciseCompleted: async (slug) => {
    try {
      await user_exercise_api.setUserExerciseCompleted(slug);
    } catch {}
  },

  getUserExerciseCompleted: async () => {
    try {
      const { completed_exercises, exercises } = await user_exercise_api.getUserExercisesCompleted();
      const completedIds = completed_exercises.map((item: { exercise_id: number }) => item.exercise_id);
      set({ completedExerciseIds: completedIds, exercises });
    } catch {}
  },
}));
