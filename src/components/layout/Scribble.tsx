// Hand-drawn underline that "draws itself" on hover, focus and for the active link.
// The parent must be `relative` with the `group` class. Yellow is the approved pair on ink (amarillo sobre tinta).
export function Scribble({ active }: { active: boolean }) {
  // Opacity hides the round line cap, which would otherwise leave a dot when fully "undrawn".
  const state = active
    ? 'opacity-100 [stroke-dashoffset:0]'
    : 'opacity-0 [stroke-dashoffset:1] group-hover:opacity-100 group-hover:[stroke-dashoffset:0] group-focus-visible:opacity-100 group-focus-visible:[stroke-dashoffset:0]'

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 12"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -bottom-1 left-0 h-2 w-full overflow-visible"
    >
      <path
        d="M2 7 C 12 2, 20 11, 32 6 S 52 2, 62 8 S 84 3, 98 6"
        pathLength="1"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className={`stroke-amarillo transition-[stroke-dashoffset,opacity] duration-300 ease-out [stroke-dasharray:1] ${state}`}
      />
    </svg>
  )
}
