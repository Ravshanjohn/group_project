'use client';

import { useEffect, useState } from 'react';
import { exercises_store } from '@/src/stores/exercises.store';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { BookOpen, CheckCircle, Lock, Coins } from 'lucide-react';
import Link from 'next/link';
import { user_exercise_store } from '@/src/stores/user.exercise.store';

interface Exercise {
  id: number;
  name: string;
  slug: string;
  difficulty?: string;
  icon?: string;
  media_url?: string;
  access_level?: string;
  xp_need?: number;
  [key: string]: any;
}

const difficultyConfig: Record<string, { badge: string; dot: string }> = {
  beginner: {
    badge: ' text-emerald-400 ring-1 ring-emerald-500/40',
    dot: 'bg-emerald-400',
  },
  intermediate: {
    badge: 'text-amber-400 ring-1 ring-amber-500/40',
    dot: 'bg-amber-400',
  },
  advanced: {
    badge: 'text-rose-400 ring-1 ring-rose-500/40',
    dot: 'bg-rose-400',
  },
};

interface CardsProps {
  filters?: Record<string, string[]>;
}

const Cards = ({ filters = {} }: CardsProps) => {
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<number[]>([]);
  const [unlockedExerciseIds, setUnlockedExerciseIds] = useState<number[]>([]);
  const { getAllExercises } = exercises_store();
  const { setUserExerciseViewed, getUserCode, getUserExerciseCompleted, fetchUnlockedExercises } = user_exercise_store();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAllExercises();
        const data = exercises_store.getState().exercises;
        setExercises([...data].sort((a, b) => (a.id ?? 0) - (b.id ?? 0)));

        await Promise.all([
          getUserExerciseCompleted(),
          fetchUnlockedExercises(),
        ]);

        const completedState = user_exercise_store.getState();
        setCompletedExerciseIds(completedState.completedExerciseIds || []);
        setUnlockedExerciseIds(completedState.unlockedExerciseIds || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAllExercises, getUserExerciseCompleted, fetchUnlockedExercises]);

  const isExerciseLocked = (exercise: Exercise): boolean => {
    if (exercise.access_level !== 'private') return false;
    return !unlockedExerciseIds.includes(exercise.id);
  };

  const handleStartExercise = async (slug: string) => {
    await setUserExerciseViewed(slug);
    await getUserCode(slug, 1);
  };

  const sortExercisesById = (items: Exercise[]) =>
    [...items].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

  const filteredExercises = sortExercisesById(exercises).filter((exercise) => {
    const skillFilter = filters.skill || [];
    if (skillFilter.length > 0) {
      const difficulty = exercise.difficulty?.toLowerCase() || 'beginner';
      if (!skillFilter.includes(difficulty)) return false;
    }

    const statusFilter = filters.status || [];
    if (statusFilter.length > 0) {
      const isCompleted = completedExerciseIds.includes(exercise.id);
      if (statusFilter.includes('completed') && !isCompleted) return false;
      if (statusFilter.includes('not_completed') && isCompleted) return false;
    }

    const accessFilter = filters.access || [];
    if (accessFilter.length > 0) {
      const isFree = exercise.access_level !== 'private';
      if (accessFilter.includes('free') && !isFree) return false;
      if (accessFilter.includes('premium') && isFree) return false;
    }

    return true;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (filteredExercises.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-medium"
          style={{ color: "rgb(var(--text_option_child))" }}
        >
          {exercises.length === 0 ? 'No exercises available at the moment' : 'No exercises match your filters'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {filteredExercises.map((exercise) => {
        const difficulty = exercise.difficulty?.toLowerCase() || 'beginner';
        const config = difficultyConfig[difficulty] || difficultyConfig.beginner;
        const locked = isExerciseLocked(exercise);

        const cardContent = (
          <div className={`bg-surface group h-full flex flex-row border rounded-2xl overflow-hidden shadow-lg transition-all duration-300 relative ${
            locked
              ? 'opacity-75 cursor-not-allowed'
              : 'hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-1'
          }`}
            style={{ borderColor: "var(--root-cards-border)" }}
          >
            {locked && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px] rounded-2xl"
                style={{ background: 'rgba(0,0,0,0.45)' }}
              >
                <Lock className="w-8 h-8 text-zinc-300" />
                {!!exercise.xp_need && (
                  <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md text-amber-400 bg-amber-400/10">
                    <Coins className="w-3.5 h-3.5" />
                    {exercise.xp_need} XP
                  </div>
                )}
              </div>
            )}

            {!locked && completedExerciseIds.includes(exercise.id) && (
              <div className="absolute top-2 right-2 z-10" title="Completed">
                <CheckCircle className="w-6 h-6 drop-shadow-md" color='var(--root-cards-exercise-status-color)'/>
              </div>
            )}

            <div className="flex items-center justify-center p-1 ">
              <div className="w-28 h-28 rounded-xl relative overflow-hidden flex items-center justify-center root-cards-icon">
                {exercise.icon ? (
                  <img
                    src={exercise.icon}
                    alt={exercise.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <BookOpen className="w-8 h-8" style={{ color: "var(--root-cards-icon-placeholder)" }} />
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between flex-1 p-4 py-5 min-w-0">
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold leading-tight line-clamp-1"
                  style={{ color: 'rgb(var(--text_header))' }}
                >
                  {exercise.title || <span className="italic font-normal">Untitled</span>}
                </h3>
              </div>

              <div className="mt-auto flex items-end justify-between gap-3">
                <div>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${config.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
                    {difficulty}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 px-2 py-0.5 rounded-lg"
                  style={{ color: "var(--root-cards-exercise-duration-color)" }}
                >
                  <span className="text-sm font-bold">
                    {exercise.estimated_time || '0'}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-tighter">
                    {exercise.estimated_time_unit || 'min'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

        if (locked) {
          return (
            <div key={exercise.id || exercise.slug} className="block">
              {cardContent}
            </div>
          );
        }

        return (
          <Link
            key={exercise.id || exercise.slug}
            href={`/exercises/${exercise.slug}`}
            onClick={() => handleStartExercise(exercise.slug)}
            className="block"
          >
            {cardContent}
          </Link>
        );
      })}
    </div>
  );
};

export default Cards;
