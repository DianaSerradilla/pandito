import { useEffect, useRef } from 'react'
import { setQuantity, useOrderItems } from '../../lib/orderStore'

// "Agregar" for one line of the order, which becomes a −/quantity/+ stepper once it is in. Used on
// the cards and on the product page. Every button is at least 44 px and names the piece, the
// change is announced through `onAnnounce` (the page's live region) and the focus moves to the
// button that takes the place of the one just pressed, so a keyboard user never loses their spot.
const control =
  'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-ui border-[1.5px] border-tinta font-display text-lg uppercase tracking-wide transition-colors duration-150'

type Props = {
  /** The line of the order: the piece's slug, or slug|material|size (see product/productData.ts). */
  line: string
  /** How the piece is called in labels and announcements. */
  name: string
  /** Sends a sentence to the page's live region, so the change is heard. */
  onAnnounce: (text: string) => void
}

export function OrderControl({ line, name, onAnnounce }: Props) {
  const quantity = useOrderItems()[line] ?? 0
  const addRef = useRef<HTMLButtonElement>(null)
  const plusRef = useRef<HTMLButtonElement>(null)
  const focusNext = useRef<'add' | 'plus' | null>(null)

  useEffect(() => {
    if (focusNext.current === 'add') addRef.current?.focus()
    if (focusNext.current === 'plus') plusRef.current?.focus()
    focusNext.current = null
  }, [quantity])

  const change = (next: number) => {
    if (quantity === 0 && next > 0) focusNext.current = 'plus'
    if (next === 0) focusNext.current = 'add'
    setQuantity(line, next)
    onAnnounce(next === 0 ? `${name} quitado del pedido.` : `${name}: ${next} en el pedido.`)
  }

  if (quantity === 0) {
    return (
      <button
        ref={addRef}
        type="button"
        onClick={() => change(1)}
        aria-label={`Agregar ${name} al pedido`}
        className={`${control} w-full bg-tinta px-3 text-crema hover:bg-azul`}
      >
        Agregar
      </button>
    )
  }

  return (
    <div role="group" aria-label={`Cantidad de ${name}`} className="flex items-stretch gap-1.5">
      <button
        type="button"
        onClick={() => change(quantity - 1)}
        aria-label={quantity === 1 ? `Quitar ${name} del pedido` : `Una menos de ${name}`}
        className={`${control} bg-crema hover:bg-tinta hover:text-crema`}
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 8h10" />
        </svg>
      </button>
      <p className="grid min-h-11 flex-1 place-items-center font-display text-xl tabular-nums">
        <span>
          {quantity}
          <span className="sr-only"> en el pedido</span>
        </span>
      </p>
      <button
        ref={plusRef}
        type="button"
        onClick={() => change(quantity + 1)}
        aria-label={`Una más de ${name}`}
        className={`${control} bg-tinta text-crema hover:bg-azul`}
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 8h10M8 3v10" />
        </svg>
      </button>
    </div>
  )
}
