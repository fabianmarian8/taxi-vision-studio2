'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import { X, Check, MessageCircle, Clock, FileText, ScrollText, Mail, Facebook, Instagram, Globe, Eye, EyeOff } from 'lucide-react';

export interface ButtonLinks {
  whatsapp: string;
  booking_url: string;
  pricelist_url: string;
  transport_rules_url: string;
  email: string;
  facebook: string;
  instagram: string;
  website: string;
  contact_url: string;
}

interface ButtonLinksEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentLinks: ButtonLinks;
  onSave: (links: ButtonLinks) => void;
}

interface LinkField {
  key: keyof ButtonLinks;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  color: string;
}

const LINK_FIELDS: LinkField[] = [
  { key: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" />, placeholder: '+421...', color: 'bg-green-500' },
  { key: 'booking_url', label: 'Časová objednávka', icon: <Clock className="w-4 h-4" />, placeholder: 'https://...', color: 'bg-purple-600' },
  { key: 'pricelist_url', label: 'Cenník', icon: <FileText className="w-4 h-4" />, placeholder: 'https://...', color: 'bg-amber-500' },
  { key: 'transport_rules_url', label: 'Prepravný poriadok', icon: <ScrollText className="w-4 h-4" />, placeholder: 'https://...', color: 'bg-blue-500' },
  { key: 'email', label: 'Email', icon: <Mail className="w-4 h-4" />, placeholder: 'email@example.com', color: 'bg-gray-500' },
  { key: 'facebook', label: 'Facebook', icon: <Facebook className="w-4 h-4" />, placeholder: 'https://facebook.com/...', color: 'bg-blue-600' },
  { key: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4" />, placeholder: 'https://instagram.com/...', color: 'bg-pink-500' },
  { key: 'website', label: 'Web stránka', icon: <Globe className="w-4 h-4" />, placeholder: 'https://...', color: 'bg-gray-700' },
  { key: 'contact_url', label: 'Kontakt', icon: <Globe className="w-4 h-4" />, placeholder: 'https://...', color: 'bg-gray-600' },
];

export function ButtonLinksEditor({
  isOpen,
  onClose,
  currentLinks,
  onSave,
}: ButtonLinksEditorProps) {
  const [links, setLinks] = useState<ButtonLinks>(currentLinks);

  // Reset state when drawer opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLinks(currentLinks);
    } else {
      onClose();
    }
  };

  // Update link value
  const handleLinkChange = (key: keyof ButtonLinks, value: string) => {
    setLinks(prev => ({ ...prev, [key]: value }));
  };

  // Clear link
  const handleClearLink = (key: keyof ButtonLinks) => {
    setLinks(prev => ({ ...prev, [key]: '' }));
  };

  // Handle save
  const handleSave = () => {
    onSave(links);
    onClose();
  };

  // Count active links
  const activeCount = Object.values(links).filter(v => v && v.trim()).length;

  return (
    <Drawer.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white max-h-[75vh]">
          {/* Handle */}
          <div className="mx-auto mt-3 h-1 w-10 flex-shrink-0 rounded-full bg-gray-300" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div>
              <Drawer.Title className="text-lg font-semibold text-gray-900">
                Tlačidlá a odkazy
              </Drawer.Title>
              <p className="text-sm text-gray-500">
                {activeCount} aktívnych tlačidiel
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
          <div className="flex-1 overflow-auto p-3">
            <div className="space-y-2">
              {LINK_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  {/* Icon */}
                  <div className={`${field.color} text-white p-1.5 rounded-lg flex-shrink-0`}>
                    {field.icon}
                  </div>

                  {/* Input */}
                  <div className="flex-1 min-w-0">
                    <label className="text-xs text-gray-500 font-medium">{field.label}</label>
                    <input
                      type="text"
                      value={links[field.key]}
                      onChange={(e) => handleLinkChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full text-sm px-0 py-0.5 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400"
                    />
                  </div>

                  {/* Toggle visibility / Clear */}
                  {links[field.key] ? (
                    <button
                      onClick={() => handleClearLink(field.key)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Odstrániť"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="p-1.5 text-gray-300">
                      <EyeOff className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              Prázdne polia nebudú zobrazené na stránke.
            </p>
          </div>

          {/* Footer */}
          <div className="p-3 border-t">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2.5 px-4 rounded-lg transition-colors"
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
