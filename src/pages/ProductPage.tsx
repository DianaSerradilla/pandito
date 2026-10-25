import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { paths } from '../paths'
import { site } from '../config/site'
import { cartNav } from '../components/layout/navItems'
import { ArrowAnchor, ArrowLink } from '../components/ui/ArrowLink'
import { Button, ButtonLink } from '../components/ui/Button'
import { Heading } from '../components/ui/Heading'
import { Script } from '../components/ui/Script'
import { StatusMessage } from '../components/ui/StatusMessage'
import { useOrderItems } from '../lib/orderStore'
import { useCatalogStatus } from '../data/useCatalogStatus'
import { availabilityOf, catalogTopics, lineKey, materials, sizes, stickerUses, variantPrice, type Availability } from '../data/publicCatalog'
import { ProductGallery } from './product/ProductGallery'
import { promoGroupOf } from './product/promos'
import { findProduct, recommended, type Product } from './product/productData'
import { OrderControl } from './shop/OrderControl'
import { TodayCard } from './today/TodayCard'
import { formatPrice } from './today/todayItems'
import { pageTitle } from '../config/pageMeta'
import { usePageMeta } from '../lib/pageMeta'

// Product page (REQ-WEB-PRODUCT-*), PROTOTYPE. The piece on its colored tile, its options (material
// and size, both PLACEHOLDERS), the price that follows them, "Agregar" to the order and, for a
// whole sheet of the same sticker, a request through WhatsApp: that one is not bought, the team
// answers with the price. Below, "Te pueden gustar". The options are radio groups (arrow keys,
// real labels), the price and every change to the order are announced, and nothing here moves.
// SAMPLE DATA and PROVISIONAL COPY.
const radioCard =
  'flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-ui border-[1.5px] border-tinta bg-crema px-3.5 py-2 text-base font-semibold transition-colors duration-150 hover:bg-tinta/5 peer-checked:bg-tinta peer-checked:text-crema peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-azul'

// What each fulfilment condition says. "A pedido" promises no time: the team gives it on WhatsApp.
const availabilityCopy: Record<Availability, { label: string; text: string }> = {
  confirm: { label: 'Disponible para confirmar', text: 'Te confirmo por WhatsApp que lo tengo antes de que nos veamos.' },
  'on-request': { label: 'A pedido', text: 'Lo hago a pedido. Escribime y te cuento cuánto demora.' },
  unavailable: { label: 'No disponible por ahora', text: 'No lo tengo con estas opciones. Probá con otro tamaño o material, o escribime.' },
}

type Option = { key: string; label: string; hint: string }

