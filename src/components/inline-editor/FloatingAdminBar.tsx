'use client';

import { useState } from 'react';
import { AlertCircle, Cloud, CloudOff, Eye, EyeOff, Trash2, Upload } from 'lucide-react';

interface FloatingAdminBarProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onPublish: () => void;
  onDiscard: () => void;
  isPublishing: boolean;
  lastSaved?: Date | null;
  saveError?: string | null;
  hasPendingChanges?: boolean;
}

export function FloatingAdminBar({
  isEditMode,
  onToggleEditMode,
  hasUnsavedChanges,
  isSaving,
  onPublish,
  onDiscard,
  isPublishing,
  lastSaved,
  saveError,
  hasPendingChanges,
}: FloatingAdminBarProps) {
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const handleDiscard = () => {
    if (showDiscardConfirm) {
      onDiscard();
      setShowDiscardConfirm(false);
    } else {
      setShowDiscardConfirm(true);
      // Auto-hide after 3s
      setTimeout(() => setShowDiscardConfirm(false), 3000);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gray-900 text-white rounded-full px-4 py-2 shadow-2xl flex items-center gap-3">
        {/* Edit Mode Toggle */}
        <button
          onClick={onToggleEditMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
            isEditMode
              ? 'bg-yellow-500 text-gray-900'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isEditMode ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span className="text-sm font-medium">Ukončit úpravy</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Režim úprav</span>
            </>
          )}
        </button>

        {/* Save Status - only show when relevant (editing, saving, or has changes) */}
        {(isEditMode || isSaving || hasPendingChanges || hasUnsavedChanges || saveError || lastSaved) && (
          <>
            {/* Separator */}
            <div className="w-px h-6 bg-gray-600" />

            {/* Save Status */}
            <div className="flex items-center gap-2 text-sm">
              {saveError ? (
                <>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400" title={saveError}>Chyba ukládání!</span>
                </>
              ) : isSaving ? (
                <>
                  <Cloud className="w-4 h-4 animate-pulse text-yellow-400" />
                  <span className="text-gray-300">Ukládám...</span>
                </>
              ) : hasPendingChanges ? (
                <>
                  <CloudOff className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span className="text-yellow-400">Neuložené...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <CloudOff className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400">Nepublikováno</span>
                </>
              ) : lastSaved ? (
                <>
                  <Cloud className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">
                    Uloženo {lastSaved.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              ) : null}
            </div>
          </>
        )}

        {/* Actions - only show when there are changes */}
        {hasUnsavedChanges && (
          <>
            <div className="w-px h-6 bg-gray-600" />

            {/* Discard Button */}
            <button
              onClick={handleDiscard}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                showDiscardConfirm
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">
                {showDiscardConfirm ? 'Potvrdit?' : 'Zahodit'}
              </span>
            </button>

            {/* Publish Button - disabled if error or pending changes */}
            <button
              onClick={onPublish}
              disabled={isPublishing || !!saveError || hasPendingChanges || isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors"
              title={saveError ? 'Opravte chybu před publikováním' : hasPendingChanges ? 'Počkejte na uložení' : undefined}
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isPublishing ? 'Publikuji...' : 'Publikovat'}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
