import type { ReactNode } from 'react'
import { warnIfTooLong } from './wordLimit'

const sizes = {
  hero: 'text-hero',
  display: 'text-display',
  title: 'text-title',
  subtitle: 'text-subtitle',
  headline: 'text-headline',
} as const

const families = {
  // Anton: manual default for titles. One weight only.
  display: 'font-display',
  // DM Sans: a family with weights, so one phrase can mix regular and bold (team decision, used in
  // the Manifiesto headline). Set the weight on the child spans.
  sans: 'font-sans tracking-tight',
} as const

type Props = {
  id?: string
  /** Semantic level. One h1 per page; keep h2/h3 coherent. */
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  /** Visual size, independent from the semantic level. */
  size?: keyof typeof sizes
  family?: keyof typeof families
  className?: string
  children: ReactNode
}

// Uppercase, up to 6 words (brand manual: Tipografía).
export function Heading({
  id,
  as: Tag = 'h2',
  size = 'title',
  family = 'display',
  className,
  children,
}: Props) {
  warnIfTooLong(children, 'Heading')
  return (
    <Tag
      id={id}
      className={['uppercase', families[family], sizes[size], className].filter(Boolean).join(' ')}
    >
      {children}
    </Tag>
  )
}
