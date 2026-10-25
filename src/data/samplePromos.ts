// Pack promotions as DATA (REQ-WEB-PROMO-*). A pack is a number of stickers of a size group, any
// design, for one fixed price: large and medium stickers mix in packs of 3 and 5; small ones come in
// packs of 4 and 6. Prices given by the team: large 1 = 1500, 3 = 3500, 5 = 5000; small 1 = 1000,
// 4 = 3500, 6 = 5500; medium single = 1250 (between the two; its own packs are pending). These
// stand in for the promotions table (Supabase), which the internal panel will own.
export type Pack = { quantity: number; price: number }
export type PromoGroup = { key: string; label: string; sizeKeys: string[]; packs: Pack[] }

export const promoGroups: PromoGroup[] = [
  {
    key: 'grandes',
    label: 'grandes o medianos',
    sizeKeys: ['mediano', 'grande'],
    packs: [
      { quantity: 3, price: 3500 },
      { quantity: 5, price: 5000 },
    ],
  },
  {
    key: 'chicos',
    label: 'chicos',
    sizeKeys: ['chico'],
    packs: [
      { quantity: 4, price: 3500 },
      { quantity: 6, price: 5500 },
    ],
  },
]
