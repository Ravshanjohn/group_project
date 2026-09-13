'use client';

import Link from 'next/link';

const shortcutGroups = [
  {
    title: 'Exercise editor',
    items: [
      { keys: 'Ctrl/Cmd + S', description: 'Save the current code' },
      { keys: 'Ctrl/Cmd + R', description: 'Reset the editor to the initial solution' },
      { keys: 'Ctrl/Cmd + Enter', description: 'Run the exercise test cases' },
    ],
  },
  {
    title: 'Navigation',
    items: [
      { keys: 'Esc', description: 'Close active modal or panel' },
      { keys: 'Home', description: 'Return to the main dashboard' },
    ],
  },
];

export default function ShortcutsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Workspace</p>
          <h1 className="text-3xl font-bold text-white">Shortcuts</h1>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:text-white"
        >
          Back home
        </Link>
      </div>

      <div className="space-y-6">
        {shortcutGroups.map((group) => (
          <section
            key={group.title}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg"
          >
            <h2 className="mb-4 text-lg font-semibold text-white">{group.title}</h2>

            <div className="space-y-3">
              {group.items.map((item) => (
                <div
                  key={item.keys}
                  className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3"
                >
                  <span className="text-sm text-zinc-300">{item.description}</span>
                  <kbd className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-white">
                    {item.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
