import type { CSSProperties } from 'react'

// Shared "sticker" look for interactive blocks (nav links, buttons): flat color, ink outline,
// slight tilt, offset shadow. On hover it straightens and jumps. Built only from tokens.
export const stickerBase = [
  'group inline-flex items-center justify-center gap-2 rounded-ui border-[1.5px] border-tinta font-display uppercase tracking-wide',
  '[rotate:var(--tilt,0deg)]',
  'transition-[rotate,translate,box-shadow,background-color,color] duration-200 ease-spring',
  'hover:-translate-y-px hover:[rotate:0deg] hover:shadow-sticker-lift',
].join(' ')

export const stickerSize = {
  md: 'min-h-11 px-3.5 py-1.5 text-label',
  lg: 'px-6 py-3 text-xl',
  menu: 'px-5 py-2 text-2xl',
} as const

// Contrast notes: crema/tinta and crema/azul are manual-approved pairs. tinta on naranja is 4.53:1
// (hover). crema on naranja (current) is 3.51:1: the manual limits it to large text; the team chose
// it for the active nav item, pending approval.
export const stickerTone = {
  paper: 'bg-crema text-tinta shadow-sticker hover:bg-naranja',
  ink: 'bg-tinta text-crema shadow-sticker hover:bg-naranja hover:text-tinta',
  blue: 'bg-azul text-crema shadow-sticker-ink hover:bg-naranja hover:text-tinta',
  current: 'bg-naranja text-crema shadow-sticker-ink',
} as const

export const stickerDisabled =
  'disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none'

export const tilt = (deg: string) => ({ '--tilt': deg }) as CSSProperties
