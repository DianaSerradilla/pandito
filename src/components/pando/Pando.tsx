import type { CSSProperties } from 'react'
import { pandoShapes, pandoViewBox, type PandoShape } from './pandoShapes'

const fills: Record<PandoShape['fill'], string> = {
  tinta: 'fill-tinta',
  naranja: 'fill-naranja',
  // Pure white exists only inside Pando (manual: Paleta Pista, excepción de Pando).
  white: 'fill-white',
}

type Props = { className?: string; style?: CSSProperties }

// Pando as inline SVG so individual parts can be animated. Decorative: hidden from assistive tech.
// Hooks for motion: [data-pando-eye] is the eye (sclera), [data-pando-pupil] the pupil.
// The eye parts are the last three shapes, grouped so they can blink together later.
export function Pando({ className, style }: Props) {
  const head = pandoShapes.filter((s) => !['eyeRing', 'eyeWhite', 'pupil'].includes(s.id))
  const eye = pandoShapes.filter((s) => ['eyeRing', 'eyeWhite', 'pupil'].includes(s.id))

  return (
    <svg viewBox={pandoViewBox} aria-hidden="true" focusable="false" className={className} style={style}>
      {head.map((s) => (
        <path key={s.id} d={s.d} className={fills[s.fill]} />
      ))}
      <g data-pando-eyes>
        {eye.map((s) => (
          <path
            key={s.id}
            d={s.d}
            className={fills[s.fill]}
            {...(s.id === 'eyeWhite' ? { 'data-pando-eye': '' } : {})}
            {...(s.id === 'pupil' ? { 'data-pando-pupil': '' } : {})}
          />
        ))}
      </g>
    </svg>
  )
}
