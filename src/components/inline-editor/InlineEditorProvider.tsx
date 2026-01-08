'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { FloatingAdminBar } from './FloatingAdminBar';
import { EditorDrawer } from './EditorDrawer';
import type { FieldType } from './EditableField';

// Draft data type - all editable fields
export interface DraftData {
  company_name?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  hero_image_zoom?: number;
  hero_image_pos_x?: number;
  hero_image_pos_y?: number;
  services?: string[];
  services_description?: string;
  gallery?: string[];
  social_facebook?: string;
  social_instagram?: string;
  template_variant?: string;
  whatsapp?: string;
  booking_url?: string;
  pricelist_url?: string;
  transport_rules_url?: string;
  contact_url?: string;
  [key: string]: string | number | string[] | undefined; // Allow dynamic field access
}

interface EditorContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  draftData: DraftData;
  openEditor: (fieldKey: string, fieldType: FieldType, label: string) => void;
  saveField: (fieldKey: string, value: string | number | string[]) => Promise<void>;
  isSaving: boolean;
  lastSaved: Date | null;
}

export const EditorContext = createContext<EditorContextType | null>(null);

export function useInlineEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useInlineEditor must be used within InlineEditorProvider');
  }
  return context;
}

interface InlineEditorProviderProps {
  children: ReactNode;
  initialData: Partial<DraftData>;
  isOwner: boolean;
  // Nové props pre API integráciu
  partnerId?: string | null;
  draftId?: string | null;
  partnerSlug?: string;
  citySlug?: string;
  onSaveSuccess?: (draftId: string) => void;
  onPublishSuccess?: () => void;
}

