import { asset } from '../../lib/asset'

// The team's own sticker designs that pop out along the mouse in the closing section (the 30 delivered
// in public/images/cierre). `aspect` is height over width. The order mixes colors and shapes so two
// similar pieces rarely come one after the other.
const designs = [
  { file: 'objeto-generativo1.png', aspect: 1.605 },
  { file: 'r101.png', aspect: 1.290 },
  { file: 'r131.png', aspect: 1.424 },
  { file: 'r341.png', aspect: 0.629 },
  { file: 'r171.png', aspect: 2.449 },
  { file: 'r271.png', aspect: 1.021 },
  { file: 'r401.png', aspect: 1.391 },
  { file: 'r211.png', aspect: 1.127 },
  { file: 'r561.png', aspect: 1.140 },
  { file: 'r371.png', aspect: 0.492 },
  { file: 'r301.png', aspect: 0.660 },
  { file: 'r181.png', aspect: 1.468 },
  { file: 'r391.png', aspect: 1.218 },
  { file: 'r71.png', aspect: 2.682 },
  { file: 'r241.png', aspect: 3.780 },
  { file: 'r151.png', aspect: 0.912 },
  { file: 'r311.png', aspect: 0.681 },
  { file: 'r521.png', aspect: 1.148 },
  { file: 'r51.png', aspect: 1.472 },
  { file: 'r431.png', aspect: 1.853 },
  { file: 'r551.png', aspect: 1.951 },
  { file: 'r281.png', aspect: 0.719 },
  { file: 'r531.png', aspect: 1.778 },
  { file: 'r541.png', aspect: 0.948 },
  { file: 'r581.png', aspect: 0.762 },
  { file: 'r501.png', aspect: 1.633 },
  { file: 'r491.png', aspect: 1.266 },
  { file: 'r451.png', aspect: 1.655 },
  { file: 'snoop1.png', aspect: 1.311 },
  { file: 'r261.png', aspect: 1.341 },
]

// Longest side of a piece on screen, in px: tall and wide pieces end up with a similar visual weight.
const MAX_SIDE = 190

export const closingStickers = designs.map(({ file, aspect }) => ({
  src: asset(`/images/cierre/${file}`),
  width: Math.round(Math.min(MAX_SIDE, MAX_SIDE / aspect)),
  aspect,
}))
