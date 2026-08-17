'use client';
import React, { useState } from 'react';
import { ChevronDown, Check, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterCategory {
  id: string;
  title: string;
  options: FilterOption[];
  type?: 'select' | 'checkbox' | 'radio';
}

const filterCategories: FilterCategory[] = [
  {
    id: 'language',
    title: 'Language',
    options: [
      { label: 'TypeScript', value: 'ts' },
      { label: 'JavaScript', value: 'js' },
      { label: 'MongoDB', value: 'mongo' },
      { label: 'PostgreSQL', value: 'postgres' },
    ],
  },
  {
    id: 'technology',
    title: 'Technology',
    options: [
      { label: 'Node.js', value: 'node' },
      { label: 'Next.js', value: 'next' },
      { label: 'React', value: 'react' },
      { label: 'Express', value: 'express' },
      { label: 'REST', value: 'rest' },
      { label: 'GraphQL', value: 'graphql' },
    ],
  },
  {
    id: 'skill',
    title: 'Skill Level',
    options: [
      { label: 'Beginner', value: 'beginner' },
      { label: 'Intermediate', value: 'intermediate' },
      { label: 'Advanced', value: 'advanced' },
    ],
  },
  {
    id: 'topic',
    title: 'Topic',
    options: [
      { label: 'DSA', value: 'dsa' },
      { label: 'Backend', value: 'backend' },
      { label: 'Frontend', value: 'frontend' },
      { label: 'Full Stack', value: 'full_stack' },
      { label: 'Database', value: 'db' },
    ],
  },
  {
    id: 'duration',
    title: 'Duration',
    options: [
      { label: '< 30 min', value: 'short' },
      { label: '30-60 min', value: 'medium' },
      { label: '> 1 hour', value: 'long' },
    ],
  },
  {
    id: 'popularity',
    title: 'Popularity',
    options: [
      { label: 'Top Rated', value: 'top_rated' },
      { label: 'Most Solved', value: 'most_solved' },
      { label: 'Most Viewed', value: 'most_viewed' },
      { label: 'Community Fav', value: 'community_fav' },
    ],
  },
  {
    id: 'date',
    title: 'Date',
    options: [
      { label: 'Newest', value: 'new' },
      { label: 'Oldest', value: 'old' },
    ],
    type: 'radio',
  },
  {
    id: 'status',
    title: 'Status',
    options: [
      { label: 'Solved', value: 'done' },
      { label: "In Progress", value: 'in_progress' },
      { label: 'Not Solved', value: 'not_done' },
    ],
    type: 'radio',
  },
];

const FilterBar = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();

  const toggleFilter = (categoryId: string, value: string) => {
    const category = filterCategories.find(c => c.id === categoryId);
    setActiveFilters((prev) => {
      const current = prev[categoryId] || [];
      
      // For radio buttons, only allow one selection
      if (category?.type === 'radio') {
        const updated = current.includes(value) ? [] : [value];
        return { ...prev, [categoryId]: updated };
      }
      
      // For checkboxes, allow multiple selections
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [categoryId]: updated };
    });
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const resetFilters = () => {
    setActiveFilters({});
    router.replace('?');
  };

  return (
    <div 
      className="bg-surface w-full surface-border rounded-xl p-4 shadow-lg "
      
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold"
          style = {{
            color: 'rgb(var(--text_header))',
          }}
        >Filters</h3>
        <button
          onClick={resetFilters}
          className="flex text-xs items-center gap-1 px-3 py-1 rounded-md transition-colors"
            style={{
              color: 'rgb(var(--text_header))',
            }}
          >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {filterCategories.map((category) => (
          <div key={category.id} className="relative group">
            {/* Header (Top Row) */}
            <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
              style={{
                color: 'rgb(var(--text_header_secondary))',
              }}
            >
              {category.title}
            </div>
            
            {/* Options (Bottom Row - Dropdown Trigger) */}
            <button
              onClick={() => toggleDropdown(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between border 
                ${openDropdown === category.id
                  ? 'bg-zinc-800'
                  : 'bg-surface'
                }`}
              style={{ 
                borderColor:
                  openDropdown === category.id
                    ? "var(--filter-option-bar-selected-border-color)" 
                    : "var(--filter-option-bar-border-color)", 

                color:
                  openDropdown === category.id
                    ? "var(--filter-option-bar-selected-text-color)" 
                    : "rgb(var(--text_option_header))", 
              }}   
            >   
              <div className="truncate">
                {activeFilters[category.id]?.length > 0 
                  ? category.type === 'radio'
                    ? category.options.find(o => o.value === activeFilters[category.id][0])?.label ?? 'Any'
                    : `${activeFilters[category.id].length} selected`
                  : 'Any'}
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  openDropdown === category.id ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {openDropdown === category.id && (
              <div className="bg-secondary absolute top-full left-0 mt-2 w-48 surface-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
                  {category.options.map((option) => {
                    const isSelected = activeFilters[category.id]?.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => toggleFilter(category.id, option.value)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors 
                          ${isSelected
                            ? 'filter-option-bar-selected'
                            : 'bg-secondary filter-option-bar:hover'
                          }`}
                      >
                        {option.label}
                        {isSelected && <Check size={14} style={{color: "var(--filter-option-tick_mark-color)"}} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
               
          </div>
        ))}

        
      </div>
    </div>
  );
};

export default FilterBar;
