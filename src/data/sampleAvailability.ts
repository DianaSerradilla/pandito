// How a variant can be fulfilled (REQ-WEB-PRODUCT-004). It is said to the visitor in words, never as
// a number: the site does not show stock. SAMPLE RULES until the internal panel decides it per
// variant: holographic pieces are made to order, and one combination is unavailable so that state
// can be designed and tested. The real conditions need the team's approval.
export type Availability = 'confirm' | 'on-request' | 'unavailable'

export function availabilityOf(slug: string, materialKey: string, sizeKey: string): Availability {
  if (slug === 'cat-03' && sizeKey === 'grande') return 'unavailable'
  if (materialKey === 'holografico') return 'on-request'
  return 'confirm'
}
