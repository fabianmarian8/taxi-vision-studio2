'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Partner, PartnerDraft } from '@/lib/supabase/types';
import { TaxiPreview } from './TaxiPreview';
import { PARTNER_SKINS, normalizePartnerSkin } from '@/lib/partner-skins';

interface Props {
  partner: Partner & { partner_drafts: PartnerDraft[] };
  initialDraft: PartnerDraft | null;
  userEmail: string;
  rejectionMessage?: string | null;
  cityName?: string;
}

interface FormData {
  company_name: string;
  description: string;
  show_description: boolean;
  phone: string;
  email: string;
  website: string;
  hero_image_url: string;
  hero_image_zoom: number;
  hero_image_pos_x: number;
  hero_image_pos_y: number;
  hero_title: string;
  hero_subtitle: string;
  banner_title: string;
  banner_subtitle: string;
  services: string[];
  show_services: boolean;
  gallery: string[];
  social_facebook: string;
  social_instagram: string;
  template_variant: string;
}

// Get thumbnail URL - use pre-generated thumbnails for Supabase storage images
function getThumbnailUrl(url: string): string {
  if (!url) return url;

  // For Supabase storage URLs, use pre-generated thumbnail (-thumb.webp)
  // These are created during upload in /api/partner/upload-image
  if (url.includes('supabase.co/storage') && url.endsWith('.webp')) {
    // Replace .webp with -thumb.webp
    return url.replace('.webp', '-thumb.webp');
  }

  return url;
}

