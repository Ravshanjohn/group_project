'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ResetConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ResetConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
}: ResetConfirmationModalProps) {
  const [focusedButton, setFocusedButton] = useState<0 | 1>(0); // 0 = Cancel, 1 = Reset Code

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setFocusedButton(0); 
        onCancel();
      }

      // Left/Right arrow keys to switch between buttons
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setFocusedButton(0); // Move to Cancel
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setFocusedButton(1); // Move to Reset Code
      }

      // Enter to activate the focused button
      if (event.key === 'Enter') {
        event.preventDefault();
        if (focusedButton === 0) {
          onCancel();
        } else {
          onConfirm();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirm, focusedButton]);

  if (!isOpen) return null;

  return (
    <>
      {/* Blurred Background */}
      <div
        className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-700">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-white">Reset Code</h2>
            </div>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-zinc-300 mb-2">
              Are you sure you want to reset your code to the initial template?
            </p>
            <p className="text-zinc-400 text-sm">
              This action will overwrite your current code and cannot be undone.
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-zinc-700">
            <button
              onClick={onCancel}
              className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium ${
                focusedButton === 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : 'bg-zinc-700 hover:bg-blue-600 text-zinc-300 opacity-75 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105'
              }`}
              title="Cancel (← or ESC)"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium  ${
                focusedButton === 1
                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/50 scale-105'
                  : 'bg-zinc-700 hover:bg-orange-600 text-zinc-300 opacity-75 hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105'
              }`}
              title="Reset Code (→)"
            >
              Reset Code
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
