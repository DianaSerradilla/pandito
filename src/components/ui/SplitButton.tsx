import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'

// Button made of two blocks: a square with an arrow and the label. Rounded corners follow --radius-ui.
//  - azul (default): crema on azul, an approved pair; hover turns both blocks to ink.
//  - crema: for azul or dark backgrounds; tinta on crema, an approved pair; hover turns both to ink.
// SplitButton navigates inside the site; SplitButtonAnchor opens an external address (e.g. WhatsApp).
const tones = {
  azul: { root: 'text-crema', block: 'bg-azul' },
  crema: { root: 'text-tinta hover:text-crema', block: 'bg-crema' },
} as const

type Tone = keyof typeof tones

const rootClass = (tone: Tone, className?: string) =>
  [
    'group inline-flex items-stretch gap-[3px] font-display text-label uppercase tracking-wide',
    tones[tone].root,
    className,
  ]
    .filter(Boolean)
    .join(' ')

function Blocks({ tone, children }: { tone: Tone; children: ReactNode }) {
  const block = tones[tone].block
  return (
    <>
      <span
        aria-hidden="true"
        className={`grid w-10 place-items-center rounded-l-ui transition-colors duration-200 group-hover:bg-tinta ${block}`}
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 8h12M8.5 2.5 14 8l-5.5 5.5" />
        </svg>
      </span>
      <span
        className={`flex items-center rounded-r-ui px-4 py-3 transition-colors duration-200 group-hover:bg-tinta ${block}`}
      >
        {children}
      </span>
    </>
  )
}

export function SplitButton({
  children,
  className,
  tone = 'azul',
  ...props
}: LinkProps & { tone?: Tone }) {
  return (
    <Link className={rootClass(tone, className)} {...props}>
      <Blocks tone={tone}>{children}</Blocks>
    </Link>
  )
}

export function SplitButtonAnchor({
  children,
  className,
  tone = 'azul',
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> & {
  href: string
  tone?: Tone
  className?: string
}) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={rootClass(tone, className)}
      {...props}
    >
      <Blocks tone={tone}>{children}</Blocks>
    </a>
  )
}
