import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'partnerTaxiService',
  title: 'Partner Taxislužba',
  type: 'document',
  fields: [
    // === ZÁKLADNÉ INFO ===
    defineField({
      name: 'name',
      title: 'Názov taxislužby',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL identifikátor)',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'Mesto pôsobenia',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'citySlug',
      title: 'Slug mesta',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'secondaryCity',
      title: 'Sekundárne mesto (voliteľné)',
      type: 'string',
      description: 'Ak taxislužba pôsobí aj v inom meste',
    }),

    // === KONTAKT ===
    defineField({
      name: 'phone',
      title: 'Telefón',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'phone2',
      title: 'Telefón 2 (voliteľné)',
      type: 'string',
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp číslo',
      type: 'string',
    }),
    defineField({
      name: 'website',
      title: 'Webová stránka',
      type: 'url',
    }),
    defineField({
      name: 'address',
      title: 'Adresa',
      type: 'string',
    }),

    // === VIZUÁL ===
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero obrázok (pozadie)',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hlavný obrázok zobrazený na stránke taxislužby',
    }),
    defineField({
      name: 'gallery',
      title: 'Galéria fotografií',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternatívny text',
            },
          ],
        },
      ],
      options: {
        layout: 'grid',
      },
    }),

    // === POPIS ===
    defineField({
      name: 'description',
      title: 'Krátky popis',
      type: 'text',
      rows: 3,
      description: 'Zobrazí sa v zozname taxislužieb',
    }),
    defineField({
      name: 'fullDescription',
      title: 'Plný popis',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Detailný popis s formátovaním (na stránke taxislužby)',
    }),
    defineField({
      name: 'customCtaTitle',
      title: 'Vlastný CTA text',
      type: 'string',
      description: 'Napr. "do okolitých obcí, alebo do oblasti Nízkych Tatier"',
    }),

    // === SLUŽBY ===
    defineField({
      name: 'services',
      title: 'Ponúkané služby',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'paymentMethods',
      title: 'Spôsoby platby',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'workingHours',
      title: 'Otváracie hodiny',
      type: 'string',
      description: 'Napr. "Nonstop 24/7" alebo "Po-Pi: 6:00-22:00"',
    }),

    // === ODKAZY ===
    defineField({
      name: 'bookingUrl',
      title: 'URL na objednávku',
      type: 'url',
    }),
    defineField({
      name: 'pricelistUrl',
      title: 'URL na cenník',
      type: 'url',
    }),
    defineField({
      name: 'transportRulesUrl',
      title: 'URL na prepravný poriadok',
      type: 'url',
    }),
    defineField({
      name: 'contactUrl',
      title: 'URL na kontakt',
      type: 'url',
    }),

    // === WORKFLOW ===
    defineField({
      name: 'status',
      title: 'Stav schválenia',
      type: 'string',
      options: {
        list: [
          { title: '📝 Rozpracované (draft)', value: 'draft' },
          { title: '⏳ Čaká na schválenie', value: 'pending' },
          { title: '✅ Schválené', value: 'approved' },
          { title: '❌ Zamietnuté', value: 'rejected' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'reviewNote',
      title: 'Poznámka k schváleniu',
      type: 'text',
      rows: 2,
      description: 'Dôvod zamietnutia alebo poznámky pre partnera',
    }),
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'city',
      media: 'logo',
      status: 'status',
    },
    prepare({ title, subtitle, media, status }) {
      const statusEmoji = {
        draft: '📝',
        pending: '⏳',
        approved: '✅',
        rejected: '❌',
      }[status as string] || '📝'

      return {
        title: `${statusEmoji} ${title}`,
        subtitle: subtitle,
        media: media,
      }
    },
  },
})
