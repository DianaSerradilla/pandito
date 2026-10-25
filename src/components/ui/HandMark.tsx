// Hand-drawn marker underline (manual: Gráfica de apoyo, "marcas de mano").
// Yellow or orange only: naranja on cream/ink, amarillo on ink/blue. At most two graphic
// resources per piece; the Home hero uses one. At rest it is fully drawn; when the link it belongs
// to (the `group` ancestor) is hovered or focused it is drawn again from left to right, softly
// (see `hand-mark-draw` in index.css; reference: extrafazant.nl). The parent must be `relative`.
const colors = { naranja: 'stroke-naranja', amarillo: 'stroke-amarillo' } as const

export function HandMark({ tone = 'naranja' }: { tone?: keyof typeof colors }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 12"
      preserveAspectRatio="none"
      className="hand-mark pointer-events-none absolute -bottom-1.5 left-0 h-2.5 w-full overflow-visible"
    >
      <path
        d="M2 7 C 12 2, 20 11, 32 6 S 52 2, 62 8 S 84 3, 98 6"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className={colors[tone]}
      />
    </svg>
  )
}
