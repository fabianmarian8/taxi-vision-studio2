'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { Pencil, Save, X, Loader2, Check } from 'lucide-react';

// City draft data
export interface CityDraftData {
  name?: string;
  description?: string;
  meta_description?: string;
  keywords?: string[];
  hero_image?: string;
  [key: string]: string | string[] | undefined;
}

interface CityEditorContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  draftData: CityDraftData;
  saveField: (fieldKey: string, value: string | string[]) => Promise<void>;
  isSaving: boolean;
  lastSaved: Date | null;
}

export const CityEditorContext = createContext<CityEditorContextType | null>(null);

export function useCityEditor() {
  const context = useContext(CityEditorContext);
  if (!context) {
    // Return null context for non-admin users
    return null;
  }
  return context;
}

interface CityEditorProviderProps {
  children: ReactNode;
  initialData: Partial<CityDraftData>;
  isAdmin: boolean;
  citySlug: string;
}

export function CityEditorProvider({
  children,
  initialData,
  isAdmin,
  citySlug,
}: CityEditorProviderProps) {
  // Editor state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Draft data
  const [draftData, setDraftData] = useState<CityDraftData>({
    name: initialData.name || '',
    description: initialData.description || '',
    meta_description: initialData.meta_description || '',
    keywords: initialData.keywords || [],
    hero_image: initialData.hero_image || '',
  });

  // Original data for comparison
  const originalDataRef = useRef(draftData);

  // Debounce timer ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Record<string, unknown>>({});

  // Save to API
  const saveToApi = useCallback(async (changes: Record<string, unknown>): Promise<boolean> => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/city/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city_slug: citySlug,
          changes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLastSaved(new Date());
        setHasPendingChanges(false);
        setSaveError(null);
        // Update original data reference
        originalDataRef.current = { ...originalDataRef.current, ...changes } as CityDraftData;
        return true;
      } else {
        setSaveError(result.error || 'Chyba pri ukladaní');
        setHasPendingChanges(true);
        return false;
      }
    } catch (error) {
      console.error('[CityEditor] Save error:', error);
      setSaveError('Chyba siete');
      setHasPendingChanges(true);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [citySlug]);

  // Debounced save
  const debouncedSave = useCallback((fieldKey: string, value: unknown) => {
    pendingChangesRef.current[fieldKey] = value;
    setHasPendingChanges(true);
    setSaveError(null);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      const changes = { ...pendingChangesRef.current };
      pendingChangesRef.current = {};
      saveToApi(changes);
    }, 1000);
  }, [saveToApi]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Save field value
  const saveField = useCallback(async (fieldKey: string, value: string | string[]) => {
    setDraftData((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
    debouncedSave(fieldKey, value);
  }, [debouncedSave]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  // Discard changes
  const handleDiscard = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    pendingChangesRef.current = {};
    setDraftData({ ...originalDataRef.current });
    setIsEditMode(false);
    setHasPendingChanges(false);
  }, []);

  // If not admin, just render children without editor functionality
  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <CityEditorContext.Provider value={{
      isEditMode,
      toggleEditMode,
      draftData,
      saveField,
      isSaving,
      lastSaved,
    }}>
      {children}

      {/* Floating City Admin Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white rounded-full shadow-2xl border border-gray-200 px-4 py-2 flex items-center gap-3">
          {/* Edit Mode Toggle */}
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
              isEditMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Pencil className="h-4 w-4" />
            {isEditMode ? 'Upravujem mesto' : 'Upraviť mesto'}
          </button>

          {/* Save status */}
          {isEditMode && (
            <>
              {isSaving && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Ukladám...</span>
                </div>
              )}

              {!isSaving && lastSaved && !hasPendingChanges && (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Uložené</span>
                </div>
              )}

              {saveError && (
                <div className="flex items-center gap-2 text-red-600">
                  <X className="h-4 w-4" />
                  <span className="text-sm">{saveError}</span>
                </div>
              )}

              {/* Discard button */}
              <button
                onClick={handleDiscard}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100 text-sm"
              >
                <X className="h-4 w-4" />
                Zrušiť
              </button>
            </>
          )}
        </div>
      </div>
    </CityEditorContext.Provider>
  );
}

// Editable City Description Component
export function EditableCityDescription({
  children,
  fieldKey = 'description',
  className = ''
}: {
  children: ReactNode;
  fieldKey?: string;
  className?: string;
}) {
  const context = useCityEditor();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // If no context (non-admin), just render children
  if (!context) {
    return <>{children}</>;
  }

  const { isEditMode, draftData, saveField } = context;

  const handleStartEdit = () => {
    setLocalValue(String(draftData[fieldKey] || ''));
    setIsEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleSave = () => {
    saveField(fieldKey, localValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!isEditMode) {
    return <>{children}</>;
  }

  if (isEditing) {
    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className={`w-full p-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[100px] ${className}`}
          placeholder="Popis mesta..."
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Save className="h-4 w-4 inline mr-1" />
            Uložiť
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
          >
            Zrušiť
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleStartEdit}
      className="relative cursor-pointer group"
    >
      <div className="absolute -inset-2 border-2 border-dashed border-blue-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -top-3 -right-3 bg-blue-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
        <Pencil className="h-3 w-3" />
      </div>
      {children}
    </div>
  );
}

// Editable City Title Component
export function EditableCityTitle({
  children,
  fieldKey = 'name',
  className = ''
}: {
  children: ReactNode;
  fieldKey?: string;
  className?: string;
}) {
  const context = useCityEditor();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!context) {
    return <>{children}</>;
  }

  const { isEditMode, draftData, saveField } = context;

  const handleStartEdit = () => {
    setLocalValue(String(draftData[fieldKey] || ''));
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = () => {
    saveField(fieldKey, localValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  if (!isEditMode) {
    return <>{children}</>;
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`w-full p-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 font-bold ${className}`}
      />
    );
  }

  return (
    <div
      onClick={handleStartEdit}
      className="relative cursor-pointer group inline-block"
    >
      <div className="absolute -inset-2 border-2 border-dashed border-blue-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -top-3 -right-3 bg-blue-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
        <Pencil className="h-3 w-3" />
      </div>
      {children}
    </div>
  );
}
