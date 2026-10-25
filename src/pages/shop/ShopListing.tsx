import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cartNav } from '../../components/layout/navItems'
import { site } from '../../config/site'
import { ArrowLink } from '../../components/ui/ArrowLink'
import { StatusMessage } from '../../components/ui/StatusMessage'
import { stickerBase, stickerSize, stickerTone } from '../../components/ui/sticker'
import { normalize } from '../../lib/text'
import { countItems, useOrderItems } from '../../lib/orderStore'
import { orderTotal } from '../product/productData'
import { TodayCard } from '../today/TodayCard'
import { TodayFilterList, type TodaySelection } from '../today/TodayFilterList'
import { TodayToolbar, type TodaySort, type TodayView } from '../today/TodayToolbar'
import { formatPrice, type TodayFilterGroup, type TodayItem } from '../today/todayItems'

// The shop part shared by HOY and the Catalog: search, sort, filters (a column on wide screens, a
// sheet on phones), the grid in batches and the bar with the order so far. Each page brings its
// items and its filter groups. A group can be drawn by the page itself (`renderGroup`) when a plain
// list does not fit, like the Catalog's topics. Accessibility lives here once: skip link, heading
// outline (h2 results > h3 per piece), live region for the count and the order, focus after "Ver
// más". The order is kept by lib/orderStore; prices are SAMPLES until the team approves them.
const PAGE_SIZE = 12

const sorters: Record<TodaySort, ((a: TodayItem, b: TodayItem) => number) | null> = {
  featured: null,
  name: (a, b) => a.name.localeCompare(b.name, 'es'),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
}

const textButton =
  'inline-flex min-h-11 cursor-pointer items-center rounded-ui border-[1.5px] border-tinta px-4 py-2 font-display uppercase tracking-wide hover:bg-tinta hover:text-crema'

/** What a page-drawn filter group receives. */
export type GroupContext = {
  selected: string[]
  countFor: (optionKey: string) => number
  onToggle: (optionKey: string) => void
  idPrefix: string
}

type Props<T extends TodayItem> = {
  items: T[]
  groups: TodayFilterGroup<T>[]
  /** Groups drawn by the page: it gets the group and returns what to show in the filter column. */
  renderGroup?: Record<string, (context: GroupContext) => ReactNode>
  /** Extra words the search also looks at (besides name and kind). */
  searchText?: (item: T) => string
  /** Cards with just the sticker, no frame or colored tile. */
  cleanCards?: boolean
  /** Where the read of the items is: while it loads or after it failed, the page shows that instead
   *  of the shop (REQ-WEB-CATALOG-004). */
  status?: 'ready' | 'loading' | 'error'
  onRetry?: () => void
}

