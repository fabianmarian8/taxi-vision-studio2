'use client';

import { Button } from './ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  url?: string;
}

export const ShareButton = ({ title, url }: ShareButtonProps) => {
  const handleShare = async () => {
    // Bezpečný prístup k window.location len v event handleri (client-side)
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    try {
      // Skús natívne zdieľanie (mobile/desktop s podporou)
      if (navigator.share) {
        await navigator.share({
          title,
          url: shareUrl,
        });
        return;
      }
    } catch (err) {
      // Používateľ zrušil zdieľanie alebo nastala chyba - pokračuj na fallback
    }

    // Fallback: Skopíruj do schránky
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link skopírovaný do schránky');
      } catch {
        toast.error('Nepodarilo sa skopírovať link');
      }
    } else {
      toast.error('Zdieľanie nie je podporované');
    }
  };

  return (
    <Button onClick={handleShare} variant="outline" className="gap-2">
      <Share2 className="h-4 w-4" />
      Zdieľať článok
    </Button>
  );
};
