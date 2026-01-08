'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface TaxiGalleryProps {
  images: string[];
  serviceName: string;
}

// Helper to get thumbnail path from full image path
// Works for both local and Supabase images
// image.webp -> image-thumb.webp
function getThumbnail(imagePath: string): string {
  if (!imagePath) return imagePath;

  const ext = imagePath.lastIndexOf('.');
  if (ext === -1) return imagePath;

  return imagePath.slice(0, ext) + '-thumb' + imagePath.slice(ext);
}

export function TaxiGallery({ images, serviceName }: TaxiGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  };

  return (
    <>
      {/* Thumbnail Grid - Mobile optimized */}
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => openLightbox(idx)}
            className="relative w-20 h-20 md:w-28 md:h-28 rounded-lg md:rounded-xl overflow-hidden group cursor-pointer transition-transform hover:scale-105 shadow-md"
          >
            <img
              src={getThumbnail(image)}
              alt={`${serviceName} - foto ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = image; }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Navigation - Previous */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 text-white/80 hover:text-white p-2 z-10"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}

          {/* Main Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentIndex]}
              alt={`${serviceName} - foto ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {/* Navigation - Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 text-white/80 hover:text-white p-2 z-10"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
