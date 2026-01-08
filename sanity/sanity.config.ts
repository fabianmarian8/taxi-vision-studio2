import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8h97xo6o'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
  name: 'taxi-vision-studio',
  title: 'Taxi Vision Studio - Partner Admin',

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Obsah')
          .items([
            // Partner taxislužby s rozdelením podľa stavu
            S.listItem()
              .title('📋 Všetci partneri')
              .child(
                S.documentTypeList('partnerTaxiService')
                  .title('Všetci partneri')
              ),
            S.divider(),
            S.listItem()
              .title('⏳ Čakajú na schválenie')
              .child(
                S.documentList()
                  .title('Čakajú na schválenie')
                  .filter('_type == "partnerTaxiService" && status == "pending"')
              ),
            S.listItem()
              .title('✅ Schválené')
              .child(
                S.documentList()
                  .title('Schválené')
                  .filter('_type == "partnerTaxiService" && status == "approved"')
              ),
            S.listItem()
              .title('📝 Rozpracované')
              .child(
                S.documentList()
                  .title('Rozpracované')
                  .filter('_type == "partnerTaxiService" && status == "draft"')
              ),
            S.listItem()
              .title('❌ Zamietnuté')
              .child(
                S.documentList()
                  .title('Zamietnuté')
                  .filter('_type == "partnerTaxiService" && status == "rejected"')
              ),
          ]),
    }),
    visionTool(), // GROQ playground pre testovanie queries
  ],

  schema: {
    types: schemaTypes,
  },
})
