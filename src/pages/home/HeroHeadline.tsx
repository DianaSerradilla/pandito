import { Heading } from '../../components/ui/Heading'

// Headline split into letters so each one can lift slightly near the cursor (useHeroMotion).
// Letters are inline-block so they can be translated. Screen readers get the plain text; the
// letters are decorative (aria-hidden).
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
              {words.map((word, wi) => (
                <span key={wi} className="inline-block whitespace-nowrap">
                  {[...word].map((ch, ci) => (
                    <span key={ci} data-letter className="inline-block">
                      {ch}
                    </span>
                  ))}
                  {wi < words.length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
          )
        })}
      </span>
    </Heading>
  )
}
