import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { paths } from '../paths'
import { site } from '../config/site'
import { ArrowAnchor } from '../components/ui/ArrowLink'
import { ButtonLink } from '../components/ui/Button'
import { Heading } from '../components/ui/Heading'
import { Script } from '../components/ui/Script'
import { StatusMessage } from '../components/ui/StatusMessage'
import { clearOrder, setQuantity, useOrderItems } from '../lib/orderStore'
import { useDeliverySlots } from '../data/useDeliverySlots'
import { lineInfo, orderPricing } from './product/productData'
import { OrderControl } from './shop/OrderControl'
import { tones } from './today/tones'
import { formatPrice } from './today/todayItems'

// My order (REQ-WEB-CART-*), PROTOTYPE. Nothing is paid or sent from the site: the order is
// closed on WhatsApp, so this page only gathers what was chosen, lets it be adjusted and builds
// the message ("Pedir" opens WhatsApp with it written, the team answers there with the final price
// and the delivery). The order lives in this browser (lib/orderStore). The number is the footer's
// until REQ-WEB-CART-005 confirms the one for orders; prices are SAMPLES, so the message says the
// total is an estimate. The name is required (it is who the team answers to), the notes are optional; neither is saved,
// they only go in the message.
const field =
  'mt-1.5 min-h-11 w-full rounded-ui border-[1.5px] border-tinta bg-crema px-3 py-2 text-base placeholder:text-tinta/70'

// Very long wa.me links get cut by some phones, so the cart warns before that happens.
const tooLongUrl = 1800

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

  const lines = Object.entries(order).flatMap(([key, quantity]) => {
    const info = lineInfo(key)
    return info ? [{ key, quantity, ...info }] : []
  })

  // A line whose piece no longer exists (an old order, a removed piece) is dropped.
  useEffect(() => {
    for (const key of Object.keys(order)) if (!lineInfo(key)) setQuantity(key, 0)
  }, [order])

  const slot = slots.find((entry) => entry.id === slotId)
  const nameMissing = name.trim() === ''
  const pricing = orderPricing(order)
  const { total } = pricing
  const pieces = lines.reduce((sum, line) => sum + line.quantity, 0)
  const label = (line: (typeof lines)[number]) => (line.options ? `${line.item.name}, ${line.options}` : line.item.name)

  const message = [
    'Hola! Quiero hacer este pedido:',
    '',
    ...lines.map((line) => `• ${line.quantity} × ${label(line)} (${formatPrice(line.price * line.quantity)})`),
    ...(pricing.applied.length > 0
      ? ['', ...pricing.applied.map(({ group, pack, times }) => `Promo: ${times > 1 ? `${times} × ` : ''}pack de ${pack.quantity} ${group.label} (${formatPrice(pack.price)})`), `Descuento por packs: -${formatPrice(pricing.discount)}`]
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
  const whatsappUrl = `${site.whatsappUrl}?text=${encodeURIComponent(message)}`

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
                  aria-label={`Ver ${line.item.name}`}
                  className={`grid aspect-square place-items-center overflow-hidden rounded-[0.25rem] border-[1.5px] border-tinta ${tones[line.item.tone]}`}
                >
                  <img
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
                <li key={`${group.key}-${pack.quantity}`}>
                  {times > 1 ? `${times} × ` : ''}Pack de {pack.quantity} {group.label}: {formatPrice(pack.price)}
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
                <li key={group.key}>
                  Sumá {missing} más de {group.label} y completás un pack.
                </li>
              ))}
            </ul>
          )}
          <p className="mt-1 text-sm text-tinta/75">Precio de muestra, a confirmar. La entrega se arregla por WhatsApp.</p>

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
                if (!nameMissing) {
                  setOpened(true)
                  return
                }
                event.preventDefault()
                setTriedWithoutName(true)
                nameRef.current?.focus()
              }}
            >
              Pedir
            </ArrowAnchor>
          </div>
          <p className="mt-3 text-sm text-tinta/75">Se abre WhatsApp con tu pedido escrito. No se paga acá.</p>
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
