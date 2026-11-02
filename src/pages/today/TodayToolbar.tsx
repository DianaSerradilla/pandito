import { useEffect, useRef, useState, type ReactNode } from 'react'
import { stickerBase, stickerSize, stickerTone, tilt } from '../../components/ui/sticker'
import { designNoun, type Noun } from './todayItems'

// Row above the HOY listing: search, sort, how many pieces match, the switch between large and
// compact tiles (wide screens) and, below 1024 px, the button that opens the filters in a sheet from
// the bottom (on wide screens the filters live in the left column instead). The sheet is a native
// <dialog>, so it traps the focus, closes with Escape and is announced as a modal. Every control has
// a name a screen reader can read; the count is announced by the page's own live region.
export type TodayView = 'large' | 'compact'
export type TodaySort = 'featured' | 'name' | 'price-asc' | 'price-desc'

const sortOptions: { key: TodaySort; label: string }[] = [
  { key: 'featured', label: 'Destacados' },
  { key: 'name', label: 'Nombre (A-Z)' },
  { key: 'price-asc', label: 'Precio: menor a mayor' },
  { key: 'price-desc', label: 'Precio: mayor a menor' },
]

type Props = {
  /** Which sort options to offer; all of them by default. */
  sortKeys?: TodaySort[]
  noun?: Noun
  query: string
  onQuery: (value: string) => void
  sort: TodaySort
  onSort: (sort: TodaySort) => void
  view: TodayView
  onView: (view: TodayView) => void
  /** How many pieces match the current search and filters. */
  count: number
  /** How many filter options are ticked (shown on the button). */
  activeFilters: number
  /** The filter list, shown inside the sheet. */
  sheet: ReactNode
}

const small = `${stickerBase} ${stickerSize.md} min-h-11 cursor-pointer`

export function TodayToolbar({ sortKeys, noun = designNoun, query, onQuery, sort, onSort, view, onView, count, activeFilters, sheet }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // The sheet is hidden from 1024 px up (the filters move to a column): close it if the screen grows
  // while it is open, or the rest of the page would stay blocked behind an invisible modal.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (wide.matches) setOpen(false)
    }
    wide.addEventListener('change', onChange)
    return () => wide.removeEventListener('change', onChange)
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
      <div role="search" className="min-w-0 basis-full md:basis-auto md:flex-1 md:max-w-sm">
        <label className="relative block">
          <span className="sr-only">Buscar un {noun.one}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tinta/70"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="m13 13 4 4" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={`Buscar un ${noun.one}`}
            autoComplete="off"
            className="min-h-11 w-full rounded-ui border-[1.5px] border-tinta bg-crema py-2 pl-9 pr-3 text-base shadow-sticker placeholder:text-tinta/70"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        style={tilt('-1.5deg')}
        className={`${small} ${stickerTone.paper} shrink-0 lg:hidden`}
      >
        Filtros{activeFilters > 0 ? ` · ${activeFilters}` : ''}
      </button>

      <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold md:flex-none">
        <span className="shrink-0">Ordenar por</span>
        <select
          value={sort}
          onChange={(event) => onSort(event.target.value as TodaySort)}
          className="min-h-11 min-w-0 flex-1 cursor-pointer rounded-ui border-[1.5px] border-tinta bg-crema px-2.5 text-base font-medium"
        >
          {sortOptions.filter((option) => !sortKeys || sortKeys.includes(option.key)).map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <p aria-hidden="true" className="ml-auto hidden whitespace-nowrap text-sm font-medium text-tinta/75 lg:block md:text-base">
        {count === 1 ? `1 ${noun.one}` : `${count} ${noun.many}`}
      </p>

      <div role="group" aria-label="Tamaño de las tarjetas" className="hidden shrink-0 gap-2 md:flex">
        {(['large', 'compact'] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={view === option}
            onClick={() => onView(option)}
            style={tilt(option === 'large' ? '-1.5deg' : '1.5deg')}
            className={`${small} ${view === option ? stickerTone.current : stickerTone.paper}`}
          >
            {option === 'large' ? 'Grande' : 'Compacta'}
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Filtros"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false)
        }}
        className="m-0 mt-auto max-h-[88svh] w-full max-w-none overflow-y-auto rounded-t-[1rem] border-[1.5px] border-b-0 border-tinta bg-crema p-5 text-tinta shadow-sticker backdrop:bg-tinta/55 lg:hidden"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar los filtros"
            className="grid size-11 cursor-pointer place-items-center rounded-ui border-[1.5px] border-tinta"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m3 3 10 10M13 3 3 13" />
            </svg>
          </button>
        </div>
        {sheet}
        <div className="sticky bottom-0 -mx-5 mt-4 flex gap-3 border-t-[1.5px] border-tinta/20 bg-crema px-5 pb-1 pt-4">
          <button type="button" onClick={() => setOpen(false)} className={`${stickerBase} ${stickerSize.md} ${stickerTone.ink} min-h-11 flex-1 cursor-pointer`}>
            Ver {count === 1 ? `1 ${noun.one}` : `${count} ${noun.many}`}
          </button>
        </div>
      </dialog>
    </div>
  )
}
