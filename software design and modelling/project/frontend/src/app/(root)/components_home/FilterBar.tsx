'use client';
import React from 'react';
import { ChevronDown, Check, RotateCcw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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
    id: 'skill',
    title: 'Difficulty',
    options: [
      { label: 'Beginner', value: 'beginner' },
      { label: 'Intermediate', value: 'intermediate' },
      { label: 'Advanced', value: 'advanced' },
    ],
  },
  {
    id: 'status',
    title: 'Status',
    options: [
      { label: 'Completed', value: 'completed' },
      { label: 'Not Completed', value: 'not_completed' },
    ],
    type: 'radio',
  },
  {
    id: 'access',
    title: 'Access',
    options: [
      { label: 'Free', value: 'free' },
      { label: 'Premium', value: 'premium' },
    ],
    type: 'radio',
  },
];

interface FilterBarProps {
  activeFilters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
}

const FilterBar = ({ activeFilters, onFiltersChange }: FilterBarProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!filterBarRef.current) return;
      if (!filterBarRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const toggleFilter = (categoryId: string, value: string) => {
    const category = filterCategories.find(c => c.id === categoryId);
    const current = activeFilters[categoryId] || [];

    let updated: string[];
    if (category?.type === 'radio') {
      updated = current.includes(value) ? [] : [value];
    } else {
      updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
    }

    onFiltersChange({ ...activeFilters, [categoryId]: updated });
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown((current) => current === id ? null : id);
  };

  const handleBarClick = () => {
    if (openDropdown) {
      setOpenDropdown(null);
    }
  };

  const resetFilters = () => {
    onFiltersChange({});
  };

  const hasAnyFilter = Object.values(activeFilters).some(arr => arr.length > 0);

  return (
    <div
      ref={filterBarRef}
      onClick={handleBarClick}
      className="bg-surface w-full surface-border rounded-xl p-4 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold"
          style={{ color: 'rgb(var(--text_header))' }}
        >Filters</h3>
        {hasAnyFilter && (
          <button
            onClick={resetFilters}
            className="flex text-xs items-center gap-1 px-3 py-1 rounded-md transition-colors hover:bg-zinc-800"
            style={{ color: 'rgb(var(--text_header))' }}
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>
      <div className="flex gap-4">
        {filterCategories.map((category) => (
          <div key={category.id} className="relative group">
            <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
              style={{ color: 'rgb(var(--text_header_secondary))' }}
            >
              {category.title}
            </div>

            <button
              onClick={() => toggleDropdown(category.id)}
              className={`w-full min-w-[140px] text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between border ${
                openDropdown === category.id ? 'bg-zinc-800' : 'bg-surface'
              }`}
              style={{
                borderColor: openDropdown === category.id
                  ? "var(--filter-option-bar-selected-border-color)"
                  : "var(--filter-option-bar-border-color)",
                color: openDropdown === category.id
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
                className={`ml-2 transition-transform duration-200 ${
                  openDropdown === category.id ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdown === category.id && (
              <div className="bg-secondary absolute top-full left-0 mt-2 w-48 surface-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="p-1 max-h-60 overflow-y-auto">
                  {category.options.map((option) => {
                    const isSelected = activeFilters[category.id]?.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => toggleFilter(category.id, option.value)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'filter-option-bar-selected'
                            : 'bg-secondary filter-option-bar:hover'
                        }`}
                      >
                        {option.label}
                        {isSelected && <Check size={14} style={{ color: "var(--filter-option-tick_mark-color)" }} />}
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
