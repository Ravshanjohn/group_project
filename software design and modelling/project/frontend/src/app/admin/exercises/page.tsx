'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, BookOpen, BarChart3, Search, Power, CircleDot, ArrowLeft, Coins } from 'lucide-react';
import { admin_api } from '@/src/api/admin.api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { useRouter } from 'next/navigation';

interface Exercise {
  id: number;
  name: string;
  status: string;
  deleted: string | null;
  language: string;
  difficulty: string;
  access_level: string;
  price?: number | null;
  xp_need?: number | null;
  [key: string]: any;
}

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

const difficultyColor: Record<string, string> = {
  beginner: 'text-emerald-400',
  intermediate: 'text-amber-400',
  advanced: 'text-rose-400',
};

const statusColor: Record<string, string> = {
  available: 'text-emerald-400 bg-emerald-400/10',
  draft: 'text-zinc-400 bg-zinc-400/10',
  archived: 'text-amber-400 bg-amber-400/10',
};

const AdminExercisesPage = () => {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAccess, setFilterAccess] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'deactivated'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [editingPrices, setEditingPrices] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchExercises();
  }, []);

  const sortExercisesById = (items: Exercise[]) =>
    [...items].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

  const fetchExercises = async () => {
    setLoading(true);
    const data = await admin_api.getExercises();
    setExercises(sortExercisesById(data));
    setLoading(false);
  };

  const handleAccessChange = async (exerciseId: number, newAccess: string) => {
    const result = await admin_api.changeExerciseStatus(exerciseId, newAccess);
    if (result !== null) {
      setExercises((prev) =>
        prev.map((e) => (e.id === exerciseId ? { ...e, access_level: newAccess } : e))
      );
      toast.success('Access level updated');
    }
  };

  const handleDifficultyChange = async (exerciseId: number, newDifficulty: string) => {
    const result = await admin_api.changeExerciseDifficulty(exerciseId, newDifficulty);
    if (result !== null) {
      setExercises((prev) =>
        prev.map((e) => (e.id === exerciseId ? { ...e, difficulty: newDifficulty } : e))
      );
      toast.success('Difficulty updated');
    }
  };

  const handlePriceChange = async (exerciseId: number, newPrice: number) => {
    const safePrice = Number.isFinite(newPrice) ? Math.max(0, newPrice) : 0;

    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId
          ? { ...e, price: safePrice, xp_need: safePrice }
          : e
      )
    );

    const result = await admin_api.changeExercisePrice(exerciseId, safePrice);
    if (result !== null) {
      setEditingPrices((prev) => ({ ...prev, [exerciseId]: String(safePrice) }));
      toast.success('XP price updated');
    }
  };

  const handlePriceInputFocus = (exerciseId: number, currentValue: number) => {
    if (currentValue === 0) {
      setEditingPrices((prev) => ({ ...prev, [exerciseId]: '' }));
    }
  };

  const handlePriceInputChange = (exerciseId: number, rawValue: string) => {
    setEditingPrices((prev) => ({ ...prev, [exerciseId]: rawValue }));
  };

  const handlePriceInputBlur = async (exerciseId: number) => {
    const rawValue = editingPrices[exerciseId] ?? '';
    const safeValue = rawValue === '' ? 0 : Number(rawValue);

    if (!Number.isFinite(safeValue)) {
      setEditingPrices((prev) => ({ ...prev, [exerciseId]: String(0) }));
      return;
    }

    await handlePriceChange(exerciseId, safeValue);
  };

  const handleToggleActive = async (exerciseId: number) => {
    const result = await admin_api.toggleExerciseActive(exerciseId);
    if (result !== null) {
      setExercises((prev) =>
        prev.map((e) =>
          e.id === exerciseId
            ? { ...e, deleted: e.deleted ? null : new Date().toISOString() }
            : e
        )
      );
      toast.success('Exercise toggled');
    }
  };

  const languages = Array.from(new Set(exercises.map((e) => e.language).filter(Boolean)));
  const statuses = Array.from(new Set(exercises.map((e) => e.status).filter(Boolean)));

  const filtered = sortExercisesById(exercises).filter((e) => {
    const matchesSearch = (e.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesAccess = filterAccess === 'all' || e.access_level === filterAccess;
    const matchesDifficulty = filterDifficulty === 'all' || e.difficulty === filterDifficulty;
    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && !e.deleted) ||
      (filterActive === 'deactivated' && !!e.deleted);
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    const matchesLanguage = filterLanguage === 'all' || e.language === filterLanguage;
    return matchesSearch && matchesAccess && matchesDifficulty && matchesActive && matchesStatus && matchesLanguage;
  });

  const totalExercises = exercises.length;
  const publicCount = exercises.filter((e) => e.access_level === 'public').length;
  const privateCount = exercises.filter((e) => e.access_level === 'private').length;
  const deactivatedCount = exercises.filter((e) => !!e.deleted).length;

  const statCards = [
    { label: 'Total Exercises', value: totalExercises, icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { label: 'Public', value: publicCount, icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Private', value: privateCount, icon: EyeOff, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Deactivated', value: deactivatedCount, icon: Power, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin')}
          className="inline-flex items-center gap-1.5 text-sm mb-4 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: 'rgb(var(--text_option_child))' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </button>
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-7 h-7" style={{ color: 'rgb(var(--text_header))' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--text_header))' }}>
            Exercise Management
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'rgb(var(--text_option_child))' }}>
          Manage exercises and monitor platform statistics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border rounded-xl p-4 flex flex-col gap-2"
            style={{ borderColor: 'var(--root-cards-border)' }}
          >
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium" style={{ color: 'rgb(var(--text_option_child))' }}>
                {stat.label}
              </span>
            </div>
            <span className="text-2xl font-bold" style={{ color: 'rgb(var(--text_header))' }}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'rgb(var(--text_option_child))' }}
          />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500"
            style={{ color: 'rgb(var(--text_header))' }}
          />
        </div>

        <select
          value={filterLanguage}
          onChange={(e) => setFilterLanguage(e.target.value)}
          className="px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm cursor-pointer focus:outline-none"
          style={{ color: 'rgb(var(--text_header))' }}
        >
          <option value="all">All Languages</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm cursor-pointer focus:outline-none"
          style={{ color: 'rgb(var(--text_header))' }}
        >
          <option value="all">All Difficulty</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm cursor-pointer focus:outline-none"
          style={{ color: 'rgb(var(--text_header))' }}
        >
          <option value="all">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filterAccess}
          onChange={(e) => setFilterAccess(e.target.value)}
          className="px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm cursor-pointer focus:outline-none"
          style={{ color: 'rgb(var(--text_header))' }}
        >
          <option value="all">All Access</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value as any)}
          className="px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm cursor-pointer focus:outline-none"
          style={{ color: 'rgb(var(--text_header))' }}
        >
          <option value="all">All State</option>
          <option value="active">Active</option>
          <option value="deactivated">Deactivated</option>
        </select>
      </div>

      {/* Exercises Table */}
      <div
        className="bg-surface border rounded-xl overflow-hidden overflow-x-auto"
        style={{ borderColor: 'var(--root-cards-border)' }}
      >
        <div
          className="hidden md:grid grid-cols-[1fr_100px_130px_80px_100px_110px_90px_120px] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider border-b min-w-[900px]"
          style={{
            color: 'rgb(var(--text_option_child))',
            borderColor: 'var(--root-cards-border)',
          }}
        >
          <span>Exercise</span>
          <span>Language</span>
          <span>Difficulty</span>
          <span>Price</span>
          <span>Status</span>
          <span>Access</span>
          <span>State</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm" style={{ color: 'rgb(var(--text_option_child))' }}>
              No exercises match your filters
            </p>
          </div>
        ) : (
          filtered.map((exercise, i) => {
            const isDeactivated = !!exercise.deleted;

            return (
              <div
                key={exercise.id}
                className={`grid grid-cols-1 md:grid-cols-[1fr_100px_130px_80px_100px_110px_90px_120px] gap-2 md:gap-4 px-6 py-4 items-center transition-colors hover:bg-zinc-800/30 min-w-[900px] ${
                  i < filtered.length - 1 ? 'border-b' : ''
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
                    {exercise.language} &middot; {exercise.difficulty} &middot; {exercise.access_level}
                  </span>
                </div>

                <span
                  className="hidden md:block text-sm"
                  style={{ color: 'rgb(var(--text_option_child))' }}
                >
                  {exercise.language || '—'}
                </span>

                <div className="hidden md:block">
                  <select
                    value={exercise.difficulty || 'beginner'}
                    onChange={(e) => handleDifficultyChange(exercise.id, e.target.value)}
                    disabled={isDeactivated}
                    className={`text-sm font-medium capitalize px-2 py-1 rounded-md bg-transparent border border-zinc-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-500 ${
                      difficultyColor[exercise.difficulty] || ''
                    } ${isDeactivated ? 'cursor-not-allowed' : ''}`}
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d} className="bg-zinc-900 text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price (XP) Input */}
                <div className="hidden md:block">
                  <input
                    type="number"
                    min="0"
                    value={
                      editingPrices[exercise.id] ??
                      String(exercise.price ?? exercise.xp_need ?? 0)
                    }
                    onFocus={() =>
                      handlePriceInputFocus(
                        exercise.id,
                        Number(exercise.price ?? exercise.xp_need ?? 0)
                      )
                    }
                    onChange={(e) => handlePriceInputChange(exercise.id, e.target.value)}
                    onBlur={() => handlePriceInputBlur(exercise.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePriceInputBlur(exercise.id);
                      }
                    }}
                    disabled={isDeactivated}
                    className={`w-full text-sm font-medium px-2 py-1 rounded-md bg-transparent border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500 text-amber-400 ${
                      isDeactivated ? 'cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                <div className="hidden md:block">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md capitalize ${
                      statusColor[exercise.status] || 'text-zinc-400 bg-zinc-400/10'
                    }`}
                  >
                    <CircleDot className="w-3 h-3" />
                    {exercise.status}
                  </span>
                </div>

                <div className="hidden md:block">
                  <button
                    onClick={() =>
                      handleAccessChange(
                        exercise.id,
                        exercise.access_level === 'public' ? 'private' : 'public'
                      )
                    }
                    disabled={isDeactivated}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md cursor-pointer transition-colors ${
                      exercise.access_level === 'public'
                        ? 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20'
                        : 'text-rose-400 bg-rose-400/10 hover:bg-rose-400/20'
                    } ${isDeactivated ? 'cursor-not-allowed' : ''}`}
                  >
                    {exercise.access_level === 'public' ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                    {exercise.access_level === 'public' ? 'Public' : 'Private'}
                  </button>
                </div>

                <div className="hidden md:block">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      isDeactivated
                        ? 'text-zinc-500 bg-zinc-500/10'
                        : 'text-emerald-400 bg-emerald-400/10'
                    }`}
                  >
                    {isDeactivated ? 'Inactive' : 'Active'}
                  </span>
                </div>

                <div className="md:text-right">
                  <button
                    onClick={() => handleToggleActive(exercise.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isDeactivated
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    {isDeactivated ? 'Activate' : 'Deactivate'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="mt-4 text-xs text-center" style={{ color: 'rgb(var(--text_option_child))' }}>
        Showing {filtered.length} of {exercises.length} exercises
      </p>
    </div>
  );
};

export default AdminExercisesPage;
