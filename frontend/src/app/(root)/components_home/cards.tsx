'use client';

import { useEffect, useState } from 'react';
import { exercises_store } from '@/src/stores/exercises.store';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { user_exercise_store } from '@/src/stores/user.exercise.store';

interface Exercise {
  id: number;
  name: string;
  slug: string;
  difficulty?: string;
  icon?: string;
  media_url?: string;
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

const Cards = () => {
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<number[]>([]);
  const { getAllExercises } = exercises_store();
  const { setUserExerciseViewed, getUserCode, getUserExerciseCompleted } = user_exercise_store();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all exercises
        await getAllExercises();
        const data = exercises_store.getState().exercises;
        console.log('Exercises from store:', data);
        setExercises(data);

        // Fetch completed exercises
        await getUserExerciseCompleted();
        const completedState = user_exercise_store.getState();
        const completedIds = completedState.completedExerciseIds || [];
        setCompletedExerciseIds(completedIds);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAllExercises, getUserExerciseCompleted]);

  const handleStartExercise = async (slug: string) => {
    await setUserExerciseViewed(slug);
    await getUserCode(slug, 1); // Assuming language_id 1 for default
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (exercises.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-medium"
          style={{
            color: "rgb(var(--text_option_child))"
          }}
        >
          No exercises available at the moment
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {exercises.map((exercise) => {
        const difficulty = exercise.difficulty?.toLowerCase() || 'beginner';
        const config = difficultyConfig[difficulty] || difficultyConfig.beginner;

        return (
          <Link
            key={exercise.id || exercise.slug}
            href={`/exercises/${exercise.slug}`}
            onClick={() => handleStartExercise(exercise.slug)}
            className="block"
          >
              
            <div className="bg-surface group h-full flex flex-row border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-1 transition-all duration-300 relative "
              style={{ 
                borderColor: "var(--root-cards-border)"
              }}
            >
              {/* Completed Icon - Top Right Corner */}
              {completedExerciseIds.includes(exercise.id) && (
                <div className="absolute top-2 right-2 z-10" title="Completed">
                  <CheckCircle className="w-6 h-6 drop-shadow-md" color='var(--root-cards-exercise-status-color)'/>
                </div>
              )}

              {/* Image / Media Area - Positioned Middle Vertically */}
              <div className="flex items-center justify-center p-1 ">
                <div className="w-28 h-28 rounded-xl relative overflow-hidden flex items-center justify-center root-cards-icon">
                  {exercise.icon  ? (
                    <img
                      src={exercise.icon}
                      alt={exercise.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    // Placeholder Icon
                    <BookOpen className="w-8 h-8" 
                      style={{
                        color: "var(--root-cards-icon-placeholder)",
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-col justify-between flex-1 p-4 py-5 min-w-0">
                <div className="space-y-1.5">
                  <h3 className="text-lg  font-bold leading-tight line-clamp-1"
                    style={{
                      color: 'rgb(var(--text_header))',
                    }}
                  >
                    {exercise.title || <span className=" italic font-normal">Untitled</span>}
                  </h3>
                </div>

                {/* Footer containing Badge and Info */}
                <div className="mt-auto flex items-end justify-between gap-3">
                  {/* Difficulty Badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${config.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
                      {difficulty}
                    </span>
                  </div>

                  {/* Info Footer */}
                  <div className="flex items-baseline gap-1  px-2 py-0.5 rounded-lg "
                    style={{
                      color: "var(--root-cards-exercise-duration-color)",
                    }}
                  >
                    <span className="text-sm font-bold ">
                      {exercise.estimated_time || '0'}
                    </span>
                    <span className="text-[10px] font-medium  uppercase tracking-tighter">
                      {exercise.estimated_time_unit || 'min'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Cards;