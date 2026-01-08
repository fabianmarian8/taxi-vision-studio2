import { createClient } from '@/lib/supabase/server';
import { isPartnerSkinId } from '@/lib/partner-skins';
import { NextRequest, NextResponse } from 'next/server';

// Whitelist povolených polí
const ALLOWED_FIELDS = [
  'company_name',
  'description',
  'show_description',
  'phone',
  'email',
  'website',
  'hero_title',
  'hero_subtitle',
  'hero_image_url',
  'hero_image_zoom',
  'hero_image_pos_x',
  'hero_image_pos_y',
  'services',
  'show_services',
  'gallery',
  'social_facebook',
  'social_instagram',
  'whatsapp',
  'booking_url',
  'pricelist_url',
  'transport_rules_url',
  'contact_url',
  'services_description',
  'template_variant'
];

// URL polia ktoré vyžadujú validáciu
const URL_FIELDS = ['website', 'booking_url', 'pricelist_url', 'transport_rules_url', 'contact_url', 'hero_image_url'];

// Validácia URL - musí byť prázdny string, alebo začínať http:// alebo https://
function isValidUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (value === '') return true; // prázdny string je OK
  return /^https?:\/\//i.test(value);
}

// Validácia telefónneho čísla pre WhatsApp (len čísla, + a medzery)
function isValidWhatsApp(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (value === '') return true;
  return /^[\d\s+]+$/.test(value);
}

// Validácia string array (pre services, gallery)
function isValidStringArray(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.every(item => typeof item === 'string');
}

// Polia ktoré musia byť string[]
const ARRAY_FIELDS = ['services', 'gallery'];

// POST /api/partner/inline-edit/save
// Uloženie zmeny jedného alebo viacerých polí
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Overenie autentifikácie
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const { partner_id, draft_id, changes } = body;

    if (!partner_id) {
      return NextResponse.json({
        success: false,
        error: 'partner_id is required'
      }, { status: 400 });
    }

    if (!changes || Object.keys(changes).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No changes provided'
      }, { status: 400 });
    }

    // Overenie vlastníctva
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, slug, city_slug')
      .eq('id', partner_id)
      .eq('user_id', user.id)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({
        success: false,
        error: 'Not owner or partner not found'
      }, { status: 403 });
    }

    // Sanitizácia - len povolené polia + type coercion + validácia
    const sanitizedChanges: Record<string, unknown> = {};
    const validationErrors: string[] = [];

    for (const [key, value] of Object.entries(changes as Record<string, unknown>)) {
      if (ALLOWED_FIELDS.includes(key)) {
        // Konverzia na správne typy pre databázu
        if (key === 'hero_image_pos_x' || key === 'hero_image_pos_y' || key === 'hero_image_zoom') {
          // Tieto polia sú integer v databáze
          sanitizedChanges[key] = Math.round(Number(value) || 0);
        } else if (URL_FIELDS.includes(key)) {
          // Validácia URL polí
          if (!isValidUrl(value)) {
            validationErrors.push(`${key} must be a valid URL starting with http:// or https://`);
          } else {
            sanitizedChanges[key] = value;
          }
        } else if (key === 'whatsapp') {
          // Validácia WhatsApp čísla
          if (!isValidWhatsApp(value)) {
            validationErrors.push('whatsapp must contain only numbers, + and spaces');
          } else {
            sanitizedChanges[key] = value;
          }
        } else if (key === 'template_variant') {
          if (typeof value !== 'string' || !isPartnerSkinId(value)) {
            validationErrors.push('template_variant must be a valid template option');
          } else {
            sanitizedChanges[key] = value;
          }
        } else if (ARRAY_FIELDS.includes(key)) {
          // Validácia string[] polí (services, gallery)
          if (!isValidStringArray(value)) {
            validationErrors.push(`${key} must be an array of strings`);
          } else {
            sanitizedChanges[key] = value;
          }
        } else {
          sanitizedChanges[key] = value;
        }
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: validationErrors.join(', ')
      }, { status: 400 });
    }

    if (Object.keys(sanitizedChanges).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid fields to update'
      }, { status: 400 });
    }

    let result;

    if (draft_id) {
      // Update existujúci draft - NEPREPISUJ status ak je approved!
      // Inline editor edituje approved draft priamo, nechceme ho degradovať na draft
      const { data, error } = await supabase
        .from('partner_drafts')
        .update({
          ...sanitizedChanges,
          // status sa NEMENÍ - ponecháme pôvodný (approved alebo draft)
          updated_at: new Date().toISOString()
        })
        .eq('id', draft_id)
        .eq('partner_id', partner_id)
        .select('id, updated_at')
        .single();

      if (error) {
        console.error('[inline-edit/save] Update error:', error);
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 });
      }

      result = data;
    } else {
      // Vytvor nový draft
      const { data, error } = await supabase
        .from('partner_drafts')
        .insert({
          partner_id,
          ...sanitizedChanges,
          status: 'draft'
        })
        .select('id, updated_at')
        .single();

      if (error) {
        console.error('[inline-edit/save] Insert error:', error);
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 });
      }

      result = data;
    }

    console.log('[inline-edit/save] Saved:', {
      partner_id,
      draft_id: result.id,
      fields: Object.keys(sanitizedChanges)
    });

    return NextResponse.json({
      success: true,
      draft_id: result.id,
      updated_at: result.updated_at
    });

  } catch (error) {
    console.error('[inline-edit/save] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
