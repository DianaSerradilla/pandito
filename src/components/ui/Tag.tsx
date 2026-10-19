import type { ReactNode } from 'react'

const tones = {
  paper: 'bg-crema text-tinta',
  ink: 'bg-tinta text-crema',
  blue: 'bg-azul text-crema',
} as const

type Props = {
  tone?: keyof typeof tones
  className?: string
  children: ReactNode
}

// Small label for data such as size or collection. DM Sans at 16 px (manual minimum for labels).
export function Tag({ tone = 'paper', className, children }: Props) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-ui border-[1.5px] border-tinta px-2.5 py-0.5 font-sans text-body font-medium',
        tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
