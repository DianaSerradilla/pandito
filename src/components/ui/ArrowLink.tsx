import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { HandMark } from './HandMark'

type Props = LinkProps & {
  /** Hand-drawn underline. Use it on one main action per screen, not on every link. */
  mark?: boolean
}

const rootClass = (className?: string) =>
  [
    'group inline-flex items-center gap-2.5 font-sans text-base font-semibold md:text-lg',
    className,
  ]
    .filter(Boolean)
    .join(' ')

function Content({ children, mark }: { children: ReactNode; mark: boolean }) {
  return (
    <>
      <span className={mark ? 'relative' : 'underline-offset-4 group-hover:underline'}>
        {children}
        {mark && <HandMark />}
      </span>
      <span
        aria-hidden="true"
        className="grid size-6 place-items-center rounded-ui bg-naranja text-crema transition-transform duration-200 ease-spring group-hover:translate-x-0.5 md:size-7"
      >
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 8h12M8.5 2.5 14 8l-5.5 5.5" />
        </svg>
      </span>
    </>
  )
}

// Small text link with a square arrow, for the main call to action. With `mark`, an orange
// marker underline. The naranja square with a crema arrow reinforces the hero's primary color.
export function ArrowLink({ children, className, mark = false, ...props }: Props) {
  return (
    <Link className={rootClass(className)} {...props}>
      <Content mark={mark}>{children}</Content>
    </Link>
  )
}

// The same link for an address outside the site (e.g. WhatsApp): opens in a new tab.
export function ArrowAnchor({
  children,
  className,
  mark = false,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> & {
  href: string
  mark?: boolean
  className?: string
}) {
  return (
    <a target="_blank" rel="noopener noreferrer" className={rootClass(className)} {...props}>
      <Content mark={mark}>{children}</Content>
    </a>
  )
}
