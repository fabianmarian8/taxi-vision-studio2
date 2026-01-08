'use client';

import { useState } from 'react';
import { Phone, Globe, MessageCircle, Star, BadgeCheck, CheckCircle2, Monitor, Smartphone, ExternalLink, Facebook, Instagram, Mail } from 'lucide-react';
import { getPartnerSkinClass } from '@/lib/partner-skins';

interface TaxiPreviewProps {
  formData: {
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
    services: string[];
    show_services: boolean;
    gallery: string[];
    social_facebook: string;
    social_instagram: string;
    template_variant: string;
  };
  partnerSlug: string;
  cityName: string;
}

// Helper to get thumbnail path
function getThumbnail(imagePath: string): string {
  if (!imagePath) return imagePath;
  const ext = imagePath.lastIndexOf('.');
  if (ext === -1) return imagePath;
  return imagePath.slice(0, ext) + '-thumb' + imagePath.slice(ext);
}

export function TaxiPreview({ formData, partnerSlug, cityName }: TaxiPreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');

  const previewUrl = `/taxi/zvolen/${partnerSlug}`;
  const skinClass = getPartnerSkinClass(formData.template_variant);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header with controls */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Náhľad stránky
        </h3>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex bg-gray-200 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'mobile'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Mobile view"
            >
              <Smartphone className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'desktop'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Desktop view"
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>

          {/* Open in new tab */}
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Otvoriť
          </a>
        </div>
      </div>

      {/* Preview container with scrollable content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div
          className={`mx-auto bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
            viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
          }`}
          style={{
            minHeight: viewMode === 'mobile' ? '667px' : 'auto',
          }}
        >
          {/* Partner page background */}
          <div className={`partner-page-bg partner-skin ${skinClass} min-h-full`}>
            {/* Hero Section */}
            <div
              className={`relative overflow-hidden ${
                viewMode === 'mobile' ? 'h-[160px] rounded-lg m-3' : 'h-[200px] rounded-xl m-4'
              }`}
            >
              {formData.hero_image_url ? (
                <>
                  <div
                    className="absolute inset-0 bg-no-repeat"
                    style={{
                      backgroundImage: `url(${formData.hero_image_url})`,
                      backgroundPosition: `${formData.hero_image_pos_x}% ${formData.hero_image_pos_y}%`,
                      backgroundSize: `${formData.hero_image_zoom}%`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 partner-hero-fallback" />
              )}

              {/* Content overlay */}
              <div className="absolute inset-0 z-10 flex flex-col justify-end p-3 md:p-6">
                {/* Badges */}
                <div className="flex gap-1 mb-2">
                  <div className="bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <BadgeCheck className="h-2 w-2" />
                    OVERENÉ
                  </div>
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Star className="h-2 w-2" />
                    PARTNER
                  </div>
                </div>

                <h1 className={`font-black text-white ${viewMode === 'mobile' ? 'text-lg' : 'text-2xl'}`}>
                  {formData.company_name || 'Názov taxislužby'}
                </h1>
                <p className={`text-white/90 ${viewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                  {formData.hero_subtitle || `Profesionálna taxislužba v meste ${cityName}`}
                </p>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className={`space-y-2 ${viewMode === 'mobile' ? 'px-3' : 'px-4'}`}>
              {/* Primary phone */}
              {formData.phone && (
                <div className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-black text-sm px-3 py-3 rounded-xl">
                  <Phone className="h-4 w-4" />
                  {formData.phone}
                </div>
              )}

              {/* Secondary buttons */}
              <div className="grid grid-cols-2 gap-2">
                {formData.website && (
                  <div className="flex items-center justify-center gap-1.5 bg-white/20 backdrop-blur-sm text-gray-700 font-bold text-xs px-3 py-2 rounded-lg border border-gray-200">
                    <Globe className="h-3.5 w-3.5" />
                    <span>Web</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-1.5 bg-green-500 text-white font-bold text-xs px-3 py-2 rounded-lg">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </div>
                {formData.email && (
                  <div className="flex items-center justify-center gap-1.5 bg-gray-100 text-gray-800 font-bold text-xs px-3 py-2 rounded-lg">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email</span>
                  </div>
                )}
                {formData.social_facebook && (
                  <div className="flex items-center justify-center gap-1.5 bg-blue-600 text-white font-bold text-xs px-3 py-2 rounded-lg">
                    <Facebook className="h-3.5 w-3.5" />
                    <span>Facebook</span>
                  </div>
                )}
                {formData.social_instagram && (
                  <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold text-xs px-3 py-2 rounded-lg">
                    <Instagram className="h-3.5 w-3.5" />
                    <span>Instagram</span>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery */}
            {formData.gallery.length > 0 && (
              <div className={`mt-4 ${viewMode === 'mobile' ? 'px-3' : 'px-4'}`}>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {formData.gallery.slice(0, viewMode === 'mobile' ? 4 : 6).map((url, index) => (
                    <div
                      key={index}
                      className={`rounded-lg overflow-hidden bg-gray-100 ${
                        viewMode === 'mobile' ? 'w-16 h-16' : 'w-20 h-20'
                      }`}
                    >
                      <img
                        src={getThumbnail(url)}
                        alt={`Galéria ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = url;
                        }}
                      />
                    </div>
                  ))}
                  {formData.gallery.length > (viewMode === 'mobile' ? 4 : 6) && (
                    <div
                      className={`rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium ${
                        viewMode === 'mobile' ? 'w-16 h-16' : 'w-20 h-20'
                      }`}
                    >
                      +{formData.gallery.length - (viewMode === 'mobile' ? 4 : 6)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* About / Description */}
            {formData.show_description && formData.description && (
              <div className={`mt-4 ${viewMode === 'mobile' ? 'mx-3' : 'mx-4'} partner-card rounded-xl p-3`}>
                <h2 className="text-sm font-bold text-gray-900 mb-2">O nás</h2>
                <p className={`text-gray-600 leading-relaxed ${viewMode === 'mobile' ? 'text-[10px]' : 'text-xs'}`}>
                  {formData.description.length > 150
                    ? formData.description.substring(0, 150) + '...'
                    : formData.description}
                </p>
              </div>
            )}

            {/* Services */}
            {formData.show_services && formData.services.length > 0 && (
              <div className={`mt-4 ${viewMode === 'mobile' ? 'mx-3' : 'mx-4'} partner-card rounded-xl p-3`}>
                <h2 className="text-sm font-bold text-gray-900 mb-2">Ponúkané služby</h2>
                <div className="flex flex-wrap gap-1.5">
                  {formData.services.map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 partner-tag rounded-full text-[10px] font-medium"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features section preview */}
            <div className={`mt-4 ${viewMode === 'mobile' ? 'px-3 pb-4' : 'px-4 pb-6'}`}>
              <h2 className={`font-black text-gray-900 mb-3 text-center ${viewMode === 'mobile' ? 'text-sm' : 'text-base'}`}>
                Prečo si vybrať {formData.company_name || 'nás'}?
              </h2>
              <div className={`grid gap-2 ${viewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                {[
                  { icon: BadgeCheck, title: 'Overená taxislužba', desc: 'Partner program zaručuje kvalitu' },
                  { icon: Phone, title: 'Rýchly kontakt', desc: 'Jednoduché objednanie' },
                  { icon: Star, title: 'Profesionálny prístup', desc: 'Skúsení vodiči' },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 partner-card rounded-lg ${
                      viewMode === 'mobile' ? '' : 'flex-col text-center p-3'
                    }`}
                  >
                    <div className={`rounded-full partner-accent-bg flex items-center justify-center flex-shrink-0 ${
                      viewMode === 'mobile' ? 'w-8 h-8' : 'w-10 h-10'
                    }`}>
                      <feature.icon className={`text-white ${viewMode === 'mobile' ? 'h-4 w-4' : 'h-5 w-5'}`} />
                    </div>
                    <div className={viewMode === 'mobile' ? '' : 'mt-2'}>
                      <h3 className={`font-bold text-gray-900 ${viewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                        {feature.title}
                      </h3>
                      <p className={`text-gray-500 ${viewMode === 'mobile' ? 'text-[10px]' : 'text-xs'}`}>
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className={`partner-cta ${viewMode === 'mobile' ? 'p-4' : 'p-6'}`}>
              <div className="text-center">
                <h2 className={`font-black ${viewMode === 'mobile' ? 'text-sm mb-1' : 'text-lg mb-2'}`}>
                  Potrebujete taxi?
                </h2>
                <p className={`partner-cta-muted ${viewMode === 'mobile' ? 'text-xs mb-2' : 'text-sm mb-3'}`}>
                  Zavolajte nám a odvezieme vás kam potrebujete.
                </p>
                {formData.phone && (
                  <div className={`inline-flex items-center gap-2 partner-accent-btn font-black rounded-xl ${
                    viewMode === 'mobile' ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-lg'
                  }`}>
                    <Phone className={viewMode === 'mobile' ? 'h-4 w-4' : 'h-5 w-5'} />
                    {formData.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
