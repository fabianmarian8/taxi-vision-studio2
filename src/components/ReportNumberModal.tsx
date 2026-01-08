"use client";

import { useState } from 'react';
import { X, AlertTriangle, Phone, PhoneOff, HelpCircle } from 'lucide-react';

interface ReportNumberModalProps {
  serviceName: string;
  servicePhone: string;
  cityName: string;
}

type ReportReason = 'not_answering' | 'wrong_number' | 'not_exists' | null;

const reportReasons = [
  { id: 'not_answering' as const, label: 'Neberie telefón', icon: PhoneOff, description: 'Volal som, ale nikto nezdvíha' },
  { id: 'wrong_number' as const, label: 'Zlé číslo', icon: Phone, description: 'Číslo neexistuje alebo patrí niekomu inému' },
  { id: 'not_exists' as const, label: 'Taxislužba neexistuje', icon: HelpCircle, description: 'Firma už nepôsobí' },
];

export function ReportNumberButton({ serviceName, servicePhone, cityName }: ReportNumberModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedReason || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/report-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName,
          servicePhone,
          cityName,
          reason: selectedReason,
          comment: comment || undefined,
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setSelectedReason(null);
        setComment('');
      }, 2000);
    } catch (err) {
      console.error('Report submit error:', err);
      setError('Nepodarilo sa odoslať. Skúste znova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-[10px] text-red-500 hover:text-red-700 hover:underline"
      >
        Nahlásiť nefunkčné
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            {!isSubmitted ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Nahlásiť problém</h3>
                    <p className="text-sm text-foreground/60">{serviceName}</p>
                  </div>
                </div>

                {/* Reason selection */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium text-foreground/80">Čo sa stalo?</p>
                  {reportReasons.map((reason) => (
                    <button
                      key={reason.id}
                      onClick={() => setSelectedReason(reason.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                        selectedReason === reason.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <reason.icon className={`h-5 w-5 ${selectedReason === reason.id ? 'text-red-600' : 'text-gray-400'}`} />
                      <div>
                        <p className={`font-medium ${selectedReason === reason.id ? 'text-red-700' : 'text-foreground'}`}>
                          {reason.label}
                        </p>
                        <p className="text-xs text-foreground/50">{reason.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Optional comment */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-foreground/80 block mb-1">
                    Komentár (voliteľné)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ďalšie detaily..."
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    rows={2}
                  />
                </div>

                {/* Error message */}
                {error && (
                  <p className="text-sm text-red-600 text-center mb-3">{error}</p>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!selectedReason || isSubmitting}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${
                    selectedReason && !isSubmitting
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Odosielam...' : 'Odoslať nahlásenie'}
                </button>

                <p className="text-[10px] text-center text-foreground/40 mt-3">
                  Ďakujeme za pomoc pri udržiavaní aktuálnych údajov
                </p>
              </>
            ) : (
              /* Success state */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-foreground mb-1">Ďakujeme!</h3>
                <p className="text-sm text-foreground/60">Nahlásenie bolo odoslané</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
