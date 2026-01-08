'use client';

import { useState } from 'react';
import {
  Phone, Globe, Star, BadgeCheck, Clock, ArrowLeft, Mail, Camera, Images,
  MessageCircle, FileText, ScrollText, Users, X, ChevronLeft, ChevronRight,
  Facebook, Instagram, CheckCircle2, Pencil
} from 'lucide-react';
import {
  InlineEditorProvider,
  useInlineEditor,
  EditableField,
  ImageCropEditor,
  GalleryEditor,
  ServiceTagsEditor,
  ButtonLinksEditor,
  type ButtonLinks,
} from '@/components/inline-editor';
import { Header } from '@/components/Header';

// Initial services tags (separate from MOCK_PARTNER_DATA to avoid type conflict)
const INITIAL_SERVICES_TAGS = [
  'Taxi 6+1 (Sedemmiestne taxi)',
  'SKI taxi servis Chopok Juh',
  'Hotelový a letiskový transfer',
  'Kuriér express do 6h',
  'Drink & drive taxi',
  'Asistenčné služby',
  'Platba kartou',
  'Nonstop',
];

// Real partner data - R.S.T. Taxi & Ski Taxi Podbrezová (presne z cities.json)
const MOCK_PARTNER_DATA = {
  // Základné údaje zo service
  company_name: 'R.S.T. Taxi & Ski Taxi 6+1',
  phone: '+421904334971',
  website: 'https://taxipodbrezova.sk/',
  logo: '/logos/rst-taxi-podbrezova.webp',
  address: 'Kolkáreň 17/22, Podbrezová',

  // Z partnerData
  hero_title: 'R.S.T. Taxi & Ski Taxi 6+1',
  hero_subtitle: 'Profesionálna taxislužba v meste Brezno',
  hero_image_url: '/gallery/rst-taxi/rst-taxi-1.webp', // Používame vlastný RST Taxi obrázok namiesto placeholder
  description: 'R.S.T. Taxi & Ski Taxi 6+1 je profesionálna taxislužba v regióne Horehronie. Špecializujeme sa na ski transfery, letiskové transfery a prepravu väčších skupín v sedemmiestnom vozidle. Ponúkame komplexné služby vrátane kuriérskych služieb a asistenčnej pomoci.',

  // Služby z description poľa (nie z partnerData.services)
  services_description: `R.S.T. Taxi & Ski Taxi 6+1 Podbrezová - Brezno a okolie

• Taxi 6+1 (Sedemmiestne taxi)
• Hotelový a letiskový transfer
• SKI taxi servis Chopok Juh a okolie
• Preprava osôb a batožiny v regióne Horehronie, v rámci SR a EÚ
• Časová objednávka prepravy na Vami požadovaný deň a presný čas
• Kuriér express - doručenie malých zásielok do 6h po celej SR
• Donášková služba - nákup a doručenie tovaru
• Drink & drive taxi
• Asistenčné služby - dodanie PHM a prevádzkových kvapalín, núdzové štartovanie vozidla
• Možnosť bezkontaktnej platby`,

  // Z partnerData
  cta_title: 'do okolitých obcí, alebo do oblasti Nízkych Tatier pod Chopkom Juh',
  whatsapp: '+421904334971',
  booking_url: 'https://taxipodbrezova.sk/ponuka/taxi-casova-objednavka',
  pricelist_url: 'https://taxipodbrezova.sk/info/rst-taxi-cennik',
  transport_rules_url: 'https://taxipodbrezova.sk/info/prepravný-poriadok',
  contact_url: 'https://taxipodbrezova.sk/kontakt',
  working_hours: 'Nonstop 24/7',
  email: 'info@taxipodbrezova.sk',
  facebook: 'https://www.facebook.com/rsttaxi',
  instagram: 'https://www.instagram.com/rsttaxi',
};

// Real gallery images from R.S.T. Taxi (thumbnails are auto-generated via getThumbnail function)
const INITIAL_GALLERY = [
  '/gallery/rst-taxi/rst-taxi-1.webp',
  '/gallery/rst-taxi/rst-taxi-2.webp',
  '/gallery/rst-taxi/rst-taxi-3.webp',
  '/gallery/rst-taxi/rst-taxi-4.webp',
  '/gallery/rst-taxi/rst-taxi-5.webp',
  '/gallery/rst-taxi/rst-taxi-6.webp',
];

