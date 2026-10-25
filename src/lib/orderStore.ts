import { useSyncExternalStore } from 'react'

// The order ("Mi pedido") kept in this browser: what was added and how many of each, by product
// slug. It survives a reload (localStorage) and stays in step between tabs. This is only the
// minimum the HOY page needs to behave like a shop; the full flow (summary, delivery slot, the
// WhatsApp message) belongs to REQ-WEB-CART-*, and the real prices will come from the server.
export type OrderItems = Readonly<Record<string, number>>

const KEY = 'pandito:pedido'
const MAX_PER_ITEM = 99
const EMPTY: OrderItems = {}

function load(): OrderItems {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    if (!parsed || typeof parsed !== 'object') return EMPTY
    const clean: Record<string, number> = {}
    for (const [slug, qty] of Object.entries(parsed)) {
      if (typeof qty === 'number' && Number.isInteger(qty) && qty > 0) clean[slug] = Math.min(qty, MAX_PER_ITEM)
    }
    return clean
  } catch {
    return EMPTY
  }
}

let items: OrderItems = typeof window === 'undefined' ? EMPTY : load()
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

function save(next: OrderItems) {
  items = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Private mode or a full disk: the order still works for this visit.
  }
  notify()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== KEY) return
    items = load()
    notify()
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Sets how many of a product are in the order; 0 removes it. */
export function setQuantity(slug: string, quantity: number) {
  const qty = Math.max(0, Math.min(MAX_PER_ITEM, Math.floor(quantity)))
  const next = { ...items }
  if (qty === 0) delete next[slug]
  else next[slug] = qty
  save(next)
}

/** Empties the order. */
export function clearOrder() {
  save(EMPTY)
}

export function useOrderItems(): OrderItems {
  return useSyncExternalStore(subscribe, () => items, () => EMPTY)
}

export const countItems = (order: OrderItems) => Object.values(order).reduce((sum, qty) => sum + qty, 0)

export function useOrderCount() {
  return countItems(useOrderItems())
}
