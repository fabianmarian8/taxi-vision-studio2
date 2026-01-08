export const PARTNER_SKINS = [
  {
    id: 'classic',
    name: 'Kraft Classic',
    description: 'Papierovy podklad a fialovy akcent.',
  },
  {
    id: 'metro',
    name: 'Metro Blue',
    description: 'Cisty mestsky vzhlad s modrym akcentom.',
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Teple oranzove tony, energicky dojem.',
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Jemna zelen a prirodzeny kontrast.',
  },
] as const;

export type PartnerSkinId = (typeof PARTNER_SKINS)[number]['id'];

export const DEFAULT_PARTNER_SKIN: PartnerSkinId = 'classic';

export function isPartnerSkinId(value: string): value is PartnerSkinId {
  return PARTNER_SKINS.some((skin) => skin.id === value);
}

export function normalizePartnerSkin(value?: string | null): PartnerSkinId {
  if (value && isPartnerSkinId(value)) {
    return value;
  }
  return DEFAULT_PARTNER_SKIN;
}

export function getPartnerSkinClass(value?: string | null): string {
  return `partner-skin--${normalizePartnerSkin(value)}`;
}