// Inner component that uses the editor context
function PartnerPageContent() {
  const { isEditMode, draftData, openEditor } = useInlineEditor();

  // Extended state for images (initialized with real R.S.T. Taxi data)
  const [heroImage, setHeroImage] = useState<string | null>(MOCK_PARTNER_DATA.hero_image_url);
  const [heroZoom, setHeroZoom] = useState(120);
  const [heroPosX, setHeroPosX] = useState(50);
  const [heroPosY, setHeroPosY] = useState(30);
  const [gallery, setGallery] = useState<string[]>(INITIAL_GALLERY);

  // Extended text fields (not in basic context)
  const [servicesDescription, setServicesDescription] = useState(MOCK_PARTNER_DATA.services_description);
  const [ctaTitle, setCtaTitle] = useState(MOCK_PARTNER_DATA.cta_title);
  const [servicesTags, setServicesTags] = useState<string[]>(INITIAL_SERVICES_TAGS);

  // Button links state
  const [buttonLinks, setButtonLinks] = useState<ButtonLinks>({
    whatsapp: MOCK_PARTNER_DATA.whatsapp,
    booking_url: MOCK_PARTNER_DATA.booking_url,
    pricelist_url: MOCK_PARTNER_DATA.pricelist_url,
    transport_rules_url: MOCK_PARTNER_DATA.transport_rules_url,
    email: MOCK_PARTNER_DATA.email,
    facebook: MOCK_PARTNER_DATA.facebook,
    instagram: MOCK_PARTNER_DATA.instagram,
    website: MOCK_PARTNER_DATA.website,
    contact_url: MOCK_PARTNER_DATA.contact_url,
  });

  // Editor states
  const [heroEditorOpen, setHeroEditorOpen] = useState(false);
  const [galleryEditorOpen, setGalleryEditorOpen] = useState(false);
  const [servicesTagsEditorOpen, setServicesTagsEditorOpen] = useState(false);
  const [buttonLinksEditorOpen, setButtonLinksEditorOpen] = useState(false);

  // Handle hero image save
  const handleHeroSave = (image: string | null, zoom: number, posX: number, posY: number) => {
    setHeroImage(image);
    setHeroZoom(zoom);
    setHeroPosX(posX);
    setHeroPosY(posY);
  };

  // Handle gallery save
  const handleGallerySave = (images: string[]) => {
    setGallery(images);
  };

  // Handle services tags save
  const handleServicesTagsSave = (tags: string[]) => {
    setServicesTags(tags);
  };

  // Handle button links save
  const handleButtonLinksSave = (links: ButtonLinks) => {
    setButtonLinks(links);
  };

  return (
    <div className="min-h-screen overflow-x-hidden partner-page-bg">
      <Header />

      {/* Hero Section - Partner (identical to real page) */}
      <section className="pt-0 pb-8 md:pb-12">
        {/* Breadcrumbs */}
        <div className="container mx-auto max-w-4xl px-4">
          <nav className="flex items-center gap-2 text-sm py-3 text-foreground/60">
            <a href="#" className="hover:text-foreground transition-colors">Banskobystrický kraj</a>
            <span>/</span>
            <a href="#" className="hover:text-foreground transition-colors">Brezno</a>
            <span>/</span>
            <span className="text-foreground font-medium">{draftData.hero_title || 'R.S.T. Taxi'}</span>
          </nav>
        </div>

        {/* Hero with constrained width */}
        <div className="container mx-auto max-w-4xl px-4">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-bold mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Späť na zoznam taxislužieb
          </a>

          {/* Hero - with image or gradient fallback */}
          <div
            className={`relative rounded-xl md:rounded-2xl overflow-hidden mb-6 md:mb-8 h-[200px] md:h-[260px] ${isEditMode ? 'cursor-pointer group' : ''}`}
            onClick={() => isEditMode && setHeroEditorOpen(true)}
          >
            {/* Background */}
            {heroImage ? (
              <div
                className="absolute inset-0 bg-no-repeat"
                style={{
                  backgroundImage: `url(${heroImage})`,
                  backgroundPosition: `${heroPosX}% ${heroPosY}%`,
                  backgroundSize: `${heroZoom}%`,
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800" />
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Edit overlay (only in edit mode) */}
            {isEditMode && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center z-20">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Upraviť hero obrázok
                </div>
              </div>
            )}

            {/* Content */}
            <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 md:p-8">
              {/* Badges */}
              <div className="flex gap-1.5 md:gap-2 mb-2 md:mb-4">
                <div className="bg-green-500 text-white text-[10px] md:text-xs font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full flex items-center gap-1">
                  <BadgeCheck className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  OVERENÉ
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 text-[10px] md:text-xs font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  PARTNER
                </div>
              </div>

              {/* Editable Title */}
              <EditableField
                fieldKey="hero_title"
                fieldType="text"
                label="Názov taxislužby"
                isEditMode={isEditMode}
                onClick={openEditor}
              >
                <h1 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2">
                  {draftData.hero_title || 'Názov taxislužby'}
                </h1>
              </EditableField>

              {/* Subtitle */}
              <p className="text-white/90 text-sm md:text-base">
                Profesionálna taxislužba v meste Brezno
              </p>

              {/* Web & Contact buttons in hero */}
              <div className="flex gap-2 md:gap-3 mt-2 md:mt-3">
                <a
                  href={draftData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold text-sm md:text-base px-3 md:px-5 py-2 md:py-2.5 rounded-lg transition-colors"
                  onClick={(e) => isEditMode && e.preventDefault()}
                >
                  <Globe className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Web</span>
                </a>
                <a
                  href="#"
                  className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold text-sm md:text-base px-3 md:px-5 py-2 md:py-2.5 rounded-lg transition-colors"
                >
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Kontakt</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact buttons */}
          <div className="space-y-3 mb-6">
            {/* Editable Phone */}
            <EditableField
              fieldKey="phone"
              fieldType="phone"
              label="Telefónne číslo"
              isEditMode={isEditMode}
              onClick={openEditor}
            >
              <a
                href={`tel:${draftData.phone}`}
                className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-black text-base md:text-lg px-4 py-3.5 md:py-4 rounded-xl transition-colors shadow-lg"
                onClick={(e) => isEditMode && e.preventDefault()}
              >
                <Phone className="h-5 w-5" />
                {draftData.phone || '+421 XXX XXX XXX'}
              </a>
            </EditableField>

            {/* Secondary buttons - matching real page */}
            <div className="relative">
              {isEditMode && (
                <button
                  onClick={() => setButtonLinksEditorOpen(true)}
                  className="absolute -top-6 right-0 flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-full transition-colors z-10"
                >
                  <Pencil className="h-3 w-3" />
                  Upraviť tlačidlá
                </button>
              )}
              <div
                className={`grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3 ${isEditMode ? 'cursor-pointer' : ''}`}
                onClick={() => isEditMode && setButtonLinksEditorOpen(true)}
              >
                {buttonLinks.whatsapp && (
                  <a
                    href={`https://wa.me/${buttonLinks.whatsapp.replace(/[\s+]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 md:gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
                    onClick={(e) => isEditMode && e.preventDefault()}
                  >
                    <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {buttonLinks.booking_url && (
                  <a
                    href={buttonLinks.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 md:gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
                    onClick={(e) => isEditMode && e.preventDefault()}
                  >
                    <Clock className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="hidden sm:inline">Časová </span>Objednávka
                  </a>
                )}
                {buttonLinks.pricelist_url && (
                  <a
                    href={buttonLinks.pricelist_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 md:gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
                    onClick={(e) => isEditMode && e.preventDefault()}
                  >
                    <FileText className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Cenník</span>
                  </a>
                )}
                {buttonLinks.transport_rules_url && (
                  <a
                    href={buttonLinks.transport_rules_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 md:gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
                    onClick={(e) => isEditMode && e.preventDefault()}
                  >
                    <ScrollText className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Prepravný poriadok</span>
                  </a>
                )}
                {buttonLinks.email && (
                  <a
                    href={`mailto:${buttonLinks.email}`}
                    className="flex items-center justify-center gap-1.5 md:gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
                    onClick={(e) => isEditMode && e.preventDefault()}
                  >
                    <Mail className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Email</span>
                  </a>
                )}
                {buttonLinks.facebook && (
                  <a
                    href={buttonLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 md:gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
                    onClick={(e) => isEditMode && e.preventDefault()}
                  >
                    <Facebook className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Facebook</span>
                  </a>
                )}
                {buttonLinks.instagram && (
                  <a
                    href={buttonLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 md:gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-bold text-sm md:text-base px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors"
                    onClick={(e) => isEditMode && e.preventDefault()}
                  >
                    <Instagram className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Gallery - under contact buttons (identical to real page) */}
          {gallery.length > 0 && (
            <div className="mt-6">
              <GallerySection
                gallery={gallery}
                isEditMode={isEditMode}
                onEdit={() => setGalleryEditorOpen(true)}
                serviceName={draftData.hero_title || 'R.S.T. Taxi'}
              />
            </div>
          )}

          {/* About / Description Section - from partner portal */}
          <DescriptionSection
            description={draftData.description || ''}
            isEditMode={isEditMode}
            openEditor={openEditor}
          />

          {/* Ponúkané služby - tags/chips section (identical to real page) */}
          {servicesTags.length > 0 && (
            <div className="mt-6 md:mt-8 bg-white/90 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-lg md:text-xl font-bold text-foreground">Ponúkané služby</h2>
                {isEditMode && (
                  <button
                    onClick={() => setServicesTagsEditorOpen(true)}
                    className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-full transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    Upraviť
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {servicesTags.map((service, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Custom description / services - Mobile optimized */}
          <ServicesSection
            services={draftData.services_description || servicesDescription}
            isEditMode={isEditMode}
            openEditor={openEditor}
          />
        </div>
      </section>

      {/* Features Section - Mobile optimized (identical to real page) */}
      <section className="py-8 md:py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-xl md:text-3xl font-black text-foreground mb-6 md:mb-8 text-center">
            Prečo si vybrať {draftData.hero_title || 'R.S.T. Taxi'}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            <div className="flex md:flex-col items-center md:text-center p-4 md:p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm gap-3 md:gap-0">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 md:mx-auto md:mb-4">
                <BadgeCheck className="h-5 w-5 md:h-7 md:w-7 text-white" />
              </div>
              <div className="flex-1 md:flex-none">
                <h3 className="font-bold text-sm md:text-lg text-foreground md:mb-2">Overená taxislužba</h3>
                <p className="text-foreground/70 text-xs md:text-base">Partner program zaručuje kvalitu a spoľahlivosť.</p>
              </div>
            </div>
            <div className="flex md:flex-col items-center md:text-center p-4 md:p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm gap-3 md:gap-0">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 md:mx-auto md:mb-4">
                <Phone className="h-5 w-5 md:h-7 md:w-7 text-white" />
              </div>
              <div className="flex-1 md:flex-none">
                <h3 className="font-bold text-sm md:text-lg text-foreground md:mb-2">Rýchly kontakt</h3>
                <p className="text-foreground/70 text-xs md:text-base">Jednoduché objednanie taxi telefonicky.</p>
              </div>
            </div>
            <div className="flex md:flex-col items-center md:text-center p-4 md:p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm gap-3 md:gap-0">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 md:mx-auto md:mb-4">
                <Star className="h-5 w-5 md:h-7 md:w-7 text-white" />
              </div>
              <div className="flex-1 md:flex-none">
                <h3 className="font-bold text-sm md:text-lg text-foreground md:mb-2">Profesionálny prístup</h3>
                <p className="text-foreground/70 text-xs md:text-base">Skúsení vodiči a kvalitné vozidlá.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-8 md:py-16 px-4 md:px-8 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-xl md:text-3xl font-black text-purple-900 mb-2 md:mb-4">
            Potrebujete taxi {ctaTitle}?
          </h2>
          <p className="text-purple-900/70 mb-4 md:mb-6 text-sm md:text-lg">
            Zavolajte nám a odvezieme vás kam potrebujete.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`tel:${draftData.phone}`}
              className="inline-flex items-center gap-3 bg-purple-900 text-white font-black text-xl md:text-2xl px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-purple-800 transition-all"
            >
              <Phone className="h-6 w-6 md:h-7 md:w-7" />
              {draftData.phone}
            </a>
            {buttonLinks.whatsapp && (
              <a
                href={`https://wa.me/${buttonLinks.whatsapp.replace(/[\s+]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 md:py-4 rounded-xl transition-all"
              >
                <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Info box - only in edit mode */}
      {isEditMode && (
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            <strong>Režim úprav:</strong> Klikaj na editovateľné elementy pre ich úpravu.
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li><strong>Hero obrázok</strong> - posuň a zoomuj</li>
              <li><strong>Texty</strong> - názov, telefón, popis</li>
              <li><strong>Galéria</strong> - pridaj/zmaž/preusporiadaj</li>
            </ul>
          </div>
        </div>
      )}

      {/* Hero Image Editor */}
      <ImageCropEditor
        isOpen={heroEditorOpen}
        onClose={() => setHeroEditorOpen(false)}
        currentImage={heroImage}
        currentZoom={heroZoom}
        currentPosX={heroPosX}
        currentPosY={heroPosY}
        onSave={handleHeroSave}
        label="Hero obrázok"
      />

      {/* Gallery Editor */}
      <GalleryEditor
        isOpen={galleryEditorOpen}
        onClose={() => setGalleryEditorOpen(false)}
        currentImages={gallery}
        onSave={handleGallerySave}
        label="Galéria"
        maxImages={10}
      />

      {/* Services Tags Editor */}
      <ServiceTagsEditor
        isOpen={servicesTagsEditorOpen}
        onClose={() => setServicesTagsEditorOpen(false)}
        currentTags={servicesTags}
        onSave={handleServicesTagsSave}
        label="Ponúkané služby"
        maxTags={15}
      />

      {/* Button Links Editor */}
      <ButtonLinksEditor
        isOpen={buttonLinksEditorOpen}
        onClose={() => setButtonLinksEditorOpen(false)}
        currentLinks={buttonLinks}
        onSave={handleButtonLinksSave}
      />
    </div>
  );
}

// Description Section Component (identical to real page)
function DescriptionSection({
  description,
  isEditMode,
  openEditor,
}: {
  description: string;
  isEditMode: boolean;
  openEditor: (fieldKey: string, fieldType: 'text' | 'textarea' | 'phone' | 'email' | 'url' | 'image', label: string) => void;
}) {
  return (
    <div className="mt-6 md:mt-8 bg-white/90 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-sm">
      <h2 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4">O nás</h2>
      <EditableField
        fieldKey="description"
        fieldType="textarea"
        label="Popis taxislužby"
        isEditMode={isEditMode}
        onClick={openEditor}
      >
        <p className="text-sm md:text-base text-foreground/80 leading-relaxed whitespace-pre-line">
          {description || 'Popis vašej taxislužby...'}
        </p>
      </EditableField>
    </div>
  );
}

// Services Section Component (identical to real page - customDescription)
function ServicesSection({
  services,
  isEditMode,
  openEditor,
}: {
  services: string;
  isEditMode: boolean;
  openEditor: (fieldKey: string, fieldType: 'text' | 'textarea' | 'phone' | 'email' | 'url' | 'image', label: string) => void;
}) {
  return (
    <div className="mt-6 md:mt-8 bg-white/90 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-sm">
      <h2 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4">Naše služby</h2>
      <EditableField
        fieldKey="services_description"
        fieldType="textarea"
        label="Naše služby"
        isEditMode={isEditMode}
        onClick={openEditor}
      >
        <p className="text-sm md:text-base text-foreground/80 leading-relaxed whitespace-pre-line">
          {services || 'Popis vašich služieb...'}
        </p>
      </EditableField>
    </div>
  );
}

// Helper to get thumbnail path from full image path (same as TaxiGallery)
function getThumbnail(imagePath: string): string {
  if (!imagePath) return imagePath;
  const ext = imagePath.lastIndexOf('.');
  if (ext === -1) return imagePath;
  return imagePath.slice(0, ext) + '-thumb' + imagePath.slice(ext);
}

// Gallery Section Component - with thumbnails and lightbox like real page
function GallerySection({
  gallery,
  isEditMode,
  onEdit,
  serviceName,
}: {
  gallery: string[];
  isEditMode: boolean;
  onEdit: () => void;
  serviceName: string;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    if (isEditMode) {
      onEdit();
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

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % gallery.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  };

  return (
    <>
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
          {gallery.map((img, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className={`relative w-20 h-20 md:w-28 md:h-28 rounded-lg md:rounded-xl overflow-hidden group transition-transform hover:scale-105 shadow-md cursor-pointer`}
            >
              <img
                src={getThumbnail(img)}
                alt={`${serviceName} - foto ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = img; }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              {isEditMode && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 rounded-full p-1.5">
                    <Images className="w-4 h-4 text-gray-700" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
        {gallery.length === 0 && (
          <div
            className={`border-2 border-dashed border-gray-300 rounded-xl p-8 text-center ${
              isEditMode ? 'cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors' : ''
            }`}
            onClick={() => isEditMode && onEdit()}
          >
            <Images className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {isEditMode ? 'Kliknite pre pridanie obrázkov' : 'Žiadne obrázky v galérii'}
            </p>
          </div>
        )}
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
          {gallery.length > 1 && (
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
              src={gallery[currentIndex]}
              alt={`${serviceName} - foto ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} / {gallery.length}
            </div>
          </div>

          {/* Navigation - Next */}
          {gallery.length > 1 && (
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

// Main page component
export default function InlineEditorDemoPage() {
  const [isOwner, setIsOwner] = useState(true);

  return (
    <>
      {/* Toggle for testing */}
      <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isOwner}
            onChange={(e) => setIsOwner(e.target.checked)}
            className="rounded"
          />
          <span>Simulovať vlastníka</span>
        </label>
      </div>

      <InlineEditorProvider initialData={MOCK_PARTNER_DATA} isOwner={isOwner}>
        <PartnerPageContent />
      </InlineEditorProvider>
    </>
  );
}
