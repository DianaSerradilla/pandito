import type { ReactNode } from 'react'
import { warnIfTooLong } from './wordLimit'

type Props = {
  /** Surface behind the text: naranja on light, amarillo on dark (manual: Color, Gráfica y Rock Salt). */
  on?: 'light' | 'dark'
  as?: 'span' | 'p'
  className?: string
  children: ReactNode
}

// Rock Salt: short comments and signatures only, up to 6 words, normal capitalization.
// Never for long text or important information (prices, steps, dates).
export function Script({ on = 'light', as: Tag = 'span', className, children }: Props) {
  warnIfTooLong(children, 'Script')
  const color = on === 'dark' ? 'text-amarillo' : 'text-naranja'
  return (
    <Tag className={['font-script text-script', color, className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  )
}
