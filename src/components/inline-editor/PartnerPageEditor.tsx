'use client';

import { ReactNode } from 'react';
import { InlineEditorProvider, useInlineEditor, EditableField, type DraftData } from './index';

interface PartnerPageEditorProps {
  children: ReactNode;
  initialData: Partial<DraftData>;
  isOwner: boolean;
}

/**
 * Wrapper component that provides inline editing capabilities to a partner page.
 * This should wrap the entire partner page content.
 *
 * Usage:
 * <PartnerPageEditor initialData={approvedData} isOwner={isLoggedInOwner}>
 *   <YourPartnerPageContent />
 * </PartnerPageEditor>
 */
export function PartnerPageEditor({ children, initialData, isOwner }: PartnerPageEditorProps) {
  return (
    <InlineEditorProvider initialData={initialData} isOwner={isOwner}>
      {children}
    </InlineEditorProvider>
  );
}

/**
 * Hook to get editable content with edit mode awareness.
 * Returns the draft value and whether edit mode is active.
 */
export function useEditableContent() {
  const { isEditMode, draftData, openEditor } = useInlineEditor();
  return { isEditMode, draftData, openEditor };
}

// Re-export EditableField for convenience
export { EditableField };
