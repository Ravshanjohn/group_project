'use client';

import { usePathname, useRouter } from "next/navigation";

const LeftSideBarMenu = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-64 shrink-0 bg-surface_secondary border-r border-zinc-800 p-6 flex flex-col gap-8">

      <div>
        <div className="flex flex-col pb-6 border-b border-gray-700/50">
          <p className="text-sm" style={{ color: 'rgb(var(--text_option_child))' }}>{`Current GP:`}</p>
          <p className="text-2xl font-bold text-emerald-400">1234</p>
        </div>

        
        <nav className="flex flex-col gap-3">
          <button
            style={{ color: 'rgb(var(--text_option_header))' }}
            className="text-left px-4 py-2 rounded-lg bg-secondary border border-zinc-700 transition-colors duration-200 hover:bg-zinc-700 font-medium"
            onClick={() => pathname !== '/games' ? router.push('/games') : null}
          >
            All  Games
          </button>
          {/* <button className="text-left px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
            My Favorites
          </button>
          <button className="text-left px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
            Recent
          </button>
          <button className="text-left px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
            Top Scores
          </button> */}
        </nav>
      </div>
    </div>
  )
}

export default LeftSideBarMenu