import type { ElementType, ReactNode } from 'react'

// Both sizes use the full desktop width (team decision: content should fill the screen like the
// reference). Kept as two names so a narrower reading width can be reintroduced if needed.
const sizes = {
  wide: 'max-w-[1600px]', // header, footer
  content: 'max-w-[1600px]', // page content
} as const

type Props = {
  as?: ElementType
  size?: keyof typeof sizes
  className?: string
  children: ReactNode
}

export function Container({ as: Tag = 'div', size = 'content', className, children }: Props) {
  return (
    <Tag className={['mx-auto w-full px-4 md:px-8', sizes[size], className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  )
}
