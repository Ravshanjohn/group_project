'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Lock, Star, Clock, ChevronRight, CheckCircle, Coins } from 'lucide-react';
import { exercises_api } from '@/src/api/exercises.api';
import { user_exercise_api } from '@/src/api/user.exercise.api';
import { auth_store } from '@/src/stores/auth.store';
import LoadingSpinner from '@/src/components/LoadingSpinner';

interface MapData {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  price: number;
  difficulty: string;
  estimated_hours: number;
  tags: string[] | null;
  exercises_id: number[] | null;
  [key: string]: any;
}

const difficultyConfig: Record<string, { badge: string; dot: string }> = {
  beginner: {
    badge: 'text-emerald-400 ring-1 ring-emerald-500/40',
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

const MyPathsPage = () => {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [subscribedMapIds, setSubscribedMapIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingMapId, setBuyingMapId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium' | 'subscribed'>('all');
  const user = auth_store((s) => s.user);
  const { buyMap, getBalance, getUser } = auth_store();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mapsData, subscribed] = await Promise.all([
          exercises_api.getMaps(),
          user_exercise_api.getUserSubscribedMaps(),
        ]);
        await getUser();
        await getBalance();
        setMaps(mapsData);
        setSubscribedMapIds(Array.isArray(subscribed) ? subscribed.map((s: any) => s.map_id ?? s) : []);
      } catch (error) {
        console.error('Error fetching maps:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBuyMap = async (map: MapData) => {
    if (!user) return;
    if (user.balance < map.price) return;

    setBuyingMapId(map.id);
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const success = await buyMap(map.id, map.price, expiresAt.toISOString());
    if (success) {
      setSubscribedMapIds((prev) => [...prev, map.id]);
      await getBalance();
    }
    setBuyingMapId(null);
  };

  const filtered = maps.filter((m) => {
    if (filter === 'free') return !m.price || m.price === 0;
    if (filter === 'premium') return m.price > 0;
    if (filter === 'subscribed') return subscribedMapIds.includes(m.id);
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: 'rgb(var(--text_header))' }}
          >
            My Paths
          </h1>
          <p
            className="text-base"
            style={{ color: 'rgb(var(--text_option_child))' }}
          >
            Pick a learning path and master it through guided exercises
          </p>
        </div>
        {user && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ backgroundColor: 'var(--zinc_900)', border: '1px solid var(--zinc_800)' }}
          >
            <Coins size={16} style={{ color: 'var(--blue_400)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--white)' }}>
              {user.balance ?? 0}
            </span>
            <span className="text-xs" style={{ color: 'var(--zinc_500)' }}>XP</span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 mb-8">
        {(['all', 'free', 'premium', 'subscribed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              filter === f
                ? 'bg-zinc-700 text-white'
                : 'hover:bg-zinc-800'
            }`}
            style={{
              color: filter === f ? undefined : 'rgb(var(--text_option_child))',
            }}
          >
            {f === 'all' ? 'All Paths' : f === 'free' ? 'Free' : f === 'premium' ? 'Premium' : 'Subscribed'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <p style={{ color: 'rgb(var(--text_option_child))' }}>
            {filter === 'subscribed' ? 'No subscribed paths yet. Browse and subscribe to get started.' : 'No paths available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((map) => {
            const difficulty = map.difficulty?.toLowerCase() || 'beginner';
            const config = difficultyConfig[difficulty] || difficultyConfig.beginner;
            const isSubscribed = subscribedMapIds.includes(map.id);
            const isFree = !map.price || map.price === 0;
            const exerciseCount = map.exercises_id?.length ?? 0;
            const canAfford = user ? user.balance >= map.price : false;

            return (
              <div
                key={map.id}
                className="bg-surface border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-300 group"
                style={{ borderColor: 'var(--root-cards-border)' }}
              >
                <div className="p-6">
                  {/* Top Row */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-zinc-800">
                      {map.icon ? (
                        <i className={map.icon} style={{ fontSize: '1.4rem', color: 'rgb(var(--text_header))' }} />
                      ) : (
                        <BookOpen size={20} style={{ color: 'rgb(var(--text_header))' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="text-lg font-bold leading-tight truncate"
                          style={{ color: 'rgb(var(--text_header))' }}
                        >
                          {map.name}
                        </h3>
                        {isSubscribed && (
                          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md text-xs font-semibold shrink-0">
                            <CheckCircle size={12} />
                            Subscribed
                          </span>
                        )}
                        {!isFree && !isSubscribed && (
                          <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md text-xs font-semibold shrink-0">
                            <Star size={12} />
                            PRO
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      className="w-5 h-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'rgb(var(--text_option_child))' }}
                    />
                  </div>

                  {/* Description */}
                  {map.description && (
                    <p
                      className="text-sm leading-relaxed mb-4 line-clamp-2"
                      style={{ color: 'rgb(var(--text_option_child))' }}
                    >
                      {map.description}
                    </p>
                  )}

                  {/* Tags */}
                  {map.tags && map.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {map.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-md bg-zinc-800/60"
                          style={{ color: 'rgb(var(--text_option_child))' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${config.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
                        {difficulty}
                      </span>
                      {exerciseCount > 0 && (
                        <div
                          className="flex items-center gap-1 text-xs"
                          style={{ color: 'rgb(var(--text_option_child))' }}
                        >
                          <BookOpen size={14} />
                          <span className="font-medium">{exerciseCount} exercises</span>
                        </div>
                      )}
                      {map.estimated_hours > 0 && (
                        <div
                          className="flex items-center gap-1 text-xs"
                          style={{ color: 'rgb(var(--text_option_child))' }}
                        >
                          <Clock size={14} />
                          <span className="font-medium">{map.estimated_hours}h</span>
                        </div>
                      )}
                    </div>

                    {/* Buy / Status Button */}
                    {!isSubscribed && !isFree && (
                      <button
                        onClick={() => handleBuyMap(map)}
                        disabled={!canAfford || buyingMapId === map.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: canAfford ? 'var(--blue_600)' : 'var(--zinc_800)',
                          color: 'var(--white)',
                        }}
                        title={!canAfford ? `Need ${map.price} XP (you have ${user?.balance ?? 0})` : ''}
                      >
                        {buyingMapId === map.id ? (
                          'Purchasing...'
                        ) : !canAfford ? (
                          <>
                            <Lock size={12} />
                            {map.price} XP
                          </>
                        ) : (
                          <>
                            <Coins size={12} />
                            Buy for {map.price} XP
                          </>
                        )}
                      </button>
                    )}
                    {isFree && !isSubscribed && (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ color: 'var(--emerald_400)', backgroundColor: 'rgba(52, 211, 153, 0.1)' }}>
                        Free
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPathsPage;
