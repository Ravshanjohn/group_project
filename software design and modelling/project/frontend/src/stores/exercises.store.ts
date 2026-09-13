import { create } from 'zustand';
import { exercises_api } from '../api/exercises.api';

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
  loading: boolean;
  getExerciseBySlug: (slug: string) => Promise<void>;
  getAllExercises: () => Promise<void>;
  getInitialCode: (slug: string, language_id: number) => Promise<void>;
  getTestCase: (slug: string) => Promise<void>;
  getExerciseSignature: (slug: string) => Promise<void>;
  getExerciseLanguages: (slug: string) => Promise<void>;
  handleExerciseEvent: (slug: string, language_id: number, reason: string, code: string) => Promise<void>;
}

export const exercises_store = create<Store>((set) => ({
  exercise: null,
  output: null,
  testCases: null,
  exercises: [],
  loading: false,

  getExerciseBySlug: async (slug) => {
    try {
      const exercise = await exercises_api.getExerciseBySlug(slug);
      set({ exercise });
    } catch {}
  },

  getAllExercises: async () => {
    try {
      const exercises = await exercises_api.getAllExercises();
      set({ exercises });
    } catch {}
  },

  getInitialCode: async (slug, language_id) => {
    try {
      const initialCode = await exercises_api.getInitialCode(slug, language_id);
      set((state) => ({
        exercise: { ...state.exercise, initial_code: initialCode },
      }));
    } catch {}
  },

  getTestCase: async (slug) => {
    try {
      const data = await exercises_api.getTestCase(slug);
      const testCases = Array.isArray(data)
        ? data
        : Array.isArray(data?.output)
          ? data.output
          : data?.output
            ? [data.output]
            : [];

      set((state) => ({
        testCases,
        exercise: { ...state.exercise, output: testCases },
      }));
    } catch {}
  },

  getExerciseSignature: async (slug) => {
    try {
      const signature = await exercises_api.getExerciseSignature(slug);
      set((state) => ({
        exercise: { ...state.exercise, signature },
      }));
    } catch {}
  },

  getExerciseLanguages: async (slug) => {
    try {
      const languages = await exercises_api.getExerciseLanguages(slug);
      set((state) => ({
        exercise: { ...state.exercise, languages },
      }));
    } catch {}
  },

  handleExerciseEvent: async (slug, language_id, reason, code) => {
    try {
      await exercises_api.handleExerciseEvent(slug, language_id, reason, code);
    } catch {}
  },
}));
