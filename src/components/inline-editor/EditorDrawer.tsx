'use client';

import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { X, Check } from 'lucide-react';
import type { FieldType } from './EditableField';

interface EditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fieldKey: string | null;
  fieldType: FieldType | null;
  label: string;
  currentValue: string;
  onSave: (fieldKey: string, value: string) => void;
}

export function EditorDrawer({
  isOpen,
  onClose,
  fieldKey,
  fieldType,
  label,
  currentValue,
  onSave,
}: EditorDrawerProps) {
  const [value, setValue] = useState(currentValue);

  // Sync value when drawer opens with new field
  useEffect(() => {
    setValue(currentValue);
  }, [currentValue, fieldKey]);

  const handleSave = () => {
    if (fieldKey) {
      onSave(fieldKey, value);
      onClose();
    }
  };

  const getInputPlaceholder = () => {
    switch (fieldType) {
      case 'phone':
        return '+421 XXX XXX XXX';
      case 'email':
        return 'email@example.com';
      case 'url':
        return 'https://...';
      default:
        return `Zadajte ${label.toLowerCase()}`;
    }
  };

  const getInputType = () => {
    switch (fieldType) {
      case 'phone':
        return 'tel';
      case 'email':
        return 'email';
      case 'url':
        return 'url';
      default:
        return 'text';
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-auto flex-col rounded-t-2xl bg-white">
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
          <div className="p-4 pb-8">
            {fieldType === 'textarea' ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={getInputPlaceholder()}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none resize-none text-gray-900"
              />
            ) : fieldType === 'image' ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <p className="text-gray-500">
                    Nahrávanie obrázkov bude dostupné po pripojení Supabase
                  </p>
                </div>
                <input
                  type="url"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Alebo zadajte URL obrázka"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none text-gray-900"
                />
              </div>
            ) : (
              <input
                type={getInputType()}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={getInputPlaceholder()}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none text-gray-900"
              />
            )}

            {/* Validation hints */}
            {fieldType === 'phone' && (
              <p className="mt-2 text-sm text-gray-500">
                Formát: +421 XXX XXX XXX alebo 09XX XXX XXX
              </p>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-colors"
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
