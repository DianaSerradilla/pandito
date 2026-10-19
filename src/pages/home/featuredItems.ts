// PLACEHOLDER data for the featured block (REQ-WEB-HOME-008). The real selection comes from
// Supabase once the data model is approved (REQ-WEB-BASE-005): replace this array with that query.
// Names are neutral stand-ins, not product claims. Add `image` when real photos exist.
export type FeaturedItem = {
  slug: string
  name: string
  /** Frame color. Any palette color that reads on the azul background. */
  frame: 'crema' | 'amarillo' | 'naranja'
  /** Placeholder tone, used while there is no image. */
  tone: 'tinta' | 'naranja'
  image?: string
}

export const featuredItems: FeaturedItem[] = [
  { slug: 'ejemplo-uno', name: 'Diseño uno', frame: 'crema', tone: 'tinta' },
  { slug: 'ejemplo-dos', name: 'Diseño dos', frame: 'amarillo', tone: 'naranja' },
  { slug: 'ejemplo-tres', name: 'Diseño tres', frame: 'naranja', tone: 'tinta' },
  { slug: 'ejemplo-cuatro', name: 'Diseño cuatro', frame: 'crema', tone: 'naranja' },
]
