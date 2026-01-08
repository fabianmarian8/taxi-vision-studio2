'use client';

import { useState, useRef } from 'react';
import { Drawer } from 'vaul';
import { X, Upload, Trash2, Check, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';

interface GalleryEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentImages: string[];
  onSave: (images: string[]) => void;
  label: string;
  maxImages?: number;
  // Optional: Enable real upload to Supabase
  enableUpload?: boolean;
}

export function GalleryEditor({
  isOpen,
  onClose,
  currentImages,
  onSave,
  label,
  maxImages = 10,
  enableUpload = false,
}: GalleryEditorProps) {
  const [images, setImages] = useState<string[]>(currentImages);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when drawer opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setImages(currentImages);
      setUploadError(null);
    } else {
      onClose();
    }
  };

  // Handle file upload (multiple)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`Maximum je ${maxImages} obrázkov.`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setUploadError(null);

    // If upload is enabled, upload to Supabase
    if (enableUpload) {
      setIsUploading(true);
      setUploadProgress(0);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          continue;
        }

        // Validate file size (max 5MB each)
        if (file.size > 5 * 1024 * 1024) {
          setUploadError(`Súbor ${file.name} je príliš veľký. Maximum je 5MB.`);
          continue;
        }

        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', 'gallery');

          const response = await fetch('/api/partner/upload-image', {
            method: 'POST',
            body: formData
          });

          const result = await response.json();

          if (result.success && result.url) {
            uploadedUrls.push(result.url);
          } else {
            console.error('[GalleryEditor] Upload failed:', result.error);
          }
        } catch (error) {
          console.error('[GalleryEditor] Upload error:', error);
        }

        // Update progress
        setUploadProgress(Math.round(((i + 1) / filesToProcess.length) * 100));
      }

      // Add uploaded images to state
      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
      }

      setIsUploading(false);
      setUploadProgress(0);
    } else {
      // Demo mode: Convert to base64
      for (const file of filesToProcess) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          continue;
        }

        // Validate file size (max 5MB each)
        if (file.size > 5 * 1024 * 1024) {
          alert(`Súbor ${file.name} je príliš veľký. Maximum je 5MB.`);
          continue;
        }

        // Convert to base64 for mock
        const reader = new FileReader();
        reader.onload = (event) => {
          setImages((prev) => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);

    setImages(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle remove image
  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle save
  const handleSave = () => {
    onSave(images);
    onClose();
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white max-h-[60vh]">
          {/* Handle */}
          <div className="mx-auto mt-3 h-1 w-10 flex-shrink-0 rounded-full bg-gray-300" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div>
              <Drawer.Title className="text-lg font-semibold text-gray-900">
                {label}
              </Drawer.Title>
              <p className="text-sm text-gray-500">
                {images.length} / {maxImages} obrázkov
                {isUploading && ` • Nahrávam ${uploadProgress}%`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Upload error */}
          {uploadError && (
            <div className="mx-3 mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              {uploadError}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto p-3">
            {/* Gallery grid - compact */}
            {images.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                {images.map((image, index) => (
                  <div
                    key={index}
                    draggable={!isUploading}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative w-full h-16 md:h-20 rounded-lg overflow-hidden bg-gray-100 group cursor-move ${
                      draggedIndex === index ? 'opacity-50' : ''
                    } ${
                      dragOverIndex === index && draggedIndex !== index
                        ? 'ring-2 ring-yellow-400'
                        : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Galéria ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay controls - compact */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      {/* Delete button */}
                      <button
                        onClick={() => handleRemove(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Index badge */}
                      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add more button (if not at max and not uploading) */}
                {images.length < maxImages && !isUploading && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-16 md:h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-yellow-400 flex items-center justify-center text-gray-400 hover:text-yellow-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}

                {/* Uploading indicator */}
                {isUploading && (
                  <div className="h-16 md:h-20 rounded-lg border-2 border-dashed border-yellow-400 flex items-center justify-center bg-yellow-50">
                    <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                  </div>
                )}
              </div>
            ) : (
              /* Empty state - compact */
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <ImageIcon className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium mb-2">Žiadne obrázky</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Nahrávam...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Nahrať
                    </>
                  )}
                </button>
              </div>
            )}

            {/* File input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Footer - compact */}
          <div className="p-3 border-t flex gap-2">
            {images.length < maxImages && images.length > 0 && !isUploading && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-3 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 text-gray-900 font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Uložiť
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
