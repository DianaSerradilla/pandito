import type { ReactNode, Ref } from 'react'

type Props = {
  /** id of the heading inside, so the section is announced by its title. */
  labelledBy: string
  /** Fills at least the whole screen and centers its content, so the section above is not visible. */
  screen?: boolean
  /** Extra vertical space, for sections that should breathe more. */
  airy?: boolean
  className?: string
  ref?: Ref<HTMLElement>
  children: ReactNode
}

// Sections breathe: generous vertical space and no divider lines (team decision, after the
// reference). Use `screen` for sections that should take the full viewport while you read them.
export function Section({ labelledBy, screen = false, airy = false, className, ref, children }: Props) {
  return (
    <section
      ref={ref}
      aria-labelledby={labelledBy}
      className={[
        airy ? 'py-32 md:py-48' : 'py-20 md:py-32',
        screen ? 'flex min-h-svh flex-col justify-center' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </section>
  )
}