export function PartnerEditor({ partner, initialDraft, userEmail, rejectionMessage, cityName = 'Zvolen' }: Props) {
  const [showRejectionMessage, setShowRejectionMessage] = useState(!!rejectionMessage);
  const [formData, setFormData] = useState<FormData>({
    company_name: initialDraft?.company_name || partner.name || '',
    description: initialDraft?.description || '',
    show_description: initialDraft?.show_description ?? true,
    phone: initialDraft?.phone || '',
    email: initialDraft?.email || '',
    website: initialDraft?.website || '',
    hero_image_url: initialDraft?.hero_image_url || '',
    hero_image_zoom: initialDraft?.hero_image_zoom || 100,
    hero_image_pos_x: initialDraft?.hero_image_pos_x || 50,
    hero_image_pos_y: initialDraft?.hero_image_pos_y || 50,
    hero_title: initialDraft?.hero_title || '',
    hero_subtitle: initialDraft?.hero_subtitle || '',
    banner_title: initialDraft?.banner_title || '',
    banner_subtitle: initialDraft?.banner_subtitle || '',
    services: (initialDraft?.services as string[]) || [],
    show_services: initialDraft?.show_services ?? false,
    gallery: (initialDraft?.gallery as string[]) || [],
    social_facebook: initialDraft?.social_facebook || '',
    social_instagram: initialDraft?.social_instagram || '',
    template_variant: normalizePartnerSkin(initialDraft?.template_variant),
  });

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'hero' | 'gallery' | 'social' | 'appearance'>('general');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);
  // Track draft ID to prevent duplicate inserts
  const [draftId, setDraftId] = useState<string | null>(initialDraft?.id || null);

  // Mobile keyboard fix - scroll input into view when focused
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Wait for keyboard to appear
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  const handleChange = useCallback((field: keyof FormData, value: string | string[] | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleServiceToggle = useCallback((service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  }, []);

  const GALLERY_LIMIT = 10;

  const handleGalleryUpload = async (files: FileList) => {
    const remainingSlots = GALLERY_LIMIT - formData.gallery.length;

    if (remainingSlots <= 0) {
      setMessage({
        type: 'error',
        text: `Dosiahnutý limit ${GALLERY_LIMIT} obrázkov. Najprv odstráňte niektoré existujúce.`,
      });
      return;
    }

    const filesToUpload = Math.min(files.length, remainingSlots);
    if (filesToUpload < files.length) {
      setMessage({
        type: 'error',
        text: `Môžete nahrať max. ${remainingSlots} obrázkov (limit je ${GALLERY_LIMIT}).`,
      });
    }

    setGalleryUploading(true);
    if (filesToUpload === files.length) {
      setMessage(null);
    }

    const uploadedUrls: string[] = [];
    const errors: { name: string; reason: string }[] = [];

    // Convert FileList to Array for reliable iteration
    const filesArray = Array.from(files).slice(0, filesToUpload);
    console.log(`[Gallery] Files to upload: ${filesArray.length}, names: ${filesArray.map(f => f.name).join(', ')}`);

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      if (!file) {
        console.error(`[Gallery] File at index ${i} is undefined, skipping`);
        continue;
      }
      console.log(`[Gallery] Uploading file ${i + 1}/${filesArray.length}: ${file.name} (${file.type}, ${Math.round(file.size / 1024)}KB)`);

      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('type', 'gallery');

        const response = await fetch('/api/partner/upload-image', {
          method: 'POST',
          body: uploadFormData,
        });

        console.log(`[Gallery] Response status: ${response.status}`);

        // Handle non-JSON responses (like HTML error pages)
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('[Gallery] Non-JSON response:', text.substring(0, 200));
          throw new Error('Server vrátil neočakávanú odpoveď');
        }

        const result = await response.json();
        console.log(`[Gallery] Result:`, result);

        if (!response.ok) {
          throw new Error(result.error || `HTTP ${response.status}`);
        }

        uploadedUrls.push(result.url);
        console.log(`[Gallery] Successfully uploaded: ${file.name}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Neznáma chyba';
        console.error(`[Gallery] Error uploading ${file.name}:`, error);
        errors.push({ name: file.name, reason: errorMessage });
      }
    }

    // Add uploaded URLs to gallery
    if (uploadedUrls.length > 0) {
      setFormData((prev) => ({
        ...prev,
        gallery: [...prev.gallery, ...uploadedUrls],
      }));
    }

    setGalleryUploading(false);

    if (errors.length > 0) {
      const errorDetails = errors.map(e => `${e.name}: ${e.reason}`).join('; ');
      console.error('[Gallery] Upload errors:', errorDetails);
      setMessage({
        type: 'error',
        text: `Nepodarilo sa nahrať ${errors.length} súbor(y): ${errors.map(e => e.name).join(', ')}. Dôvod: ${errors[0].reason}`,
      });
    } else if (uploadedUrls.length > 0) {
      setMessage({
        type: 'success',
        text: `Nahraných ${uploadedUrls.length} obrázkov`,
      });
    }
  };

  const handleGalleryRemove = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  }, []);

  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleGalleryUpload(files);
    }
    e.target.value = '';
  };

  const handleImageUpload = async (file: File, type: 'hero' | 'logo') => {
    setUploading(true);
    setUploadProgress('Komprimujem a nahrávam...');
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/partner/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update form with new image URL
      if (type === 'hero') {
        handleChange('hero_image_url', result.url);
      }

      setUploadProgress(null);
      setMessage({
        type: 'success',
        text: `Obrázok bol nahraný (${Math.round(result.size / 1024)} KB)`,
      });
    } catch (error) {
      setUploadProgress(null);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Chyba pri nahrávaní',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, type);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const saveDraft = async () => {
    setSaving(true);
    setMessage(null);

    const supabase = createClient();

    const draftData = {
      partner_id: partner.id,
      status: 'draft' as const,
      ...formData,
      services: formData.services,
    };

    let result;
    if (draftId) {
      // Update existing draft
      result = await supabase
        .from('partner_drafts')
        .update(draftData)
        .eq('id', draftId);
    } else {
      // Insert new draft and get the ID back
      result = await supabase
        .from('partner_drafts')
        .insert(draftData)
        .select('id')
        .single();

      // Save the new draft ID to prevent duplicates
      if (result.data?.id) {
        setDraftId(result.data.id);
      }
    }

    if (result.error) {
      setMessage({ type: 'error', text: 'Chyba pri ukladaní: ' + result.error.message });
    } else {
      setMessage({ type: 'success', text: 'Zmeny boli uložené ako rozpracované.' });
    }

    setSaving(false);
  };

  const publishChanges = async () => {
    setSubmitting(true);
    setMessage(null);

    const supabase = createClient();

    // Set status directly to 'approved' - changes are published immediately
    const draftData = {
      partner_id: partner.id,
      status: 'approved' as const,
      ...formData,
      services: formData.services,
      submitted_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
    };

    let result;
    if (draftId) {
      // Update existing draft
      result = await supabase
        .from('partner_drafts')
        .update(draftData)
        .eq('id', draftId);
    } else {
      // Insert new draft and get the ID back
      result = await supabase
        .from('partner_drafts')
        .insert(draftData)
        .select('id')
        .single();

      // Save the new draft ID to prevent duplicates
      if (result.data?.id) {
        setDraftId(result.data.id);
      }
    }

    if (result.error) {
      setMessage({ type: 'error', text: 'Chyba pri publikovaní: ' + result.error.message });
    } else {
      // Revalidate the partner page to show changes immediately
      fetch(`/api/revalidate?path=/taxi/${partner.city_slug}/${partner.slug}`, {
        method: 'POST',
      }).catch((err) => console.warn('[Revalidate] Error:', err));

      setMessage({
        type: 'success',
        text: 'Zmeny boli publikované! Stránka sa aktualizuje do niekoľkých sekúnd.',
      });
    }

    setSubmitting(false);
  };

  const availableServices = [
    'Letisko',
    'Nonstop',
    'Rozvoz jedla',
    'Kuriérska služba',
    'VIP preprava',
    'Platba kartou',
    'Klimatizácia',
    'Detská sedačka',
    'Preprava zvierat',
    'Bezbariérová preprava',
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/partner"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Späť
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">{partner.name}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveDraft}
                disabled={saving}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Ukladám...' : 'Uložiť rozpracované'}
              </button>
              <button
                onClick={publishChanges}
                disabled={submitting}
                className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Publikujem...' : 'Publikovať zmeny'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Rejection Message Banner */}
      {showRejectionMessage && rejectionMessage && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">Vaša posledná žiadosť bola zamietnutá</h3>
                <p className="mt-1 text-sm text-amber-700">
                  {rejectionMessage || 'Bez uvedenia dôvodu.'}
                </p>
                <p className="mt-2 text-sm text-amber-600">
                  Údaje boli obnovené na pôvodnú verziu. Môžete vykonať úpravy a odoslať novú žiadosť.
                </p>
              </div>
              <button
                onClick={() => setShowRejectionMessage(false)}
                className="flex-shrink-0 text-amber-500 hover:text-amber-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        </div>
      )}

      {/* Main content with split view */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                {[
                  { id: 'general', label: 'Základné info' },
                  { id: 'hero', label: 'Hero sekcia' },
                  { id: 'appearance', label: 'Vzhľad' },
                  { id: 'gallery', label: 'Galéria' },
                  { id: 'social', label: 'Sociálne siete' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Názov taxislužby
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleChange('company_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Popis (sekcia "O nás")
                      </label>
                      <button
                        type="button"
                        onClick={() => handleChange('show_description', !formData.show_description)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.show_description ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.show_description ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {!formData.show_description && (
                      <p className="text-xs text-amber-600 mb-2">Sekcia "O nás" nebude zobrazená na stránke</p>
                    )}
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Krátky popis vašej taxislužby..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefón
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="+421 xxx xxx xxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webová stránka
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Služby
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-gray-500">Zobraziť na stránke</span>
                        <button
                          type="button"
                          onClick={() => handleChange('show_services', !formData.show_services)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.show_services ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.show_services ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </label>
                    </div>
                    {!formData.show_services && (
                      <p className="text-xs text-amber-600 mb-3">
                        Služby sa nezobrazia na vašej stránke. Zapnite prepínač ak ich chcete zobraziť.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {availableServices.map((service) => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => handleServiceToggle(service)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            formData.services.includes(service)
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hero' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero obrázok
                    </label>

                    {/* Current image preview with zoom/position */}
                    {formData.hero_image_url && (
                      <div className="mb-4 space-y-3">
                        <div className="relative rounded-lg overflow-hidden aspect-video bg-gray-100">
                          <div
                            className="absolute inset-0 bg-no-repeat"
                            style={{
                              backgroundImage: `url(${formData.hero_image_url})`,
                              backgroundPosition: `${formData.hero_image_pos_x}% ${formData.hero_image_pos_y}%`,
                              backgroundSize: `${formData.hero_image_zoom}%`,
                            }}
                          />
                        </div>

                        {/* Zoom control */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-gray-600">Zoom</label>
                            <span className="text-xs text-gray-500">{formData.hero_image_zoom}%</span>
                          </div>
                          <input
                            type="range"
                            min="100"
                            max="200"
                            value={formData.hero_image_zoom}
                            onChange={(e) => handleChange('hero_image_zoom', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                        </div>

                        {/* Position controls */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-medium text-gray-600">Pozícia X</label>
                              <span className="text-xs text-gray-500">{formData.hero_image_pos_x}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={formData.hero_image_pos_x}
                              onChange={(e) => handleChange('hero_image_pos_x', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-medium text-gray-600">Pozícia Y</label>
                              <span className="text-xs text-gray-500">{formData.hero_image_pos_y}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={formData.hero_image_pos_y}
                              onChange={(e) => handleChange('hero_image_pos_y', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                          </div>
                        </div>

                        {/* Reset button */}
                        <button
                          type="button"
                          onClick={() => {
                            handleChange('hero_image_zoom', 100);
                            handleChange('hero_image_pos_x', 50);
                            handleChange('hero_image_pos_y', 50);
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700"
                        >
                          Resetovať na predvolené
                        </button>
                      </div>
                    )}

                    {/* Upload button */}
                    <div className="flex gap-2">
                      <input
                        ref={heroImageInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => handleFileSelect(e, 'hero')}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => heroImageInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-purple-600" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-sm text-gray-600">{uploadProgress}</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-600">Nahrať obrázok z počítača</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Podporované formáty: JPG, PNG, WebP, GIF (max 5MB). Automaticky sa skonvertuje na WebP.
                    </p>

                    {/* Or use URL */}
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Alebo zadajte URL:</p>
                      <input
                        type="url"
                        value={formData.hero_image_url}
                        onChange={(e) => handleChange('hero_image_url', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nadpis
                    </label>
                    <input
                      type="text"
                      value={formData.hero_title}
                      onChange={(e) => handleChange('hero_title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Vaša spoľahlivá taxislužba"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Podnadpis
                    </label>
                    <input
                      type="text"
                      value={formData.hero_subtitle}
                      onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Profesionálna preprava 24/7"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Vizuálny štýl stránky</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Vyberte si univerzálny skin. Zmena sa zobrazí v náhľade okamžite.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {PARTNER_SKINS.map((skin) => {
                      const isSelected = formData.template_variant === skin.id;

                      return (
                        <button
                          key={skin.id}
                          type="button"
                          onClick={() => handleChange('template_variant', skin.id)}
                          className={`text-left rounded-xl border p-3 transition-all ${
                            isSelected
                              ? 'border-gray-900 ring-2 ring-gray-900'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className={`partner-skin partner-skin--${skin.id} partner-skin-option rounded-lg p-3`}>
                            <div className="text-sm font-semibold">{skin.name}</div>
                            <p className="text-xs opacity-90 mt-1">{skin.description}</p>
                          </div>
                          {isSelected && (
                            <div className="mt-2 text-xs font-semibold text-gray-900">Vybrané</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fotogaléria ({formData.gallery.length}/{GALLERY_LIMIT} obrázkov)
                    </label>
                    <p className="text-xs text-gray-500 mb-4">
                      Pridajte obrázky vašich vozidiel, interiéru alebo služieb. Obrázky sa automaticky skonvertujú na WebP.
                      {formData.gallery.length >= GALLERY_LIMIT && (
                        <span className="text-amber-600 font-medium"> Dosiahnutý limit.</span>
                      )}
                    </p>

                    {/* Gallery grid */}
                    {formData.gallery.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {formData.gallery.map((url, index) => (
                          <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={getThumbnailUrl(url)}
                              alt={`Galéria ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleGalleryRemove(index)}
                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                title="Odstrániť obrázok"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload area */}
                    <input
                      ref={galleryImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      onChange={handleGalleryFileSelect}
                      className="hidden"
                    />
                    {formData.gallery.length >= GALLERY_LIMIT ? (
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">Galéria je plná ({GALLERY_LIMIT} obrázkov)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => galleryImageInputRef.current?.click()}
                        disabled={galleryUploading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {galleryUploading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-purple-600" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-sm text-gray-600">Nahrávam obrázky...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-sm text-gray-600">Pridať obrázky do galérie</span>
                          </>
                        )}
                      </button>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Podporované formáty: JPG, PNG, WebP, GIF (max 5MB na obrázok). Môžete vybrať viacero naraz.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        facebook.com/
                      </span>
                      <input
                        type="text"
                        value={formData.social_facebook}
                        onChange={(e) => handleChange('social_facebook', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="vase-taxi"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        @
                      </span>
                      <input
                        type="text"
                        value={formData.social_instagram}
                        onChange={(e) => handleChange('social_instagram', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="vase_taxi"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Panel */}
          <TaxiPreview
            formData={formData}
            partnerSlug={partner.slug}
            cityName={cityName}
          />
        </div>
      </div>
    </div>
  );
}
