import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link } from 'react-router'
import { paths } from '../paths'
import { site } from '../config/site'
import { ArrowAnchor } from '../components/ui/ArrowLink'
import { Button, ButtonLink } from '../components/ui/Button'
import { Heading } from '../components/ui/Heading'
import { Script } from '../components/ui/Script'
import { StatusMessage } from '../components/ui/StatusMessage'
import { clearOrder, setQuantity, useOrderItems } from '../lib/orderStore'
import { submitOrder } from '../lib/submitOrder'
import { isConnected, reloadCatalog, useCatalog } from '../data/publicCatalog'
import { useDeliverySlots } from '../data/useDeliverySlots'
import { lineInfo, orderPricing } from './product/productData'
import { hintLabel, packLabel } from './product/promos'
import { OrderControl } from './shop/OrderControl'
import { tones } from './today/tones'
import { formatPrice } from './today/todayItems'

// My order (REQ-WEB-CART-*), PROTOTYPE. Nothing is paid from the site: the order is closed on
// WhatsApp, so this page gathers what was chosen, lets it be adjusted and builds the message
// ("Pedir" opens WhatsApp with it written, the team answers there with the final price and the
// delivery). The order lives in this browser (lib/orderStore). The number is the footer's until
// REQ-WEB-CART-005 confirms the one for orders. The name is required (it is who the team answers
// to), the notes are optional.
//
// Connected to Supabase, "Pedir" also saves the request (lib/submitOrder) and the message starts
// with its code ("R-014"), so the team can find it. The WhatsApp window is opened blank, at the
// click, so the browser does not block it while the request is saved; if saving fails the message
// goes out without a code and the visitor is told, calmly: the sale is never blocked. The same
// content is saved once: tapping Pedir again reuses the code. Prices are the variants' prices, an
// estimate the team confirms: the server stores list prices and does not apply promotions, so the
// packs (data/promotions.ts) are applied here and listed in the message. Without Supabase the prices
// and packs are SAMPLES.
const field =
  'mt-1.5 min-h-11 w-full rounded-ui border-[1.5px] border-tinta bg-crema px-3 py-2 text-base placeholder:text-tinta/70'

// Very long wa.me links get cut by some phones, so the cart warns before that happens.
const tooLongUrl = 1800

const upperFirst = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** Takes the window opened at the click to WhatsApp, or opens one if there is none (or it was
 *  closed). A browser may still block the latter; the cart then says to tap Pedir again. */
function openWhatsApp(target: Window | null, url: string) {
  if (target && !target.closed) {
    target.location.href = url
    return
  }
  const opened = window.open(url, '_blank')
  if (opened) opened.opener = null
}

