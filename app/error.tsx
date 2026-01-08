'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to analytics service in production
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-foreground/5">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error icon */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" strokeWidth={2} />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500/20 rounded-full blur-md"></div>
        </div>

        {/* Error message */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Niečo sa pokazilo
          </h1>
          <p className="text-foreground/70 text-sm md:text-base">
            Ospravedlňujeme sa, nastala neočakávaná chyba. Skúste stránku obnoviť alebo sa vrátiť na domovskú stránku.
          </p>

          {/* Technical details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-foreground/5 rounded-lg text-left">
              <p className="text-xs font-mono text-foreground/60 break-all">
                {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-foreground/50 mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={reset}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Skúsiť znova
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Domovská stránka
          </Button>
        </div>

        {/* Contact support */}
        <div className="pt-6 border-t border-foreground/10">
          <p className="text-xs text-foreground/50">
            Ak problém pretrváva,{' '}
            <a
              href="/kontakt"
              className="text-primary hover:text-primary/80 font-medium underline underline-offset-2"
            >
              kontaktujte nás
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}