import type { ReactNode } from 'react'
import { Heading } from './Heading'

type Props = {
  kind: 'loading' | 'empty' | 'error'
  /** Short title (up to 6 words). The copy comes from the page: clear, honest, in Pando's voice. */
  title: string
  children?: ReactNode
  /** Next step for the person, e.g. a ButtonLink. Empty and error states should offer one. */
  action?: ReactNode
}

// Shared block for loading, empty and error states. Never show technical details here.
export function StatusMessage({ kind, title, children, action }: Props) {
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      aria-busy={kind === 'loading' || undefined}
      className="rounded-ui border-[1.5px] border-tinta bg-crema p-6 shadow-sticker"
    >
      <div className="flex items-center gap-3">
        {kind === 'loading' && (
          <span aria-hidden="true" className="size-3 animate-pulse rounded-full bg-naranja" />
        )}
        <Heading as="h2" size="subtitle">
          {title}
        </Heading>
      </div>
      {children && <p className="mt-3 max-w-prose">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
