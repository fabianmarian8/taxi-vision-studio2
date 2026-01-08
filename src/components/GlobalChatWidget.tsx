'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChatWidget } from './ChatWidget';

interface PartnerInfo {
  id: string;
  name: string;
  email: string;
}

export function GlobalChatWidget() {
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Check auth state and load partner info
    const loadPartnerInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setPartnerInfo(null);
          setIsLoading(false);
          return;
        }

        // Get partner info for this user
        const { data: partners } = await supabase
          .from('partners')
          .select('id, name')
          .eq('user_id', user.id)
          .limit(1);

        if (partners && partners.length > 0) {
          setPartnerInfo({
            id: partners[0].id,
            name: partners[0].name,
            email: user.email || '',
          });
        } else {
          setPartnerInfo(null);
        }
      } catch (error) {
        console.error('Error loading partner info:', error);
        setPartnerInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPartnerInfo();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadPartnerInfo();
      } else {
        setPartnerInfo(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Don't render anything if loading or not logged in
  if (isLoading || !partnerInfo) {
    return null;
  }

  return (
    <ChatWidget
      partnerId={partnerInfo.id}
      partnerName={partnerInfo.name}
      partnerEmail={partnerInfo.email}
    />
  );
}
