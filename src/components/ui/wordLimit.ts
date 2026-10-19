import type { ReactNode } from 'react'

// Brand rule: Anton titles and Rock Salt comments are short (up to 6 words).
// Warns in development only, so the team notices copy that breaks the rule.
export function warnIfTooLong(children: ReactNode, component: string, max = 6) {
  if (!import.meta.env.DEV || typeof children !== 'string') return
  const words = children.trim().split(/\s+/).length
  if (words > max) {
    console.warn(`[${component}] "${children}" has ${words} words; the brand manual allows up to ${max}.`)
  }
}
