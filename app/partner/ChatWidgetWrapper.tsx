'use client';

import { ChatWidget } from '@/components/ChatWidget';

interface ChatWidgetWrapperProps {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
}

export function ChatWidgetWrapper({ partnerId, partnerName, partnerEmail }: ChatWidgetWrapperProps) {
  return (
    <ChatWidget
      partnerId={partnerId}
      partnerName={partnerName}
      partnerEmail={partnerEmail}
    />
  );
}
