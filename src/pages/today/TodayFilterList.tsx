import type { ReactNode } from 'react'
import type { TodayFilterGroup } from './todayItems'

// The filter list, as in an online shop: groups with a plain list of options, each with a checkbox
// and how many pieces it would show. Several options can be ticked in a group. Used in the left
// column on wide screens and inside the sheet on phones. `before` leaves room for a custom group
// (the Catalog's topics, which are too many for a plain list).
export type TodaySelection = Record<string, string[]>

type Props = {
  groups: Pick<TodayFilterGroup, 'key' | 'label' | 'options'>[]
  selected: TodaySelection
  /** How many pieces an option would show, given the search and the other groups. */
  countFor: (groupKey: string, optionKey: string) => number
  onToggle: (groupKey: string, optionKey: string) => void
  onClear: () => void
  /** Prefix for the input ids, so the column and the sheet do not share them. */
  idPrefix: string
  before?: ReactNode
}

type OptionProps = {
  id: string
  label: string
  count: number
  checked: boolean
  onChange: () => void
}

/** One tickable row: a 44 px target, a real checkbox, and the count read out with the name. */
export function FilterOption({ id, label, count, checked, onChange }: OptionProps) {
  return (
    <label
      htmlFor={id}
      className={`flex min-h-11 cursor-pointer items-center gap-3 text-base ${count === 0 && !checked ? 'text-tinta/70' : ''}`}
    >
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="grid size-6 shrink-0 place-items-center rounded-[0.25rem] border-[1.5px] border-tinta bg-crema text-crema transition-colors duration-150 peer-checked:bg-naranja peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-azul peer-checked:[&>svg]:opacity-100"
      >
        <svg viewBox="0 0 16 16" className="size-3 opacity-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 8.5 3.2 3.2L13 5" />
        </svg>
      </span>
      <span className="flex-1">{label}</span>
      <span className="text-sm tabular-nums text-tinta/75">
        <span aria-hidden="true">{count}</span>
        <span className="sr-only">{count === 1 ? ', 1 diseño' : `, ${count} diseños`}</span>
      </span>
    </label>
  )
}

export function TodayFilterList({ groups, selected, countFor, onToggle, onClear, idPrefix, before }: Props) {
  const any = Object.values(selected).some((keys) => keys.length > 0)

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl uppercase leading-none">Filtros</h2>
        {any && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold underline decoration-naranja decoration-2 underline-offset-4 hover:text-naranja"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="mt-4">
        {before}
        {groups.map((group) => (
          <details key={group.key} open className="group/filter border-t-[1.5px] border-tinta/20 py-4 last:border-b-[1.5px]">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-display text-lg uppercase tracking-wide [&::-webkit-details-marker]:hidden">
              {group.label}
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="size-4 transition-transform duration-200 group-open/filter:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 6 5 5 5-5" />
              </svg>
            </summary>
            <ul role="group" aria-label={group.label} className="mt-1">
              {group.options.map((option) => (
                <li key={option.key}>
                  <FilterOption
                    id={`${idPrefix}-${group.key}-${option.key}`}
                    label={option.label}
                    count={countFor(group.key, option.key)}
                    checked={selected[group.key]?.includes(option.key) ?? false}
                    onChange={() => onToggle(group.key, option.key)}
                  />
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  )
}
