'use client';

import { useState, useRef, useCallback } from 'react';
import { Drawer } from 'vaul';
import { X, Upload, ZoomIn, ZoomOut, Move, Check, Trash2, Loader2 } from 'lucide-react';

interface ImageCropEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string | null;
  currentZoom: number;
  currentPosX: number;
  currentPosY: number;
  onSave: (image: string | null, zoom: number, posX: number, posY: number) => void;
  label: string;
  // Optional: Enable real upload to Supabase
  enableUpload?: boolean;
}

export function ImageCropEditor({
  isOpen,
  onClose,
  currentImage,
  currentZoom,
  currentPosX,
  currentPosY,
  onSave,
  label,
  enableUpload = false,
}: ImageCropEditorProps) {
  const [image, setImage] = useState<string | null>(currentImage);
  const [zoom, setZoom] = useState(currentZoom);
  const [posX, setPosX] = useState(currentPosX);
  const [posY, setPosY] = useState(currentPosY);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when drawer opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setImage(currentImage);
      setZoom(currentZoom);
      setPosX(currentPosX);
      setPosY(currentPosY);
    } else {
      onClose();
    }
  };

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Prosím vyberte obrázok (JPG, PNG, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Obrázok je príliš veľký. Maximum je 5MB.');
      return;
    }

    setUploadError(null);

    // If upload is enabled, upload to Supabase
    if (enableUpload) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'hero');

        const response = await fetch('/api/partner/upload-image', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success && result.url) {
          setImage(result.url);
          // Reset position for new image
          setZoom(100);
          setPosX(50);
          setPosY(50);
        } else {
          setUploadError(result.error || 'Chyba pri nahrávaní');
        }
      } catch (error) {
        console.error('[ImageCropEditor] Upload error:', error);
        setUploadError('Chyba pri nahrávaní obrázka');
      } finally {
        setIsUploading(false);
      }
    } else {
      // Demo mode: Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        // Reset position for new image
        setZoom(100);
        setPosX(50);
        setPosY(50);
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle drag move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Calculate movement as percentage of container size
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    // Update position (invert because we're moving the image, not the viewport)
    setPosX((prev) => Math.max(0, Math.min(100, prev - deltaX)));
    setPosY((prev) => Math.max(0, Math.min(100, prev - deltaY)));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(200, prev + 10));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(50, prev - 10));
  };

  // Handle save
  const handleSave = () => {
    onSave(image, zoom, posX, posY);
    onClose();
  };

  // Handle remove image
  const handleRemove = () => {
    setImage(null);
    setZoom(100);
    setPosX(50);
    setPosY(50);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white max-h-[85vh]">
          {/* Handle */}
          <div className="mx-auto mt-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <Drawer.Title className="text-lg font-semibold text-gray-900">
              {label}
            </Drawer.Title>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {/* Image preview area */}
            <div
              ref={containerRef}
              className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden bg-gray-100 mb-4 cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {image ? (
                <>
                  <div
                    className="absolute inset-0 bg-no-repeat transition-transform"
                    style={{
                      backgroundImage: `url(${image})`,
                      backgroundPosition: `${posX}% ${posY}%`,
                      backgroundSize: `${zoom}%`,
                    }}
                  />
                  {/* Drag hint overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                    <div className="opacity-0 hover:opacity-100 transition-opacity bg-black/50 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                      <Move className="w-4 h-4" />
                      Ťahaj pre posun
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <Upload className="w-12 h-12 mb-2" />
                  <span>Žiadny obrázok</span>
                </div>
              )}
            </div>

            {/* Zoom controls */}
            {image && (
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ZoomOut className="w-5 h-5 text-gray-700" />
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-32 accent-yellow-500"
                  />
                  <span className="text-sm text-gray-600 w-12">{zoom}%</span>
                </div>
                <button
                  onClick={handleZoomIn}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ZoomIn className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            )}

            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Nahrávam...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    {image ? 'Nahrať nový' : 'Nahrať obrázok'}
                  </>
                )}
              </button>

              {image && !isUploading && (
                <button
                  onClick={handleRemove}
                  className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Upload error */}
            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {uploadError}
              </div>
            )}

            {/* Help text */}
            <p className="text-sm text-gray-500 text-center mb-4">
              Tip: Po nahratí môžete obrázok posúvať ťahaním a zoomovať posuvníkom.
            </p>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              <Check className="w-5 h-5" />
              Uložiť zmeny
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
