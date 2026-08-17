'use client';

import  { useState, useEffect } from 'react';
import { DBGame, difficultyConfig, Difficulty } from './games.types';
import { game_store } from '../../../stores/games.store';

type RightPanelTab = 'scores' | 'about' | 'difficulty';

interface RightSideBarMenuProps {
  selectedGame: DBGame;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

const RightSideBarMenu = ({ selectedGame }: RightSideBarMenuProps) => {
  const [activeTab, setActiveTab] = useState<RightPanelTab>('scores');
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const selectedDifficulty = game_store((state) => state.selectedDifficulty);
  const setSelectedDifficulty = game_store((state) => state.setSelectedDifficulty);
  const isGameActive = game_store((state) => state.isGameActive);
  const leaderboardRefreshTrigger = game_store((state) => state.leaderboardRefreshTrigger);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);


  const availableDifficulties = (selectedGame.available_difficulties ?? ['Easy', 'Medium', 'Hard']) as Difficulty[];

  // Fetch leaderboard when difficulty or game changes
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!selectedGame.slug) return;
      
      setLoadingLeaderboard(true);
      try {
        const data = await game_store.getState().getScoresByDifficulty(selectedDifficulty, selectedGame.slug);
        if (Array.isArray(data)) {
          // Transform backend data to match LeaderboardEntry interface
          const transformedData = data.map((entry: any, index: number) => ({
            rank: index + 1,
            username: entry.display_name || entry.first_name || 'Unknown',
            score: entry.score
          }));
          setLeaderboardData(transformedData);
        } else {
          setLeaderboardData([]);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboardData([]);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [selectedDifficulty, selectedGame.slug, leaderboardRefreshTrigger]);

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setShowDifficultyDropdown(false);
    // Switch to scores tab to show updated leaderboard
    setActiveTab('scores');
  };

  return (
    <div className="w-96 shrink-0 bg-surface_secondary border-l border-zinc-800 p-6 overflow-y-auto">
      {/* Tab buttons - Horizontal layout */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('scores')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'scores'
              ? 'bg-secondary text-white'
              : 'bg-surface_secondary text-zinc-300 hover:text-white hover:bg-secondary/60'
          }`}
        >
          Scores
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'about'
              ? 'bg-secondary text-white'
              : 'bg-surface_secondary text-zinc-400 hover:text-white hover:bg-secondary/60'
          }`}
        >
          About
        </button>
        <div className="flex-1 relative">
          <button
            onClick={() => !isGameActive && setShowDifficultyDropdown(!showDifficultyDropdown)}
            disabled={isGameActive}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isGameActive
                ? 'bg-blur_button text-zinc-500 cursor-not-allowed opacity-50'
                : activeTab === 'difficulty'
                ? 'bg-secondary text-white'
                : 'bg-surface_secondary text-zinc-400 hover:text-white hover:bg-secondary/60'
            }`}
          >
            Difficulty
          </button>
          
          {/* Difficulty Dropdown */}
          {showDifficultyDropdown && !isGameActive && (
            <div className="absolute top-full mt-2 right-0 bg-secondary border border-zinc-700 rounded-lg overflow-hidden z-50 w-40">
              {availableDifficulties.map((difficulty) => {
                const cfg = difficultyConfig[difficulty];
                return (
                  <button
                    key={difficulty}
                    onClick={() => handleDifficultySelect(difficulty)}
                    className={`w-full text-left px-4 py-2 transition-colors ${
                      selectedDifficulty === difficulty
                        ? 'bg-tertiary text-white'
                        : 'bg-secondary hover:bg-tertiary hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.badge}`}>
                        {difficulty}
                      </span>
                      {selectedDifficulty === difficulty && (
                        <span className="ml-auto text-sm">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'scores' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: 'rgb(var(--text_header))' }}>Leaderboard</h3>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyConfig[selectedDifficulty].badge}`}>
              {selectedDifficulty}
            </div>
          </div>
          
          {loadingLeaderboard ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            </div>
          ) : leaderboardData.length > 0 ? (
            <div className="space-y-3">
              {leaderboardData.map((entry) => {
                const getRankColor = (rank: number) => {
                  switch (rank) {
                    case 1:
                      return 'text-emerald-400'; 
                    case 2:
                      return 'text-emerald-200'; 
                    case 3:
                      return 'text-yellow-300'; 
                    case 4:
                      return 'text-yellow-300'; 
                    default:
                      return 'text-red-400'; 
                  }
                };

                const getRankBadge = (rank: number) => {
                  return `${rank}`;
                };

                return (
                  <div
                    key={entry.rank}
                    className="flex items-center justify-between bg-secondary/50 hover:bg-secondary border border-zinc-700 p-3 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`text-lg font-bold w-8 text-center ${getRankColor(entry.rank)}`}>
                        {getRankBadge(entry.rank)}
                      </span>
                      <div className="flex-1">
                        <span className={`text-sm font-semibold ${getRankColor(entry.rank)}`}>
                          {entry.username}
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white mx-auto">
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-zinc-400 text-sm">No scores yet for this difficulty.</p>
            </div>
          )}
        </div>
      ) : activeTab === 'about' ? (
        <div>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'rgb(var(--text_option_header))' }}>Game Name</p>
              <p style={{ color: 'rgb(var(--text_option_child))' }} className="font-medium">{selectedGame.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'rgb(var(--text_option_header))' }}>Description</p>
              <p style={{ color: 'rgb(var(--text_option_child))' }} className="text-sm leading-relaxed">
                {selectedGame.description || 'No description available yet.'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'rgb(var(--text_option_header))' }}>Difficulty Levels</p>
              <div className="flex flex-wrap gap-2">
                {availableDifficulties.map((diff) => {
                  const cfg = difficultyConfig[diff];
                  return (
                    <span
                      key={diff}
                      className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.badge}`}
                    >
                      {diff}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RightSideBarMenu;