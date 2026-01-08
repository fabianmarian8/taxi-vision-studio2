'use client';

import { ReactNode, useContext, useState } from 'react';
import { EditableField, ImageCropEditor, GalleryEditor, ServiceTagsEditor, ButtonLinksEditor, type ButtonLinks } from '@/components/inline-editor';
import { EditorContext } from '@/components/inline-editor/InlineEditorProvider';
import { ImageIcon, Images, Tags, Settings, Phone, MessageCircle, Clock, FileText, ScrollText, Mail, Facebook, Instagram, Globe, Users, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PartnerPageContentProps {
  children: ReactNode;
}

/**
 * Client wrapper that provides inline editing capabilities
 * Wraps partner page content and enables EditableField components
 */
export function PartnerPageContent({ children }: PartnerPageContentProps) {
  return <>{children}</>;
}

/**
 * Hook that safely accesses InlineEditor context
 * Returns defaults when context is not available (e.g., during SSR or outside provider)
 */
function useSafeInlineEditor() {
  const context = useContext(EditorContext);

  if (!context) {
    // Return safe defaults when outside provider
    return {
      isEditMode: false,
      draftData: {} as Record<string, string | number | string[] | undefined>,
      openEditor: (() => {}) as (fieldKey: string, fieldType: string, label: string) => void,
    };
  }

  return context;
}

/**
 * Editable hero title - h1 element
 */
export function EditableHeroTitle({ defaultValue }: { defaultValue: string }) {
  const { isEditMode, draftData, openEditor } = useSafeInlineEditor();
  // Use ?? to allow empty string, use 'in' check to differentiate between undefined and empty
  const value = 'hero_title' in draftData ? (draftData.hero_title as string) ?? defaultValue : defaultValue;

  return (
    <EditableField
      fieldKey="hero_title"
      fieldType="text"
      label="Názov taxislužby"
      isEditMode={isEditMode}
      onClick={openEditor}
    >
      <h1 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2">
        {value}
      </h1>
    </EditableField>
  );
}

/**
 * Editable hero subtitle
 */
export function EditableHeroSubtitle({ defaultValue }: { defaultValue: string }) {
  const { isEditMode, draftData, openEditor } = useSafeInlineEditor();
  const value = 'hero_subtitle' in draftData ? (draftData.hero_subtitle as string) ?? defaultValue : defaultValue;

  return (
    <EditableField
      fieldKey="hero_subtitle"
      fieldType="text"
      label="Popis v hero sekcii"
      isEditMode={isEditMode}
      onClick={openEditor}
    >
      <p className="text-white/90 text-sm md:text-base">
        {value}
      </p>
    </EditableField>
  );
}

/**
 * Editable description section
 */
export function EditableDescription({ defaultValue }: { defaultValue: string }) {
  const { isEditMode, draftData, openEditor } = useSafeInlineEditor();
  const value = 'description' in draftData ? (draftData.description as string) ?? defaultValue : defaultValue;

  if (!value && !isEditMode) return null;

  return (
    <div className="mt-6 md:mt-8 partner-card rounded-xl p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4">O nás</h2>
      <EditableField
        fieldKey="description"
        fieldType="textarea"
        label="Popis taxislužby"
        isEditMode={isEditMode}
        onClick={openEditor}
      >
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed whitespace-pre-line">
          {value || 'Kliknite pre pridanie popisu...'}
        </p>
      </EditableField>
    </div>
  );
}

/**
 * Editable phone number
 */
export function EditablePhone({ defaultValue }: { defaultValue: string }) {
  const { isEditMode, draftData, openEditor } = useSafeInlineEditor();
  const value = 'phone' in draftData ? (draftData.phone as string) ?? defaultValue : defaultValue;

  return (
    <EditableField
      fieldKey="phone"
      fieldType="phone"
      label="Telefónne číslo"
      isEditMode={isEditMode}
      onClick={openEditor}
    >
      <span>{value}</span>
    </EditableField>
  );
}

/**
 * Editable company name (for non-hero usage)
 */
export function EditableCompanyName({ defaultValue }: { defaultValue: string }) {
  const { isEditMode, draftData, openEditor } = useSafeInlineEditor();
  const value = 'company_name' in draftData ? (draftData.company_name as string) ?? defaultValue : defaultValue;

  return (
    <EditableField
      fieldKey="company_name"
      fieldType="text"
      label="Názov spoločnosti"
      isEditMode={isEditMode}
      onClick={openEditor}
    >
      <span>{value}</span>
    </EditableField>
  );
}

/**
 * Editable hero image with crop/zoom/position controls
 */
interface EditableHeroImageProps {
  defaultImage: string | null;
  defaultZoom?: number;
  defaultPosX?: number;
  defaultPosY?: number;
  children: ReactNode; // The actual hero image container
  partnerId?: string | null;
}

export function EditableHeroImage({
  defaultImage,
  defaultZoom = 100,
  defaultPosX = 50,
  defaultPosY = 50,
  children,
  partnerId
}: EditableHeroImageProps) {
  const context = useContext(EditorContext);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const isEditMode = context?.isEditMode ?? false;
  const draftData = context?.draftData ?? {};
  const saveField = context?.saveField;

  // Get current values from draft or defaults
  const currentImage = 'hero_image_url' in draftData ? (draftData.hero_image_url as string) ?? defaultImage : defaultImage;
  const currentZoom = (draftData.hero_image_zoom as number) ?? defaultZoom;
  const currentPosX = (draftData.hero_image_pos_x as number) ?? defaultPosX;
  const currentPosY = (draftData.hero_image_pos_y as number) ?? defaultPosY;

  const handleSave = (image: string | null, zoom: number, posX: number, posY: number) => {
    if (saveField) {
      if (image !== null) saveField('hero_image_url', image);
      saveField('hero_image_zoom', zoom);
      saveField('hero_image_pos_x', posX);
      saveField('hero_image_pos_y', posY);
    }
  };

  // CSS variables for hero background - always set from current values (draft or default)
  const heroStyle = {
    '--hero-image': currentImage ? `url(${currentImage})` : 'none',
    '--hero-pos-x': `${currentPosX}%`,
    '--hero-pos-y': `${currentPosY}%`,
    '--hero-zoom': `${currentZoom}%`,
  } as React.CSSProperties;

  if (!isEditMode) {
    // In non-edit mode, just pass through with CSS vars for potential draft preview
    return <div style={heroStyle}>{children}</div>;
  }

  // In edit mode, wrap with click handler and edit UI
  return (
    <>
      <div
        className="relative group cursor-pointer"
        style={heroStyle}
        onClick={() => setIsEditorOpen(true)}
      >
        {/* Highlight border */}
        <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-yellow-400 rounded-xl md:rounded-2xl transition-colors pointer-events-none z-10" />

        {/* Edit indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="bg-yellow-400 text-gray-900 rounded-full p-2 shadow-lg flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm font-medium pr-1">Upraviť obrázok</span>
          </div>
        </div>

        {/* Always render children - they read CSS vars for background */}
        <div className="group-hover:opacity-90 transition-opacity">
          {children}
        </div>
      </div>

      <ImageCropEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        currentImage={currentImage}
        currentZoom={currentZoom}
        currentPosX={currentPosX}
        currentPosY={currentPosY}
        onSave={handleSave}
        label="Hero obrázok"
        enableUpload={!!partnerId}
      />
    </>
  );
}

/**
 * Editable gallery section with live preview
 * Renders gallery directly with images from draft data
 */
interface EditableGalleryProps {
  defaultImages: string[];
  serviceName: string;
  partnerId?: string | null;
}

// Helper to get thumbnail path
function getThumbnail(imagePath: string): string {
  if (!imagePath) return imagePath;
  const ext = imagePath.lastIndexOf('.');
  if (ext === -1) return imagePath;
  return imagePath.slice(0, ext) + '-thumb' + imagePath.slice(ext);
}

export function EditableGallery({ defaultImages, serviceName, partnerId }: EditableGalleryProps) {
  const context = useContext(EditorContext);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isEditMode = context?.isEditMode ?? false;
  const draftData = context?.draftData ?? {};
  const saveField = context?.saveField;

  // Get images from draft or defaults - live update!
  const currentImages = 'gallery' in draftData
    ? (draftData.gallery as string[]) || []
    : defaultImages || [];

  const handleSave = (images: string[]) => {
    if (saveField) {
      saveField('gallery', images);
    }
  };

  // Lightbox handlers
  const openLightbox = (index: number) => {
    if (isEditMode) {
      setIsEditorOpen(true);
      return;
    }
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % currentImages.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  };

  // Gallery content with thumbnails
  const galleryContent = currentImages.length > 0 ? (
    <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
      {currentImages.map((image, idx) => (
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
  ) : null;

  // Empty state placeholder
  const emptyPlaceholder = (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
      <Images className="w-10 h-10 text-gray-300 mx-auto mb-2" />
      <p className="text-gray-500 text-sm">
        {isEditMode ? 'Kliknite pre pridanie obrázkov' : 'Žiadne obrázky v galérii'}
      </p>
    </div>
  );

  // Non-edit mode: show gallery with lightbox
  if (!isEditMode) {
    if (currentImages.length === 0) return null;

    return (
      <>
        <div className="mt-6">
          {galleryContent}
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
            >
              <X className="h-8 w-8" />
            </button>

            {currentImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 text-white/80 hover:text-white p-2 z-10"
              >
                <ChevronLeft className="h-10 w-10" />
              </button>
            )}

            <div
              className="max-w-[90vw] max-h-[85vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentImages[currentIndex]}
                alt={`${serviceName} - foto ${currentIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                {currentIndex + 1} / {currentImages.length}
              </div>
            </div>

            {currentImages.length > 1 && (
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

  // Edit mode: show editable gallery
  return (
    <>
      <div className="mt-6">
        <div className="relative group cursor-pointer" onClick={() => setIsEditorOpen(true)}>
          {/* Highlight border */}
          <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-yellow-400 rounded-xl transition-colors pointer-events-none z-10" />

          {/* Edit indicator */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <div className="bg-yellow-400 text-gray-900 rounded-full p-2 shadow-lg flex items-center gap-2">
              <Images className="w-4 h-4" />
              <span className="text-sm font-medium pr-1">Upraviť galériu ({currentImages.length})</span>
            </div>
          </div>

          {/* Content with live preview */}
          <div className="group-hover:opacity-90 transition-opacity">
            {currentImages.length > 0 ? galleryContent : emptyPlaceholder}
          </div>
        </div>
      </div>

      <GalleryEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        currentImages={currentImages}
        onSave={handleSave}
        label="Galéria"
        enableUpload={!!partnerId}
      />
    </>
  );
}

/**
 * Editable services/tags section
 */
interface EditableServicesProps {
  defaultServices: string[];
  children: ReactNode;
}

export function EditableServices({ defaultServices, children }: EditableServicesProps) {
  const context = useContext(EditorContext);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const isEditMode = context?.isEditMode ?? false;
  const draftData = context?.draftData ?? {};
  const saveField = context?.saveField;

  const currentServices = (draftData.services as string[]) || defaultServices;

  const handleSave = (services: string[]) => {
    if (saveField) {
      saveField('services', services);
    }
  };

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setIsEditorOpen(true)}>
        {/* Highlight border */}
        <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-yellow-400 rounded-xl transition-colors pointer-events-none z-10" />

        {/* Edit indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="bg-yellow-400 text-gray-900 rounded-full p-2 shadow-lg flex items-center gap-2">
            <Tags className="w-4 h-4" />
            <span className="text-sm font-medium pr-1">Upraviť služby</span>
          </div>
        </div>

        {/* Content */}
        <div className="group-hover:opacity-90 transition-opacity">
          {children}
        </div>
      </div>

      <ServiceTagsEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        currentTags={currentServices}
        onSave={handleSave}
        label="Služby"
      />
    </>
  );
}

/**
 * Editable contact buttons section (WhatsApp, booking, email, social, etc.)
 * Renders buttons directly with live preview from draft data
 */
interface EditableContactButtonsProps {
  defaultLinks: ButtonLinks;
  citySlug?: string;
  serviceName?: string;
}

export function EditableContactButtons({ defaultLinks, citySlug, serviceName }: EditableContactButtonsProps) {
  const context = useContext(EditorContext);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const isEditMode = context?.isEditMode ?? false;
  const draftData = context?.draftData ?? {};
  const saveField = context?.saveField;

  // Helper: use draft value if it exists (even empty string), otherwise use default
  const getValue = (draftKey: string, defaultValue: string): string => {
    if (draftKey in draftData) {
      return (draftData[draftKey] as string) || '';
    }
    return defaultValue || '';
  };

  // Get current values from draft or defaults - these update live!
  const whatsapp = getValue('whatsapp', defaultLinks.whatsapp);
  const bookingUrl = getValue('booking_url', defaultLinks.booking_url);
  const pricelistUrl = getValue('pricelist_url', defaultLinks.pricelist_url);
  const transportRulesUrl = getValue('transport_rules_url', defaultLinks.transport_rules_url);
  const email = getValue('email', defaultLinks.email);
  const facebookRaw = getValue('social_facebook', defaultLinks.facebook);
  const instagramRaw = getValue('social_instagram', defaultLinks.instagram);
  const website = getValue('website', defaultLinks.website);
  const contactUrl = getValue('contact_url', defaultLinks.contact_url);

  // Build full URLs for social links
  const facebook = facebookRaw
    ? (facebookRaw.startsWith('http') ? facebookRaw : `https://facebook.com/${facebookRaw}`)
    : '';
  const instagram = instagramRaw
    ? (instagramRaw.startsWith('http') ? instagramRaw : `https://instagram.com/${instagramRaw}`)
    : '';

  const currentLinks: ButtonLinks = {
    whatsapp,
    booking_url: bookingUrl,
    pricelist_url: pricelistUrl,
    transport_rules_url: transportRulesUrl,
    email,
    facebook: facebookRaw,
    instagram: instagramRaw,
    website,
    contact_url: contactUrl,
  };

  // Click tracking for WhatsApp
  const handleWhatsAppClick = () => {
    if (!isEditMode && citySlug && serviceName) {
      fetch('/api/track/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'whatsapp_click',
          city_slug: citySlug,
          service_name: serviceName,
          phone_number: whatsapp,
        }),
      }).catch(() => {});
    }
  };

  const handleSave = (links: ButtonLinks) => {
    if (saveField) {
      saveField('whatsapp', links.whatsapp);
      saveField('booking_url', links.booking_url);
      saveField('pricelist_url', links.pricelist_url);
      saveField('transport_rules_url', links.transport_rules_url);
      saveField('email', links.email);
      saveField('social_facebook', links.facebook);
      saveField('social_instagram', links.instagram);
      saveField('website', links.website);
      saveField('contact_url', links.contact_url);
    }
  };

  // Render buttons directly with live values
  const buttonsContent = (
    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3">
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/[\s+]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 md:gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
          onClick={(e) => {
            if (isEditMode) {
              e.preventDefault();
            } else {
              handleWhatsAppClick();
            }
          }}
        >
          <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
          <span>WhatsApp</span>
        </a>
      )}
      {bookingUrl && (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 md:gap-2 partner-accent-btn font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
          onClick={(e) => isEditMode && e.preventDefault()}
        >
          <Clock className="h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">Časová </span>Objednávka
        </a>
      )}
      {pricelistUrl && (
        <a
          href={pricelistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 md:gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
          onClick={(e) => isEditMode && e.preventDefault()}
        >
          <FileText className="h-4 w-4 md:h-5 md:w-5" />
          <span>Cenník</span>
        </a>
      )}
      {transportRulesUrl && (
        <a
          href={transportRulesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 md:gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
          onClick={(e) => isEditMode && e.preventDefault()}
        >
          <ScrollText className="h-4 w-4 md:h-5 md:w-5" />
          <span>Prepravný poriadok</span>
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="flex items-center justify-center gap-1.5 md:gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
          onClick={(e) => isEditMode && e.preventDefault()}
        >
          <Mail className="h-4 w-4 md:h-5 md:w-5" />
          <span>Email</span>
        </a>
      )}
      {facebook && (
        <a
          href={facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 md:gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
          onClick={(e) => isEditMode && e.preventDefault()}
        >
          <Facebook className="h-4 w-4 md:h-5 md:w-5" />
          <span>Facebook</span>
        </a>
      )}
      {instagram && (
        <a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 md:gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
          onClick={(e) => isEditMode && e.preventDefault()}
        >
          <Instagram className="h-4 w-4 md:h-5 md:w-5" />
          <span>Instagram</span>
        </a>
      )}
      {website && (
        <a
          href={website.startsWith('http') ? website : `https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 md:gap-2 bg-gray-700 hover:bg-gray-800 text-white font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
          onClick={(e) => isEditMode && e.preventDefault()}
        >
          <Globe className="h-4 w-4 md:h-5 md:w-5" />
          <span>Web</span>
        </a>
      )}
      {contactUrl && (
        <a
          href={contactUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 md:gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
          onClick={(e) => isEditMode && e.preventDefault()}
        >
          <Users className="h-4 w-4 md:h-5 md:w-5" />
          <span>Kontakt</span>
        </a>
      )}
    </div>
  );

  // In edit mode, show placeholder if no buttons at all
  const hasAnyButton = whatsapp || bookingUrl || pricelistUrl || transportRulesUrl || email || facebook || instagram || website || contactUrl;

  if (!isEditMode) {
    return hasAnyButton ? buttonsContent : null;
  }

  // Placeholder for empty state in edit mode
  const emptyPlaceholder = (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
      <Settings className="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p className="text-gray-500 text-sm">Kliknite pre pridanie tlačidiel</p>
    </div>
  );

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setIsEditorOpen(true)}>
        {/* Highlight border */}
        <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-yellow-400 rounded-xl transition-colors pointer-events-none z-10" />

        {/* Edit indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="bg-yellow-400 text-gray-900 rounded-full p-2 shadow-lg flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium pr-1">Upraviť tlačidlá</span>
          </div>
        </div>

        {/* Content with live preview or placeholder */}
        <div className="group-hover:opacity-90 transition-opacity">
          {hasAnyButton ? buttonsContent : emptyPlaceholder}
        </div>
      </div>

      <ButtonLinksEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        currentLinks={currentLinks}
        onSave={handleSave}
      />
    </>
  );
}

/**
 * Editable phone button with live preview
 * Renders the phone call button directly with value from draft
 */
interface EditablePhoneButtonProps {
  defaultPhone: string;
  citySlug?: string;
  serviceName?: string;
}

export function EditablePhoneButton({ defaultPhone, citySlug, serviceName }: EditablePhoneButtonProps) {
  const context = useContext(EditorContext);
  const isEditMode = context?.isEditMode ?? false;
  const draftData = context?.draftData ?? {};
  const openEditor = context?.openEditor;

  // Live phone value from draft or default
  const currentPhone = 'phone' in draftData ? (draftData.phone as string) ?? defaultPhone : defaultPhone;

  if (!currentPhone) return null;

  // Click tracking for phone
  const handlePhoneClick = () => {
    if (!isEditMode && citySlug && serviceName) {
      fetch('/api/track/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'phone_click',
          city_slug: citySlug,
          service_name: serviceName,
          phone_number: currentPhone,
        }),
      }).catch(() => {});
    }
  };

  // Render the phone button directly
  const phoneButton = (
    <a
      href={`tel:${currentPhone}`}
      className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-black text-base md:text-lg px-4 py-3.5 md:py-4 rounded-xl transition-colors shadow-lg"
      onClick={(e) => {
        if (isEditMode) {
          e.preventDefault();
        } else {
          handlePhoneClick();
        }
      }}
    >
      <Phone className="h-5 w-5" />
      {currentPhone}
    </a>
  );

  if (!isEditMode) {
    return phoneButton;
  }

  return (
    <div
      className="relative group cursor-pointer"
      onClick={() => openEditor?.('phone', 'phone', 'Telefónne číslo')}
    >
      {/* Highlight border */}
      <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-yellow-400 rounded-xl transition-colors pointer-events-none z-10" />

      {/* Edit indicator */}
      <div className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="bg-yellow-400 text-gray-900 rounded-full p-1.5 shadow-lg">
          <Phone className="w-3 h-3" />
        </div>
      </div>

      {/* Content with live preview */}
      <div className="group-hover:opacity-90 transition-opacity">
        {phoneButton}
      </div>
    </div>
  );
}
