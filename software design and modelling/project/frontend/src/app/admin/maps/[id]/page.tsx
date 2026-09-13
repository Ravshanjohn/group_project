'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Search, BookOpen } from 'lucide-react';
import { admin_api } from '@/src/api/admin.api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/src/components/LoadingSpinner';

interface Exercise {
  id: number;
  name: string;
  status: string;
  deleted: string | null;
  language: string;
  difficulty: string;
  access_level: string;
  [key: string]: any;
}

const difficultyColor: Record<string, string> = {
  beginner: 'text-emerald-400',
  intermediate: 'text-amber-400',
  advanced: 'text-rose-400',
};

const MapDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const mapId = Number(params.id);

  const [mapExercises, setMapExercises] = useState<Exercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addSearch, setAddSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [mapId]);

  const fetchData = async () => {
    setLoading(true);
    const [mapEx, allEx] = await Promise.all([
      admin_api.getMapExercises(mapId),
      admin_api.getExercises(),
    ]);
    setMapExercises(Array.isArray(mapEx) ? mapEx : []);
    setAllExercises(Array.isArray(allEx) ? allEx : []);
    setLoading(false);
  };

  const handleAdd = async (exerciseId: number) => {
    const result = await admin_api.addExerciseToMap(mapId, exerciseId);
    if (result !== null) {
      const added = allExercises.find((e) => e.id === exerciseId);
      if (added) setMapExercises((prev) => [...prev, added]);
      toast.success('Exercise added to map');
    }
  };

  const handleRemove = async (exerciseId: number) => {
    const result = await admin_api.removeExerciseFromMap(mapId, exerciseId);
    if (result !== null) {
      setMapExercises((prev) => prev.filter((e) => e.id !== exerciseId));
      toast.success('Exercise removed from map');
    }
  };

  const mapExerciseIds = new Set(mapExercises.map((e) => e.id));

  const availableToAdd = allExercises.filter((e) => {
    if (mapExerciseIds.has(e.id)) return false;
    if (addSearch) {
      return (e.name || '').toLowerCase().includes(addSearch.toLowerCase());
    }
    return true;
  });

  const filteredMapExercises = mapExercises.filter((e) =>
    (e.name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/maps')}
          className="inline-flex items-center gap-1.5 text-sm mb-4 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: 'rgb(var(--text_option_child))' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Maps
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: 'rgb(var(--text_header))' }}
            >
              Map #{mapId}
            </h1>
            <p className="text-sm" style={{ color: 'rgb(var(--text_option_child))' }}>
              {mapExercises.length} exercise{mapExercises.length !== 1 ? 's' : ''} in this map
            </p>
          </div>
          <button
            onClick={() => setShowAddPanel(!showAddPanel)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
              showAddPanel
                ? 'bg-zinc-700 text-white'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            {showAddPanel ? 'Close' : 'Add Exercises'}
          </button>
        </div>
      </div>

      {/* Add Exercise Panel */}
      {showAddPanel && (
        <div
          className="bg-surface border rounded-xl p-5 mb-8"
          style={{ borderColor: 'var(--root-cards-border)' }}
        >
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'rgb(var(--text_option_child))' }}
          >
            Add exercises to this map
          </h3>
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'rgb(var(--text_option_child))' }}
            />
            <input
              type="text"
              placeholder="Search available exercises..."
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500"
              style={{ color: 'rgb(var(--text_header))' }}
            />
          </div>

          {availableToAdd.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'rgb(var(--text_option_child))' }}>
              {addSearch ? 'No matching exercises found' : 'All exercises are already in this map'}
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {availableToAdd.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: 'rgb(var(--text_header))' }}
                    >
                      {exercise.name}
                    </span>
                    <span
                      className="text-xs shrink-0"
                      style={{ color: 'rgb(var(--text_option_child))' }}
                    >
                      {exercise.language}
                    </span>
                    <span
                      className={`text-xs font-medium capitalize shrink-0 ${difficultyColor[exercise.difficulty] || ''}`}
                    >
                      {exercise.difficulty}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAdd(exercise.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer transition-colors shrink-0 ml-3"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search current exercises */}
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'rgb(var(--text_option_child))' }}
        />
        <input
          type="text"
          placeholder="Search map exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500"
          style={{ color: 'rgb(var(--text_header))' }}
        />
      </div>

      {/* Map Exercises Table */}
      <div
        className="bg-surface border rounded-xl overflow-hidden"
        style={{ borderColor: 'var(--root-cards-border)' }}
      >
        <div
          className="hidden md:grid grid-cols-[1fr_100px_120px_100px_80px] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider border-b"
          style={{
            color: 'rgb(var(--text_option_child))',
            borderColor: 'var(--root-cards-border)',
          }}
        >
          <span>Exercise</span>
          <span>Language</span>
          <span>Difficulty</span>
          <span>Access</span>
          <span className="text-right">Remove</span>
        </div>

        {filteredMapExercises.length === 0 ? (
          <div className="px-6 py-12 text-center flex flex-col items-center gap-3">
            <BookOpen className="w-8 h-8" style={{ color: 'rgb(var(--text_option_child))' }} />
            <p className="text-sm" style={{ color: 'rgb(var(--text_option_child))' }}>
              {search ? 'No exercises match your search' : 'No exercises in this map yet'}
            </p>
          </div>
        ) : (
          filteredMapExercises.map((exercise, i) => {
            const isDeactivated = !!exercise.deleted;

            return (
              <div
                key={exercise.id}
                className={`grid grid-cols-1 md:grid-cols-[1fr_100px_120px_100px_80px] gap-2 md:gap-4 px-6 py-4 items-center transition-colors hover:bg-zinc-800/30 ${
                  i < filteredMapExercises.length - 1 ? 'border-b' : ''
                } ${isDeactivated ? 'opacity-40' : ''}`}
                style={{ borderColor: 'var(--root-cards-border)' }}
              >
                <div>
                  <span
                    className={`font-medium text-sm ${isDeactivated ? 'line-through' : ''}`}
                    style={{ color: 'rgb(var(--text_header))' }}
                  >
                    {exercise.name}
                  </span>
                  <span
                    className="block md:hidden text-xs mt-0.5"
                    style={{ color: 'rgb(var(--text_option_child))' }}
                  >
                    {exercise.language} &middot; {exercise.difficulty}
                  </span>
                </div>

                <span
                  className="hidden md:block text-sm"
                  style={{ color: 'rgb(var(--text_option_child))' }}
                >
                  {exercise.language || '—'}
                </span>

                <span
                  className={`hidden md:block text-sm font-medium capitalize ${
                    difficultyColor[exercise.difficulty] || ''
                  }`}
                >
                  {exercise.difficulty}
                </span>

                <span
                  className={`hidden md:block text-xs font-semibold px-2 py-1 rounded-md w-fit ${
                    exercise.access_level === 'public'
                      ? 'text-emerald-400 bg-emerald-400/10'
                      : 'text-rose-400 bg-rose-400/10'
                  }`}
                >
                  {exercise.access_level === 'public' ? 'Public' : 'Private'}
                </span>

                <div className="md:text-right">
                  <button
                    onClick={() => handleRemove(exercise.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="mt-4 text-xs text-center" style={{ color: 'rgb(var(--text_option_child))' }}>
        {filteredMapExercises.length} exercise{filteredMapExercises.length !== 1 ? 's' : ''} in this map
      </p>
    </div>
  );
};

export default MapDetailPage;
