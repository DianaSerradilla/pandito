import { useState } from 'react'
import { normalize } from '../../lib/text'
import { FilterOption } from '../today/TodayFilterList'
import type { GroupContext } from '../shop/ShopListing'
import { useCatalog, type CatalogTopic } from '../../data/publicCatalog'

// The Catalog's "Tema" filter. There can be dozens of topics, too many for a plain list, so it
// works in three steps: a search box, the few popular topics (plus any you already ticked, so a
// choice never hides), and "Ver todos los temas", which opens them grouped by family. Typing shows
// every topic that matches, from any family. Everything is a real checkbox with a 44 px target.
// The topics and families come from Supabase when it is connected, and are PLACEHOLDERS otherwise
// (see catalogItems.ts).
export function CatalogTopicFilter({ selected, countFor, onToggle, idPrefix }: GroupContext) {
  const { topics: catalogTopics, families: catalogFamilies } = useCatalog()
  const [text, setText] = useState('')
  const [showAll, setShowAll] = useState(false)
  const q = normalize(text)

  const row = (topic: CatalogTopic) => (
    <li key={topic.key}>
      <FilterOption
        id={`${idPrefix}-tema-${topic.key}`}
        label={topic.label}
        count={countFor(topic.key)}
        checked={selected.includes(topic.key)}
        onChange={() => onToggle(topic.key)}
      />
    </li>
  )

  const found = q ? catalogTopics.filter((topic) => normalize(topic.label).includes(q)) : []
  const visible = catalogTopics.filter((topic) => topic.popular || selected.includes(topic.key))
  const hiddenCount = catalogTopics.length - visible.length

  return (
    <div className="border-t-[1.5px] border-tinta/20 py-4">
      <h2 className="font-display text-lg uppercase tracking-wide">Tema</h2>

      <label className="relative mt-2 block">
        <span className="sr-only">Buscar un tema</span>
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
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Buscar un tema"
          autoComplete="off"
          className="min-h-11 w-full rounded-ui border-[1.5px] border-tinta bg-crema py-2 pl-9 pr-3 text-base placeholder:text-tinta/70"
        />
      </label>

      {q ? (
        <>
          <p role="status" className="mt-2 text-sm text-tinta/75">
            {found.length === 0 ? 'No hay temas con ese nombre.' : found.length === 1 ? '1 tema' : `${found.length} temas`}
          </p>
          <ul role="group" aria-label="Temas encontrados">
            {found.map(row)}
          </ul>
        </>
      ) : (
        <>
          {/* Opened, the families already hold every topic: the short list would only repeat them. */}
          {!showAll && (
            <ul role="group" aria-label="Temas" className="mt-1">
              {visible.map(row)}
            </ul>
          )}

          {hiddenCount > 0 && (
            <button
              type="button"
              aria-expanded={showAll}
              aria-controls={`${idPrefix}-temas-todos`}
              onClick={() => setShowAll((open) => !open)}
              className="mt-1 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold underline decoration-naranja decoration-2 underline-offset-4 hover:text-naranja"
            >
              {showAll ? 'Ver menos temas' : `Ver todos los temas (${catalogTopics.length})`}
            </button>
          )}

          <div id={`${idPrefix}-temas-todos`} hidden={!showAll}>
            {showAll && catalogFamilies.map((family) => {
              const topics = catalogTopics.filter((topic) => topic.family === family.key)
              const ticked = topics.filter((topic) => selected.includes(topic.key)).length
              return (
                <details key={family.key} className="group/family border-t border-tinta/15">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-base font-semibold [&::-webkit-details-marker]:hidden">
                    <span>
                      {family.label}
                      {ticked > 0 && <span className="ml-2 rounded-ui bg-naranja px-1.5 text-xs font-bold text-tinta">{ticked}<span className="sr-only"> marcados</span></span>}
                    </span>
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 transition-transform duration-200 group-open/family:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 6 5 5 5-5" />
                    </svg>
                  </summary>
                  <ul role="group" aria-label={family.label} className="pb-2 pl-1">
                    {topics.map(row)}
                  </ul>
                </details>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
