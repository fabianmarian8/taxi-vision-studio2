'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import { X, Check, Plus, Trash2, GripVertical } from 'lucide-react';

interface ServiceTagsEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentTags: string[];
  onSave: (tags: string[]) => void;
  label: string;
  maxTags?: number;
}

export function ServiceTagsEditor({
  isOpen,
  onClose,
  currentTags,
  onSave,
  label,
  maxTags = 15,
}: ServiceTagsEditorProps) {
  const [tags, setTags] = useState<string[]>(currentTags);
  const [newTag, setNewTag] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Reset state when drawer opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTags(currentTags);
      setNewTag('');
    } else {
      onClose();
    }
  };

  // Add new tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (tags.length >= maxTags) {
      alert(`Maximum je ${maxTags} služieb.`);
      return;
    }
    if (tags.includes(newTag.trim())) {
      alert('Táto služba už existuje.');
      return;
    }
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  // Remove tag
  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
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

    const newTags = [...tags];
    const [draggedItem] = newTags.splice(draggedIndex, 1);
    newTags.splice(dropIndex, 0, draggedItem);

    setTags(newTags);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle save
  const handleSave = () => {
    onSave(tags);
    onClose();
  };

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
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
            <div>
              <Drawer.Title className="text-lg font-semibold text-gray-900">
                {label}
              </Drawer.Title>
              <p className="text-sm text-gray-500">
                {tags.length} / {maxTags} služieb
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {/* Add new tag input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pridať novú službu..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleAddTag}
                disabled={!newTag.trim() || tags.length >= maxTags}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Tags list */}
            {tags.length > 0 ? (
              <div className="space-y-2">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg group cursor-move ${
                      draggedIndex === index ? 'opacity-50' : ''
                    } ${
                      dragOverIndex === index && draggedIndex !== index
                        ? 'ring-2 ring-purple-400'
                        : ''
                    }`}
                  >
                    {/* Drag handle */}
                    <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Tag text */}
                    <span className="flex-1 text-gray-800 font-medium">
                      {tag}
                    </span>

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemoveTag(index)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-100 text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Plus className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium mb-2">Žiadne služby</p>
                <p className="text-sm">Pridajte služby ktoré ponúkate</p>
              </div>
            )}

            {/* Help text */}
            {tags.length > 0 && (
              <p className="text-sm text-gray-500 text-center mt-4">
                Tip: Ťahaním môžete zmeniť poradie služieb.
              </p>
            )}
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
