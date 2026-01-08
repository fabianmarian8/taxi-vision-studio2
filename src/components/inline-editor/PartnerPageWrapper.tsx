'use client';

import { ReactNode } from 'react';
import { InlineEditorProvider, type DraftData } from './InlineEditorProvider';

interface PartnerPageWrapperProps {
  children: ReactNode;
  isOwner: boolean;
  initialData: Partial<DraftData>;
  partnerId?: string | null;
  draftId?: string | null;
  partnerSlug?: string;
  citySlug?: string;
}

/**
 * Klientský wrapper pre partner stránky
 * Obaľuje obsah do InlineEditorProvider ak je používateľ vlastníkom
 */
export function PartnerPageWrapper({
  children,
  isOwner,
  initialData,
  partnerId = null,
  draftId = null,
  partnerSlug,
  citySlug,
}: PartnerPageWrapperProps) {
  return (
    <InlineEditorProvider
      isOwner={isOwner}
      initialData={initialData}
      partnerId={partnerId}
      draftId={draftId}
      partnerSlug={partnerSlug}
      citySlug={citySlug}
    >
      {children}
    </InlineEditorProvider>
  );
}
