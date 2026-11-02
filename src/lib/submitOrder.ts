import { supabase } from './supabase'

// Saves the order of the cart in Supabase before it goes out by WhatsApp (REQ-WEB-CART-*). The
// server prices it again from its own variants, so the prices the visitor saw are never trusted.
// The visitor is never blocked by this: when it fails, the caller still opens WhatsApp, without a
// code, and says so calmly (`message` is already in Spanish and fit to show).
export type OrderLine = { variantId: string; quantity: number }

export type SubmitResult =
  | { ok: true; id: string; /** The human code ("R-014"); missing if it could not be read back. */ code?: string }
  | { ok: false; message: string }

const FAILED = 'No pudimos guardar el pedido, pero igual podés mandarlo por WhatsApp.'

// The server answers with short generic English texts; these are the ones worth telling apart.
const KNOWN_ERRORS: [needle: string, message: string][] = [
  ['too many requests', 'Hay demasiados pedidos ahora, probá en un rato. Igual podés mandarlo por WhatsApp.'],
  ['variant not available', 'Alguno de los stickers ya no está disponible, así que no lo guardamos. Igual podés mandarlo por WhatsApp.'],
]

export function friendlyError(raw: unknown): string {
  const text = (raw instanceof Error ? raw.message : typeof raw === 'object' && raw !== null && 'message' in raw ? String(raw.message) : String(raw)).toLowerCase()
  return KNOWN_ERRORS.find(([needle]) => text.includes(needle))?.[1] ?? FAILED
}

/** A sample slot ("ejemplo-1") is not a uuid and must never reach the database. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isRealSlotId = (id: string | undefined): id is string => id !== undefined && UUID.test(id)

export async function submitOrder(input: {
  name: string
  lines: OrderLine[]
  slotId: string | null
  note: string
}): Promise<SubmitResult> {
  if (!supabase) return { ok: false, message: FAILED }
  try {
    const { data: id, error } = await supabase.rpc('submit_web_request', {
      p_customer_name: input.name,
      p_items: input.lines.map((line) => ({ variant_id: line.variantId, quantity: line.quantity })),
      p_slot_id: isRealSlotId(input.slotId ?? undefined) ? input.slotId : null,
      p_note: input.note === '' ? null : input.note,
    })
    if (error) return { ok: false, message: friendlyError(error) }
    if (typeof id !== 'string') return { ok: false, message: FAILED }

    // The code is a courtesy for the WhatsApp message: the order is already saved without it.
    const { data: code, error: codeError } = await supabase.rpc('web_request_code', { p_id: id })
    return { ok: true, id, code: !codeError && typeof code === 'string' && code !== '' ? code : undefined }
  } catch (error) {
    return { ok: false, message: friendlyError(error) }
  }
}
