import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'
import { stickerBase, stickerDisabled, stickerSize, stickerTone, tilt } from './sticker'

const variants = {
  primary: stickerTone.ink,
  secondary: stickerTone.paper,
  accent: stickerTone.blue,
} as const

type Style = {
  variant?: keyof typeof variants
  size?: 'md' | 'lg'
  /** Optional resting tilt, e.g. "-1deg". Straightens on hover. */
  tiltDeg?: string
}

const classes = ({ variant = 'primary', size = 'md' }: Style, extra?: string) =>
  [stickerBase, stickerSize[size], variants[variant], stickerDisabled, extra].filter(Boolean).join(' ')

export function Button({
  variant,
  size,
  tiltDeg,
  className,
  type = 'button',
  ...props
}: Style & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      style={tiltDeg ? tilt(tiltDeg) : undefined}
      className={classes({ variant, size }, className)}
      {...props}
    />
  )
}

/** Same look as Button, for navigation (renders a router Link). */
export function ButtonLink({
  variant,
  size,
  tiltDeg,
  className,
  ...props
}: Style & LinkProps) {
  return (
    <Link
      style={tiltDeg ? tilt(tiltDeg) : undefined}
      className={classes({ variant, size }, className)}
      {...props}
    />
  )
}
