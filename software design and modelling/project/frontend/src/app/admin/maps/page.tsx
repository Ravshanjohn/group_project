'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Map, ArrowLeft, BookOpen } from 'lucide-react';
import { admin_api } from '@/src/api/admin.api';
import LoadingSpinner from '@/src/components/LoadingSpinner';

interface MapItem {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  language: string;
  [key: string]: any;
}

const AdminMapsPage = () => {
  const router = useRouter();
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await admin_api.getMaps();
      setMaps(data);
      setLoading(false);
    };
    fetch();
  }, []);

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
          <Map className="w-7 h-7" style={{ color: 'rgb(var(--text_header))' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--text_header))' }}>
            Maps
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'rgb(var(--text_option_child))' }}>
          Select a map to manage its exercises
        </p>
      </div>

      {maps.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm" style={{ color: 'rgb(var(--text_option_child))' }}>
            No maps available
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {maps.map((map) => (
            <div
              key={map.id}
              onClick={() => router.push(`/admin/maps/${map.id}`)}
              className="bg-surface border rounded-2xl overflow-hidden cursor-pointer group hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-300"
              style={{ borderColor: 'var(--root-cards-border)' }}
            >
              {/* Image */}
              <div className="w-full h-40 bg-zinc-800 flex items-center justify-center overflow-hidden">
                {map.image_url ? (
                  <img
                    src={map.image_url}
                    alt={map.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <BookOpen className="w-10 h-10" style={{ color: 'rgb(var(--text_option_child))' }} />
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3
                  className="text-lg font-bold mb-1 truncate"
                  style={{ color: 'rgb(var(--text_header))' }}
                >
                  {map.name}
                </h3>
                {map.language && (
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'rgb(var(--text_option_child))' }}
                  >
                    {map.language}
                  </span>
                )}
                {map.description && (
                  <p
                    className="text-sm mt-2 line-clamp-2 leading-relaxed"
                    style={{ color: 'rgb(var(--text_option_child))' }}
                  >
                    {map.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMapsPage;