function OptionGroup({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string
  name: string
  options: Option[]
  value: string
  onChange: (key: string) => void
}) {
  return (
    <fieldset className="mt-6">
      <legend className="font-display text-lg uppercase tracking-wide">{legend}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <div key={option.key} className="relative">
            <input
              id={`${name}-${option.key}`}
              type="radio"
              name={name}
              value={option.key}
              checked={value === option.key}
              onChange={() => onChange(option.key)}
              className="peer sr-only"
            />
            <label htmlFor={`${name}-${option.key}`} className={`${radioCard} h-full flex-col items-start justify-center gap-0.5`}>
              <span>{option.label}</span>
              <span className="text-sm font-medium opacity-80">{option.hint}</span>
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}

function ProductView({ product }: { product: Product }) {
  const { item, topics } = product
  const [material, setMaterial] = useState(materials[0].key)
  const [size, setSize] = useState(sizes[0].key)
  const [announcement, setAnnouncement] = useState('')
  const order = useOrderItems()

  const variants = item.hasVariants === true
  const materialPick = materials.find((entry) => entry.key === material) ?? materials[0]
  const sizePick = sizes.find((entry) => entry.key === size) ?? sizes[0]
  const materialLabel = materialPick.label
  const sizeLabel = `${sizePick.cm} cm`
  const price = variants ? variantPrice(material, size) : item.price
  const line = variants ? lineKey(item.slug, material, size) : item.slug
  const lineName = variants ? `${item.name}, ${materialLabel}, ${sizeLabel}` : item.name
  const availability: Availability = variants ? availabilityOf(item.slug, material, size) : 'confirm'
  const inOrder = order[line] ?? 0
  const topicLabels = topics.map((key) => catalogTopics.find((topic) => topic.key === key)?.label).filter(Boolean)
  const related = recommended(product)
  const packGroup = promoGroupOf(size)
  const description = item.description ?? (topicLabels.length > 0 ? `Sticker de ${topicLabels.join(', ')}.` : undefined)
  const uses = item.uses ?? stickerUses
  usePageMeta({
    title: pageTitle(item.name),
    description: description ?? `Sticker ${item.name} de Pandito.`,
  })

  // The request for a whole sheet: the team answers with the price, so nothing is added to the order.
  const sheetMessage = `Hola! Quiero pedir una plancha entera del sticker "${item.name}"${variants ? ` (${materialLabel}, ${sizeLabel})` : ''}. ¿Me pasás el precio? Ref: ${item.slug}`
  const askMessage = `Hola! Me interesa el sticker "${item.name}" (${materialLabel}, ${sizeLabel}). ¿Me contás si se puede? Ref: ${item.slug}`
  const askUrl = `${site.whatsappUrl}?text=${encodeURIComponent(askMessage)}`
  const sheetUrl = `${site.whatsappUrl}?text=${encodeURIComponent(sheetMessage)}`

  return (
    <div className="pb-20 pt-2 md:pb-28 md:pt-8">
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <nav aria-label="Ruta" className="text-sm font-medium text-tinta/75">
        <ol className="flex flex-wrap items-center gap-x-2">
          <li>
            <Link to={paths.catalog} className="inline-flex min-h-11 items-center underline decoration-naranja decoration-2 underline-offset-4 hover:text-naranja">
              Catálogo
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{item.name}</li>
        </ol>
      </nav>

      <div className="mt-2 grid gap-8 md:grid-cols-2 md:items-start md:gap-12 lg:gap-16">
        <div className="md:sticky md:top-[6.25rem]">
          <ProductGallery item={item} material={materialPick} size={sizePick} />
        </div>

        <div>
          <Script>{item.kind}</Script>
          <Heading id="producto-title" as="h1" size="headline" family="sans" className="mt-2 text-balance">
            <span className="font-extrabold">{item.name}</span>
          </Heading>

          {topicLabels.length > 0 && (
            <ul aria-label="Temas" className="mt-3 flex flex-wrap gap-2">
              {topicLabels.map((label) => (
                <li key={label} className="rounded-ui border-[1.5px] border-tinta px-2.5 py-0.5 text-sm font-semibold">
                  {label}
                </li>
              ))}
            </ul>
          )}

          {description && <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-tinta/85">{description}</p>}

          <p aria-live="polite" className="mt-5 text-3xl font-bold tabular-nums">
            <span className="sr-only">Precio: </span>
            {formatPrice(price)}
          </p>
          <p className="mt-1 text-sm text-tinta/75">Precio de muestra, a confirmar. Cada unidad.</p>

          <p aria-live="polite" className="mt-4 text-base">
            <span className="inline-flex items-center gap-2 rounded-ui border-[1.5px] border-tinta px-3 py-1 font-semibold">
              <span aria-hidden="true" className={`size-2.5 rounded-full ${availability === 'unavailable' ? 'bg-tinta/40' : availability === 'on-request' ? 'bg-amarillo ring-1 ring-tinta' : 'bg-naranja'}`} />
              {availabilityCopy[availability].label}
            </span>
            <span className="mt-2 block max-w-md text-pretty text-tinta/85">{availabilityCopy[availability].text}</span>
          </p>

          {variants && (
            <>
              <OptionGroup
                legend="Material"
                name="material"
                value={material}
                onChange={setMaterial}
                options={materials.map(({ key, label, note }) => ({ key, label, hint: note }))}
              />
              <OptionGroup
                legend="Tamaño (lado mayor)"
                name="tamano"
                value={size}
                onChange={setSize}
                options={sizes.map(({ key, label, cm, price: sizePrice }) => ({ key, label: `${cm} cm`, hint: `${label} · ${formatPrice(sizePrice)}` }))}
              />
              {packGroup && (
                <section aria-labelledby="packs-title" className="mt-6 rounded-ui border-[1.5px] border-tinta bg-amarillo/40 p-4">
                  <h2 id="packs-title" className="font-display text-xl uppercase leading-none">
                    Packs de {packGroup.label}
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-base font-semibold tabular-nums">
                    {packGroup.packs.map((pack) => (
                      <li key={pack.quantity}>
                        {pack.quantity} por {formatPrice(pack.price)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-tinta/80">
                    Con cualquier diseño. Se aplican solos en Mi pedido. Precios de muestra, a confirmar.
                  </p>
                </section>
              )}
            </>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            {availability === 'unavailable' ? (
              <ArrowAnchor href={askUrl} mark>
                Preguntame por esta opción
              </ArrowAnchor>
            ) : (
              <div className={inOrder > 0 ? 'w-44 shrink-0' : 'w-full'}>
                <OrderControl line={line} name={lineName} onAnnounce={setAnnouncement} />
              </div>
            )}
            {inOrder > 0 && (
              <ArrowLink to={cartNav.to} mark className="whitespace-nowrap">
                Ver mi pedido
              </ArrowLink>
            )}
          </div>

          {uses.length > 0 && (
            <section aria-labelledby="usos-title" className="mt-10">
              <h2 id="usos-title" className="font-display text-2xl uppercase leading-none">
                ¿Para qué sirve?
              </h2>
              <p className="mt-2 text-base text-tinta/85">Para pegar en:</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {uses.map((use) => (
                  <li key={use} className="rounded-ui border-[1.5px] border-tinta bg-crema px-3 py-1 text-base font-semibold">
                    {use}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-tinta/75">Usos sugeridos, a confirmar. Consultame si tenés otra superficie en mente.</p>
            </section>
          )}

          <section aria-labelledby="plancha-title" className="mt-10 rounded-ui border-[1.5px] border-dashed border-tinta p-5">
            <h2 id="plancha-title" className="font-display text-2xl uppercase leading-none">
              ¿Querés una plancha entera?
            </h2>
            <p className="mt-2 max-w-md text-pretty text-base leading-relaxed text-tinta/85">
              Una hoja con este mismo sticker repetido. Escribime y te paso el precio.
            </p>
            <div className="mt-4">
              <ArrowAnchor href={sheetUrl} mark>
                Pedir una plancha por WhatsApp
              </ArrowAnchor>
            </div>
          </section>
        </div>
      </div>

      <section aria-labelledby="recomendados-title" className="mt-16 md:mt-24">
        <h2 id="recomendados-title" className="font-display text-3xl uppercase leading-none md:text-4xl">
          Te pueden gustar
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {related.map((other, index) => (
            <li key={other.slug}>
              <TodayCard item={other} index={index} compact clean onAnnounce={setAnnouncement} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export function ProductPage() {
  const { slug } = useParams()
  const { status, retry } = useCatalogStatus()
  const product = slug ? findProduct(slug) : undefined

  // While the piece loads, or if it could not be read, the page says so (REQ-WEB-PRODUCT-006).
  if (status === 'loading') {
    return (
      <div aria-busy="true" className="pb-20 pt-2 md:pt-8">
        <p role="status" className="sr-only">
          Cargando el sticker…
        </p>
        <div aria-hidden="true" className="mt-10 grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="aspect-square animate-pulse rounded-ui bg-tinta/10" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 animate-pulse rounded-ui bg-tinta/10" />
            <div className="h-12 w-3/4 animate-pulse rounded-ui bg-tinta/10" />
            <div className="h-10 w-1/2 animate-pulse rounded-ui bg-tinta/10" />
            <div className="h-24 animate-pulse rounded-ui bg-tinta/10" />
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-xl py-10 md:py-20">
        <h1 className="sr-only">No pudimos cargar el sticker</h1>
        <StatusMessage
          kind="error"
          title="No pudimos cargar el sticker"
          action={
            <div className="flex flex-wrap gap-3">
              <Button onClick={retry} variant="secondary">
                Probar de nuevo
              </Button>
              <ButtonLink to={paths.catalog} variant="secondary">
                Ver el catálogo
              </ButtonLink>
            </div>
          }
        >
          Probá de nuevo en un rato. Si es urgente, escribime por WhatsApp.
        </StatusMessage>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-xl py-10 md:py-20">
        <h1 className="sr-only">Sticker no encontrado</h1>
        <StatusMessage
          kind="empty"
          title="No encontré ese sticker"
          action={
            <ButtonLink to={paths.catalog} variant="secondary">
              Ver el catálogo
            </ButtonLink>
          }
        >
          Puede que ya no esté o que el link tenga un error. Mirá todo lo que hay en el catálogo.
        </StatusMessage>
      </div>
    )
  }

  // Another sticker starts again from the first options.
  return <ProductView key={product.item.slug} product={product} />
}