export function ShopListing<T extends TodayItem>({ items, groups, renderGroup = {}, searchText, cleanCards = false, status = 'ready', onRetry }: Props<T>) {
  const [selected, setSelected] = useState<TodaySelection>({})
  const [query, setQuery] = useState('')
  const [view, setView] = useState<TodayView>('compact')
  const [sort, setSort] = useState<TodaySort>('featured')
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [announcement, setAnnouncement] = useState('')
  const listRef = useRef<HTMLUListElement>(null)
  const focusFrom = useRef<number | null>(null)
  const order = useOrderItems()

  const q = normalize(query)

  // Does a piece pass the search and the ticked filters? Inside a group any ticked option is
  // enough; the groups combine. `skip` leaves one group out, to count what an option would add.
  const passes = (item: T, skip?: string) => {
    if (q && !normalize(`${item.name} ${item.kind} ${searchText?.(item) ?? ''}`).includes(q)) return false
    return groups.every((group) => {
      const picked = selected[group.key]
      if (group.key === skip || !picked?.length) return true
      return group.pick(item).some((key) => picked.includes(key))
    })
  }

  const matches = useMemo(() => {
    const found = items.filter((item) => passes(item))
    const compare = sorters[sort]
    return compare ? found.toSorted(compare) : found
    // `passes` is rebuilt every render from exactly these.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, q, selected, sort])

  const shown = matches.slice(0, limit)
  const remaining = matches.length - shown.length
  const compact = view === 'compact'
  const orderCount = countItems(order)
  const total = orderTotal(order)
  const countText = matches.length === 1 ? '1 diseño' : `${matches.length} diseños`

  const ticked = groups.flatMap((group) =>
    (selected[group.key] ?? []).map((key) => ({
      group: group.key,
      key,
      label: group.options.find((option) => option.key === key)?.label ?? key,
    })),
  )

  // After "Ver más" the focus goes to the first piece that was added, so a keyboard user does not
  // have to tab through everything again.
  useEffect(() => {
    if (focusFrom.current === null) return
    listRef.current?.querySelectorAll<HTMLElement>('a[data-product]')[focusFrom.current]?.focus()
    focusFrom.current = null
  }, [limit])

  // A new search or filter starts again from the first batch.
  const toggle = (groupKey: string, optionKey: string) => {
    setSelected((current) => {
      const list = current[groupKey] ?? []
      return { ...current, [groupKey]: list.includes(optionKey) ? list.filter((key) => key !== optionKey) : [...list, optionKey] }
    })
    setLimit(PAGE_SIZE)
  }
  const clearFilters = () => {
    setSelected({})
    setLimit(PAGE_SIZE)
  }
  const reset = () => {
    clearFilters()
    setQuery('')
  }

  const countFor = (groupKey: string, optionKey: string) => {
    const group = groups.find((entry) => entry.key === groupKey)
    if (!group) return 0
    return items.filter((item) => passes(item, groupKey) && group.pick(item).includes(optionKey)).length
  }

  const filterList = (idPrefix: string) => (
    <TodayFilterList
      groups={groups.filter((group) => !renderGroup[group.key])}
      selected={selected}
      countFor={countFor}
      onToggle={toggle}
      onClear={clearFilters}
      idPrefix={idPrefix}
      before={groups
        .filter((group) => renderGroup[group.key])
        .map((group) => (
          <div key={group.key}>
            {renderGroup[group.key]({
              selected: selected[group.key] ?? [],
              countFor: (optionKey) => countFor(group.key, optionKey),
              onToggle: (optionKey) => toggle(group.key, optionKey),
              idPrefix,
            })}
          </div>
        ))}
    />
  )

  if (status === 'loading') {
    return (
      <div aria-busy="true">
        <p role="status" className="text-center text-base font-semibold">
          Cargando los diseños…
        </p>
        <ul aria-hidden="true" className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index}>
              <div className="aspect-square animate-pulse rounded-ui bg-tinta/10" />
              <div className="mt-3 h-5 w-3/4 animate-pulse rounded-ui bg-tinta/10" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded-ui bg-tinta/10" />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-xl">
        <StatusMessage
          kind="error"
          title="No pudimos cargar los diseños"
          action={
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={onRetry ?? (() => window.location.reload())} className={textButton}>
                Probar de nuevo
              </button>
              <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className={textButton}>
                Escribime por WhatsApp
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            </div>
          }
        >
          Probá de nuevo en un rato. Si es urgente, escribime y lo vemos por WhatsApp.
        </StatusMessage>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <StatusMessage
          kind="empty"
          title="Todavía no hay diseños"
          action={
            <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className={textButton}>
              Escribime por WhatsApp
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
          }
        >
          Estoy preparando el catálogo. Si buscás algo en particular, escribime.
        </StatusMessage>
      </div>
    )
  }

  return (
    <div>
      <a
        href="#resultados"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-ui focus:border-[1.5px] focus:border-tinta focus:bg-crema focus:px-4 focus:py-2.5 focus:font-semibold"
      >
        Saltar a los resultados
      </a>
      {/* One polite message at a time: how many pieces match, and what changed in the order. */}
      <p role="status" className="sr-only">
        {announcement || `${countText}.`}
      </p>

      <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[15.5rem_minmax(0,1fr)] xl:gap-14">
        {/* The filter column: wide screens only, and pinned while you scroll. */}
        <aside aria-label="Filtros" className="hidden lg:sticky lg:top-[6.25rem] lg:block lg:max-h-[calc(100svh-7.5rem)] lg:overflow-y-auto lg:pr-2">
          {filterList('col')}
        </aside>

        <div>
          <TodayToolbar
            query={query}
            onQuery={(value) => {
              setQuery(value)
              setLimit(PAGE_SIZE)
            }}
            sort={sort}
            onSort={(next) => {
              setSort(next)
              setLimit(PAGE_SIZE)
            }}
            view={view}
            onView={setView}
            count={matches.length}
            activeFilters={ticked.length}
            sheet={filterList('sheet')}
          />

          {ticked.length > 0 && (
            <ul aria-label="Filtros aplicados" className="mt-4 flex flex-wrap items-center gap-2">
              {ticked.map((chip) => (
                <li key={`${chip.group}-${chip.key}`}>
                  <button
                    type="button"
                    onClick={() => toggle(chip.group, chip.key)}
                    aria-label={`Quitar el filtro ${chip.label}`}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-ui border-[1.5px] border-tinta bg-crema px-3 text-sm font-semibold hover:bg-naranja"
                  >
                    {chip.label}
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="m3 3 10 10M13 3 3 13" />
                    </svg>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold underline decoration-naranja decoration-2 underline-offset-4 hover:text-naranja"
                >
                  Limpiar todo
                </button>
              </li>
            </ul>
          )}

          {matches.length === 0 ? (
            <div id="resultados" tabIndex={-1} className="mx-auto mt-12 max-w-xl scroll-mt-24 outline-none">
              <StatusMessage
                kind="empty"
                title="No encontré nada"
                action={
                  <button type="button" onClick={reset} className={textButton}>
                    Ver todos
                  </button>
                }
              >
                Probá con otra palabra u otros filtros, o mirá todos los diseños.
              </StatusMessage>
            </div>
          ) : (
            <section id="resultados" tabIndex={-1} aria-labelledby="resultados-title" className="mt-6 scroll-mt-24 outline-none">
              <h2 id="resultados-title" className="sr-only">
                Diseños
              </h2>
              <ul
                ref={listRef}
                key={`${JSON.stringify(selected)}|${query}|${view}|${sort}`}
                className={
                  compact
                    ? 'grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 2xl:grid-cols-5'
                    : 'grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5'
                }
              >
                {shown.map((item, index) => (
                  <li key={item.slug}>
                    <TodayCard item={item} index={index % PAGE_SIZE} compact={compact} clean={cleanCards} onAnnounce={setAnnouncement} />
                  </li>
                ))}
              </ul>

              {remaining > 0 && (
                <div className="mt-10 flex flex-col items-center gap-2 md:mt-14">
                  <p className="text-sm font-medium text-tinta/75">
                    Mostrando {shown.length} de {matches.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      focusFrom.current = shown.length
                      setLimit((current) => current + PAGE_SIZE)
                    }}
                    className={`${stickerBase} ${stickerSize.lg} ${stickerTone.paper} min-h-11 cursor-pointer`}
                  >
                    Ver más · {remaining}
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {orderCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t-[1.5px] border-tinta bg-crema/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <p className="text-base font-semibold">
              {orderCount === 1 ? '1 producto' : `${orderCount} productos`}
              <span className="font-medium text-tinta/75"> · {formatPrice(total)}</span>
              <span className="sr-only"> (precios de muestra, a confirmar)</span>
            </p>
            <ArrowLink to={cartNav.to} mark className="min-h-11">
              Ver mi pedido
            </ArrowLink>
          </div>
        </div>
      )}
    </div>
  )
}