export function InlineEditorProvider({
  children,
  initialData,
  isOwner,
  partnerId = null,
  draftId: initialDraftId = null,
  partnerSlug,
  citySlug,
  onSaveSuccess,
  onPublishSuccess
}: InlineEditorProviderProps) {
  // Editor state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftId, setDraftId] = useState<string | null>(initialDraftId);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Draft data
  const [draftData, setDraftData] = useState<DraftData>({
    company_name: initialData.company_name || '',
    description: initialData.description || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    website: initialData.website || '',
    hero_title: initialData.hero_title || '',
    hero_subtitle: initialData.hero_subtitle || '',
    hero_image_url: initialData.hero_image_url || '',
    services_description: initialData.services_description || '',
    ...initialData,
  });

  // Original data for comparison
  const [originalData] = useState(draftData);

  // Check if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(draftData) !== JSON.stringify(originalData);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeField, setActiveField] = useState<{
    key: string;
    type: FieldType;
    label: string;
  } | null>(null);

  // Debounce timer ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Record<string, unknown>>({});

  // Open editor drawer
  const openEditor = useCallback((fieldKey: string, fieldType: FieldType, label: string) => {
    setActiveField({ key: fieldKey, type: fieldType, label });
    setDrawerOpen(true);
  }, []);

  // Save changes to API (debounced) - returns true on success, false on failure
  const saveToApi = useCallback(async (changes: Record<string, unknown>): Promise<boolean> => {
    if (!partnerId) {
      console.log('[InlineEditor] No partnerId, skipping API save (demo mode)');
      setHasPendingChanges(false);
      return true; // Demo mode is always "successful"
    }

    setIsSaving(true);
    setSaveError(null); // Clear previous error
    try {
      const response = await fetch('/api/partner/inline-edit/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: partnerId,
          draft_id: draftId,
          changes
        })
      });

      const result = await response.json();

      if (result.success) {
        setDraftId(result.draft_id);
        setLastSaved(new Date(result.updated_at));
        setHasPendingChanges(false);
        setSaveError(null);
        onSaveSuccess?.(result.draft_id);
        console.log('[InlineEditor] Saved:', Object.keys(changes));
        return true;
      } else {
        console.error('[InlineEditor] Save failed:', result.error);
        setSaveError(result.error || 'Chyba pri ukladaní');
        setHasPendingChanges(true); // Keep pending state on error
        return false;
      }
    } catch (error) {
      console.error('[InlineEditor] Save error:', error);
      setSaveError('Chyba siete. Skontrolujte pripojenie.');
      setHasPendingChanges(true);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [partnerId, draftId, onSaveSuccess]);

  // Debounced save - accumulates changes and saves after 1s of inactivity
  const debouncedSave = useCallback((fieldKey: string, value: unknown) => {
    // Add to pending changes
    pendingChangesRef.current[fieldKey] = value;
    setHasPendingChanges(true); // Mark that we have unsaved changes
    setSaveError(null); // Clear error when user makes new changes

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new timer
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
  const saveField = useCallback(async (fieldKey: string, value: string | number | string[]) => {
    // Update local state immediately
    setDraftData((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));

    // Debounced API save
    debouncedSave(fieldKey, value);
  }, [debouncedSave]);

  // Legacy handleSaveField for EditorDrawer compatibility
  const handleSaveField = useCallback((fieldKey: string, value: string | number | string[]) => {
    saveField(fieldKey, value);
  }, [saveField]);

  // Publish changes
  const handlePublish = useCallback(async () => {
    // First, flush any pending changes
    if (Object.keys(pendingChangesRef.current).length > 0) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      const changesToSave = { ...pendingChangesRef.current };
      const saveResult = await saveToApi(changesToSave);
      // Only clear pending changes if save was successful
      if (saveResult) {
        pendingChangesRef.current = {};
      } else {
        console.error('[InlineEditor] Failed to save pending changes before publish');
        alert('Chyba pri ukladaní zmien. Skúste znova.');
        return;
      }
    }

    if (!partnerId || !draftId) {
      console.log('[InlineEditor] No partnerId/draftId, demo mode publish');
      alert('Zmeny boli publikované! (demo)');
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch('/api/partner/inline-edit/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: partnerId,
          draft_id: draftId
        })
      });

      const result = await response.json();

      if (result.success) {
        onPublishSuccess?.();
        // Refresh page to show published version
        window.location.reload();
      } else {
        console.error('[InlineEditor] Publish failed:', result.error);
        alert('Chyba pri publikovaní: ' + result.error);
      }
    } catch (error) {
      console.error('[InlineEditor] Publish error:', error);
      alert('Chyba pri publikovaní zmien');
    } finally {
      setIsPublishing(false);
    }
  }, [partnerId, draftId, saveToApi, onPublishSuccess]);

  // Discard changes
  const handleDiscard = useCallback(() => {
    // Clear pending changes
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    pendingChangesRef.current = {};

    setDraftData({ ...originalData });
    setIsEditMode(false);
    console.log('[InlineEditor] Discarded changes');
  }, [originalData]);

  // Toggle edit mode function for external access (e.g., UserMenu)
  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  // Always wrap in EditorContext.Provider so child components can access context
  // But only show admin UI if owner
  return (
    <EditorContext.Provider value={{
      isEditMode: isOwner ? isEditMode : false, // Non-owners always see non-edit mode
      toggleEditMode: isOwner ? toggleEditMode : () => {}, // Non-owners can't toggle
      draftData,
      openEditor,
      saveField,
      isSaving,
      lastSaved
    }}>
      {children}

      {/* Only show admin UI if owner */}
      {isOwner && (
        <>
          {/* Floating Admin Bar */}
          <FloatingAdminBar
            isEditMode={isEditMode}
            onToggleEditMode={() => setIsEditMode(!isEditMode)}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            onPublish={handlePublish}
            onDiscard={handleDiscard}
            isPublishing={isPublishing}
            lastSaved={lastSaved}
            saveError={saveError}
            hasPendingChanges={hasPendingChanges}
          />

          {/* Editor Drawer */}
          <EditorDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            fieldKey={activeField?.key || null}
            fieldType={activeField?.type || null}
            label={activeField?.label || ''}
            currentValue={activeField ? String(draftData[activeField.key] || '') : ''}
            onSave={handleSaveField}
          />
        </>
      )}
    </EditorContext.Provider>
  );
}
