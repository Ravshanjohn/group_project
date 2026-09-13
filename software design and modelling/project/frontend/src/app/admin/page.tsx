'use client';

import { useRouter } from 'next/navigation';
import { Map, BookOpen, BarChart3, ChevronRight } from 'lucide-react';

const adminSections = [
  {
    title: 'Maps',
    description: 'View and manage roadmaps — add or remove exercises from each map',
    icon: Map,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    href: '/admin/maps',
  },
  {
    title: 'Exercises',
    description: 'Manage all exercises — change status, difficulty, access level, and activation',
    icon: BookOpen,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    href: '/admin/exercises',
  },
];

const AdminPage = () => {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-7 h-7" style={{ color: 'rgb(var(--text_header))' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--text_header))' }}>
            Admin Dashboard
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'rgb(var(--text_option_child))' }}>
          Manage platform content and monitor statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminSections.map((section) => (
          <div
            key={section.title}
            onClick={() => router.push(section.href)}
            className="bg-surface border rounded-2xl p-8 cursor-pointer group hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-300"
            style={{ borderColor: 'var(--root-cards-border)' }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-xl ${section.bg} flex items-center justify-center`}>
                <section.icon className={`w-7 h-7 ${section.color}`} />
              </div>
              <ChevronRight
                className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'rgb(var(--text_option_child))' }}
              />
            </div>
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: 'rgb(var(--text_header))' }}
            >
              {section.title}
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'rgb(var(--text_option_child))' }}
            >
              {section.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
