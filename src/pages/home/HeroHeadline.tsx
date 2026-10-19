import { Heading } from '../../components/ui/Heading'

// Headline split into words so the hand-drawn Pandito signature can remain intact.
// Screen readers get the plain text; the visual treatment is decorative.
export function HeroHeadline({ id, lines }: { id: string; lines: string[] }) {
  const label = lines.join(' ')
  return (
    <Heading id={id} as="h1" size="hero" className="mt-3">
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">
        {lines.map((line) => {
          const words = line.split(' ')
          return (
            <span key={line} className="block">
              {words.map((word, wi) =>
                word === 'Pandito.' ? (
                  <span
                    key={wi}
                    className="inline-block whitespace-nowrap align-baseline font-script text-[0.66em] font-normal leading-none tracking-[-0.04em] text-naranja"
                  >
                    {word}
                  </span>
                ) : (
                  <span key={wi} className="inline-block whitespace-nowrap">
                    {[...word].map((ch, ci) => (
                      <span key={ci} data-letter className="inline-block">
                        {ch}
                      </span>
                    ))}
                    {wi < words.length - 1 ? ' ' : ''}
                  </span>
                ),
              )}
            </span>
          )
        })}
      </span>
    </Heading>
  )
}