'use client';

import { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Exercise {
  id: number;
  name: string;
  slug: string;
  difficulty?: string;
  description?: string;
  instructions?: string;
  icon?: string;
  media_url?: string;
  estimated_time?: number;
  estimated_time_unit?: string;
  title?: string;
  [key: string]: any;
}

const categorySize = 'text-sm'; // Default title size

interface ResizableSidebarProps {
  width: number;
  onResize: (width: number) => void;
  exercise: Exercise;
  onClose: () => void;
}

const ResizableSidebar = ({
  width,
  onResize,
  exercise,
  onClose,
}: ResizableSidebarProps) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !sidebarRef.current) return;

      const sidebar = sidebarRef.current;
      const newWidth = e.clientX - sidebar.getBoundingClientRect().left;

      // Minimum width 10%, maximum width 70%
      if (newWidth >= window.innerWidth * 0.1 && newWidth <= window.innerWidth * 0.7) {
        onResize(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, onResize]);

  const handleMouseDown = () => {
    isResizing.current = true;
    setIsDragging(true);
  };

  return (
    <>
      <div
        ref={sidebarRef}
        style={{ width: `${width}px` }}
        className="flex flex-col bg-surface_secondary border-r border-zinc-700 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b bg-surface border-zinc-700">
          <h2 className="text-lg font-bold" style={{ color: 'rgb(var(--text_header))' }}>Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Debug: Show all exercise data */}
          <div className="text-xs text-zinc-500 bg-zinc-800 p-2 rounded hidden">
            {JSON.stringify(exercise, null, 2)}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-lg font-bold leading-snug" style={{ color: 'rgb(var(--text_header))' }}>
              {exercise.title || 'Exercise Title'}
            </h1>
          </div>

          

          {/* Description */}
          {(exercise.description || 'No description available') && (
            <div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--text_option_child))' }}>
                {exercise.description || exercise.desc || exercise.body || 'No description available'}
              </p>
            </div>
          )}

          {/* Instructions */}
          {(exercise.instructions || exercise.instruction) && (
            <div>
              <h1 className={`${categorySize} font-semibold uppercase tracking-wide mb-2`} style={{ color: 'rgb(var(--text_option_header))' }}>
                Instructions
              </h1>
              <div className="text-sm leading-relaxed" style={{ color: 'rgb(var(--text_option_child))' }}>
                <p className="whitespace-pre-wrap font-mono">
                  {exercise.instructions || exercise.instruction}
                </p>
              </div>
            </div>
          )}

          {/* Function Signature */}
          {exercise.signature && (
            <div>
              <h3 className={`${categorySize} font-semibold uppercase tracking-wide mb-3`} style={{ color: 'rgb(var(--text_option_header))' }}>
                Function Signature
              </h3>
              <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-4 font-mono text-xs text-blue-300 overflow-x-auto">
                <div className="whitespace-nowrap">
                  <span className="text-emerald-400">function</span>{' '}
                  <span className="text-yellow-300">{exercise.signature.function_name}</span>
                  <span className="text-zinc-300">(</span>
                  {exercise.signature.params_json?.map((param: any, idx: number) => (
                    <span key={idx}>
                      {idx > 0 && <span className="text-zinc-300">, </span>}
                      <span className="text-cyan-300">{param.name}</span>
                      <span className="text-zinc-300">: </span>
                      <span className="text-orange-300">{param.type}</span>
                    </span>
                  ))}
                  <span className="text-zinc-300">): </span>
                  {exercise.signature.return_type?.[0]?.type === 'array' ? (
                    <span>
                      <span className="text-orange-300">array</span>
                      <span className="text-zinc-300">&lt;</span>
                      <span className="text-orange-300">
                        {exercise.signature.return_type[0].items?.type || 'any'}
                      </span>
                      <span className="text-zinc-300">&gt;</span>
                    </span>
                  ) : (
                    <span className="text-orange-300">{exercise.signature.return_type?.[0]?.type || 'any'}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Difficulty Badge */}
          {(exercise.difficulty || exercise.level) && (
            <div>
              <h3 className={`${categorySize} font-semibold uppercase tracking-wide mb-2`} style={{ color: 'rgb(var(--text_option_header))' }}>
                Difficulty
              </h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  (exercise.difficulty)?.toLowerCase() === 'beginner'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : (exercise.difficulty)?.toLowerCase() === 'intermediate'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {((exercise.difficulty)?.charAt(0) || '').toUpperCase() +
                  ((exercise.difficult)?.slice(1) || '')}
              </span>
            </div>
          )}

          {/* Estimated Time */}
          {(exercise.estimated_time) && (
            <div>
              <h3 className={`${categorySize} font-semibold uppercase tracking-wide mb-2`} style={{ color: 'rgb(var(--text_option_header))' }}>
                Estimated Time
              </h3>
              <p className="text-sm" style={{ color: 'rgb(var(--text_option_child))' }}>
                {exercise.estimated_time}{' '}
                {exercise.estimated_time_unit ? exercise.estimated_time_unit : 'minutes'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-1 bg-zinc-800 hover:bg-blue-500 cursor-col-resize transition-colors ${
          isDragging ? 'bg-blue-500' : ''
        }`}
      />

      
    </>
  );
};

export default ResizableSidebar;