export function CartPage() {
  const order = useOrderItems()
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const [triedWithoutName, setTriedWithoutName] = useState(false)
  const slots = useDeliverySlots()
  const [slotId, setSlotId] = useState('')
  const [opened, setOpened] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const catalog = useCatalog()
  // What was saved, and for which content: the same content is not saved twice.
  const [saved, setSaved] = useState<{ signature: string; code?: string } | null>(null)
  const [saveNote, setSaveNote] = useState('')
  const saving = useRef(false)

  const lines = Object.entries(order).flatMap(([key, quantity]) => {
    const info = lineInfo(key)
    return info ? [{ key, quantity, ...info }] : []
  })

  // A line whose piece no longer exists (an old order, a removed piece) is dropped. Only once the
  // catalog is known: while it loads, or if it failed, no line can be told apart from a removed one.
  useEffect(() => {
    if (catalog.status !== 'ready') return
    for (const key of Object.keys(order)) if (!lineInfo(key)) setQuantity(key, 0)
  }, [order, catalog.status])

  const slot = slots.find((entry) => entry.id === slotId)
  const nameMissing = name.trim() === ''
  const pricing = orderPricing(order)
  const { total } = pricing
  const pieces = lines.reduce((sum, line) => sum + line.quantity, 0)
  const label = (line: (typeof lines)[number]) => (line.options ? `${line.item.name}, ${line.options}` : line.item.name)

  const signature = JSON.stringify([name.trim(), slot?.id ?? '', notes.trim(), lines.map((line) => [line.key, line.quantity])])
  const savedCode = saved?.signature === signature ? saved.code : undefined

  const buildMessage = (code?: string) => [
    code ? `Hola! Quiero hacer este pedido (${code}):` : 'Hola! Quiero hacer este pedido:',
    '',
    ...lines.map((line) => `• ${line.quantity} × ${label(line)} (${formatPrice(line.price * line.quantity)})`),
    ...(pricing.applied.length > 0
      ? ['', ...pricing.applied.map(({ group, pack, times }) => `Promo: ${times > 1 ? `${times} × ` : ''}${packLabel(group, pack)} (${formatPrice(pack.price)})`), `Descuento por packs: -${formatPrice(pricing.discount)}`]
      : []),
    '',
    `Total estimado: ${formatPrice(total)} (a confirmar)`,
    `Nombre: ${name.trim()}`,
    slot ? `Franja que me sirve: ${slot.label}` : '',
    notes.trim() ? `Aclaraciones: ${notes.trim()}` : '',
    '',
    'Entiendo que la disponibilidad, la demora y la coordinación final se confirman por acá.',
  ]
    .filter((row, index, all) => row !== '' || (index > 0 && all[index - 1] !== ''))
    .join('\n')
    .trim()
  const urlFor = (code?: string) => `${site.whatsappUrl}?text=${encodeURIComponent(buildMessage(code))}`
  const whatsappUrl = urlFor(savedCode)

  // "Pedir" with Supabase connected: save the request, then take the opened window to WhatsApp.
  const placeOrder = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (nameMissing) {
      event.preventDefault()
      setTriedWithoutName(true)
      nameRef.current?.focus()
      return
    }
    setOpened(true)
    if (!isConnected) return // the link itself opens WhatsApp
    event.preventDefault()
    if (saving.current) return

    // Same content as the request already saved: no second order, just WhatsApp again.
    if (saved?.signature === signature) {
      openWhatsApp(null, urlFor(saved.code))
      return
    }
    // A line without a variant id (the database lacks migration 0016) cannot be saved, but it can be sent.
    if (lines.some((line) => !line.variantId)) {
      setSaveNote('Este pedido tiene productos que todavía no podemos guardar, pero igual podés mandarlo por WhatsApp.')
      openWhatsApp(null, urlFor())
      return
    }

    // Opened now, while the click still counts, and sent to WhatsApp once the request is saved.
    const target = window.open('', '_blank')
    if (target) target.opener = null
    saving.current = true
    setSaveNote('Guardando tu pedido…')
    const result = await submitOrder({
      name: name.trim(),
      lines: lines.flatMap((line) => (line.variantId ? [{ variantId: line.variantId, quantity: line.quantity }] : [])),
      slotId: slot?.id ?? null,
      note: notes.trim(),
    })
    saving.current = false
    if (result.ok) {
      setSaved({ signature, code: result.code })
      setSaveNote(result.code ? `Guardamos tu pedido (${result.code}). Se abre WhatsApp para confirmarlo.` : 'Guardamos tu pedido. Se abre WhatsApp para confirmarlo.')
      openWhatsApp(target, urlFor(result.code))
    } else {
      setSaveNote(result.message)
      openWhatsApp(target, urlFor())
    }
  }

  // A connected cart cannot price anything until the catalog is known (the order stays saved).
  if (catalog.status === 'loading') {
    return (
      <div aria-busy="true" className="mx-auto max-w-xl py-10 md:py-20">
        <h1 className="sr-only">Mi pedido</h1>
        <p role="status" className="text-center text-base font-semibold">
          Cargando tu pedido…
        </p>
      </div>
    )
  }

  if (catalog.status === 'error') {
    return (
      <div className="mx-auto max-w-xl py-10 md:py-20">
        <h1 className="sr-only">Mi pedido</h1>
        <StatusMessage
          kind="error"
          title="No pudimos cargar tu pedido"
          action={
            <div className="flex flex-wrap gap-3">
              <Button onClick={reloadCatalog} variant="secondary">
                Probar de nuevo
              </Button>
              <ButtonLink to={paths.catalog} variant="secondary">
                Ver el catálogo
              </ButtonLink>
            </div>
          }
        >
          Tu pedido sigue guardado. Probá de nuevo en un rato. Si es urgente, escribime por WhatsApp.
        </StatusMessage>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-10 md:py-20">
        <h1 className="sr-only">Mi pedido</h1>
        <StatusMessage
          kind="empty"
          title="Todavía no hay nada en tu pedido"
          action={
            <ButtonLink to={paths.catalog} variant="secondary">
              Ver el catálogo
            </ButtonLink>
          }
        >
          Elegí tus stickers y vuelven acá para armar el pedido.
        </StatusMessage>
      </div>
    )
  }

  return (
    <div className="pb-16 pt-2 md:pb-28 md:pt-8">
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <header className="mx-auto max-w-2xl text-center">
        <Script>Tu selección</Script>
        <Heading id="pedido-title" as="h1" size="headline" family="sans" className="mt-3 text-balance">
          <span className="font-extrabold">Mi pedido</span>
        </Heading>
        <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-tinta/80 md:text-lg">
          Revisalo y tocá Pedir: se abre WhatsApp con todo escrito y ahí lo cerramos.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-14">
        <section aria-labelledby="productos-title">
          <h2 id="productos-title" className="sr-only">
            Productos
          </h2>
          <ul className="border-t-[1.5px] border-tinta/20">
            {lines.map((line) => (
              <li key={line.key} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b-[1.5px] border-tinta/20 py-5 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center">
                <Link
                  to={`/catalogo/${line.item.slug}`}
                  aria-hidden="true"
                  tabIndex={-1}
                  className={`grid aspect-square place-items-center overflow-hidden rounded-[0.25rem] border-[1.5px] border-tinta ${tones[line.item.tone]}`}
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src={line.item.image}
                    alt=""
                    draggable={false}
                    className={`max-h-[78%] w-[68%] select-none object-contain ${line.item.cut ? 'die-cut-thick' : ''}`}
                  />
                </Link>

                <div className="min-w-0">
                  <h3 className="font-display text-xl uppercase leading-none md:text-2xl">
                    <Link to={`/catalogo/${line.item.slug}`} className="hover:underline hover:decoration-naranja hover:decoration-2 hover:underline-offset-4">
                      {line.item.name}
                    </Link>
                  </h3>
                  {line.options && <p className="mt-1.5 text-sm font-medium text-tinta/75">{line.options}</p>}
                  <p className="mt-2 text-base font-bold tabular-nums">
                    <span className="sr-only">Precio de cada uno: </span>
                    {formatPrice(line.price)}
                    <span className="font-medium text-tinta/75"> c/u</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity(line.key, 0)
                      setAnnouncement(`${label(line)} quitado del pedido.`)
                    }}
                    aria-label={`Quitar ${label(line)} del pedido`}
                    className="mt-1 inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold underline decoration-naranja decoration-2 underline-offset-4 hover:text-naranja"
                  >
                    Quitar
                  </button>
                </div>

                <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end">
                  <div className="w-44">
                    <OrderControl line={line.key} name={label(line)} onAnnounce={setAnnouncement} />
                  </div>
                  <p className="text-lg font-bold tabular-nums">
                    <span className="sr-only">Subtotal: </span>
                    {formatPrice(line.price * line.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => {
              clearOrder()
              setAnnouncement('Pedido vaciado.')
            }}
            className="mt-3 inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold underline decoration-naranja decoration-2 underline-offset-4 hover:text-naranja"
          >
            Vaciar el pedido
          </button>
        </section>

        <aside aria-labelledby="resumen-title" className="rounded-ui border-[1.5px] border-tinta bg-crema p-5 shadow-sticker lg:sticky lg:top-[6.25rem]">
          <h2 id="resumen-title" className="font-display text-2xl uppercase leading-none">
            Resumen
          </h2>
          <p className="mt-4 flex items-baseline justify-between gap-3 text-base">
            <span>{pieces === 1 ? '1 sticker' : `${pieces} stickers`}</span>
            <span className="text-2xl font-bold tabular-nums">
              <span className="sr-only">Total estimado: </span>
              {formatPrice(total)}
            </span>
          </p>
          {pricing.applied.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm font-semibold">
              {pricing.applied.map(({ group, pack, times }) => (
                <li key={`${group.key}-${pack.quantity}-${pack.price}`}>
                  {times > 1 ? `${times} × ` : ''}
                  {upperFirst(packLabel(group, pack))}: {formatPrice(pack.price)}
                </li>
              ))}
              <li className="text-tinta/80">
                Ahorrás {formatPrice(pricing.discount)}
              </li>
            </ul>
          )}
          {pricing.hints.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-tinta/85">
              {pricing.hints.map(({ group, missing }) => (
                <li key={group.key}>{hintLabel(group, missing)}</li>
              ))}
            </ul>
          )}
          <p className="mt-1 text-sm text-tinta/75">
            {isConnected ? 'Total estimado, a confirmar. ' : 'Precio de muestra, a confirmar. '}La entrega se arregla por WhatsApp.
          </p>

          <label className="mt-5 block text-sm font-semibold">
            Tu nombre
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={triedWithoutName && nameMissing}
              aria-describedby={triedWithoutName && nameMissing ? 'nombre-error' : undefined}
              className={`${field} ${triedWithoutName && nameMissing ? 'border-naranja ring-2 ring-naranja' : ''}`}
            />
          </label>
          {triedWithoutName && nameMissing && (
            <p id="nombre-error" role="alert" className="mt-1.5 text-sm font-semibold text-tinta">
              Escribí tu nombre para poder pedir.
            </p>
          )}
          {slots.length > 0 ? (
            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">Franja que te queda cómoda (opcional)</legend>
              <div className="mt-2 grid gap-2">
                {slots.map((entry) => (
                  <div key={entry.id} className="relative">
                    <input
                      id={`franja-${entry.id}`}
                      type="radio"
                      name="franja"
                      value={entry.id}
                      checked={slotId === entry.id}
                      onChange={() => setSlotId(entry.id)}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={`franja-${entry.id}`}
                      className="flex min-h-11 cursor-pointer items-center rounded-ui border-[1.5px] border-tinta bg-crema px-3.5 py-2 text-base font-semibold transition-colors duration-150 hover:bg-tinta/5 peer-checked:bg-tinta peer-checked:text-crema peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-azul"
                    >
                      {entry.label}
                    </label>
                  </div>
                ))}
              </div>
              {slotId && (
                <button
                  type="button"
                  onClick={() => setSlotId('')}
                  className="mt-1 inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold underline decoration-naranja decoration-2 underline-offset-4 hover:text-naranja"
                >
                  No elegir franja
                </button>
              )}
              <p className="mt-1 text-sm text-tinta/75">Es una preferencia: el día, la hora y el lugar los confirmamos por WhatsApp.</p>
            </fieldset>
          ) : (
            <p className="mt-5 text-sm text-tinta/85">Por ahora no hay franjas publicadas. Escribinos por WhatsApp y vemos cómo coordinar.</p>
          )}

          <label className="mt-4 block text-sm font-semibold">
            Aclaraciones (opcional)
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Por ejemplo: un detalle del diseño o una duda"
              className={`${field} resize-y`}
            />
          </label>

          <div className="mt-6">
            <ArrowAnchor
              href={whatsappUrl}
              mark
              onClick={(event) => {
                void placeOrder(event)
              }}
            >
              Pedir
            </ArrowAnchor>
          </div>
          <p className="mt-3 text-sm text-tinta/75">
            {isConnected ? 'Guardamos tu pedido y se abre WhatsApp con el mensaje escrito. No se paga acá.' : 'Se abre WhatsApp con tu pedido escrito. No se paga acá.'}
          </p>
          {saveNote && (
            <p role="status" className="mt-2 text-sm font-semibold">
              {saveNote}
            </p>
          )}
          {whatsappUrl.length > tooLongUrl && (
            <p role="status" className="mt-2 text-sm font-semibold">
              Tu pedido es largo y WhatsApp podría cortarlo. Si falta algo en el mensaje, avisanos por ahí.
            </p>
          )}
          {opened && (
            <p role="status" className="mt-2 text-sm font-semibold">
              Si WhatsApp no se abrió, tocá Pedir de nuevo o escribinos desde el pie de la página. Tu pedido sigue guardado acá.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}
