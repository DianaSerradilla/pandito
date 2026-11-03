import { asset } from '../lib/asset'
import { pageTitle } from '../config/pageMeta'
import { usePageMeta } from '../lib/pageMeta'
import { paths } from '../paths'
import { ArrowLink } from '../components/ui/ArrowLink'
import { Heading } from '../components/ui/Heading'
import { Script } from '../components/ui/Script'

// 404 and public errors (REQ-WEB-QUALITY-001). A route that does not exist, or a page that failed
// while drawing, never shows a blank screen or a technical trace: it says what happened in plain
// words and offers a way back (Home and Catalog). PROVISIONAL COPY in Pando's voice and a
// placeholder picture from the brand art: the team's own 404 copy and image are still pending.
type Props = {
  kind?: 'not-found' | 'error'
}

const copy = {
  'not-found': {
    script: 'Uy, me perdí',
    title: 'Acá no hay nada.',
    text: 'Este link no existe o ya no está. Volvé al inicio o mirá todo el catálogo.',
  },
  error: {
    script: 'Se me trabó',
    title: 'Algo no salió bien.',
    text: 'Probá de nuevo en un rato. Si tenías cosas en tu pedido, siguen guardadas.',
  },
} as const

export function NotFoundPage({ kind = 'not-found' }: Props) {
  const text = copy[kind]
  usePageMeta({
    title: pageTitle(kind === 'error' ? 'Algo no salió bien' : 'Página no encontrada'),
    noindex: true,
  })

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-10 text-center md:py-20">
      <img
        src={asset('/brand/pando.svg')}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="die-cut-thick h-40 w-auto select-none md:h-52"
      />
      <Script className="mt-8">{text.script}</Script>
      <Heading as="h1" size="headline" family="sans" className="mt-2 text-balance">
        <span className="font-extrabold">{text.title}</span>
      </Heading>
      <p role={kind === 'error' ? 'alert' : undefined} className="mt-4 max-w-md text-pretty text-base leading-relaxed text-tinta/85 md:text-lg">
        {text.text}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
        <ArrowLink to={paths.home} mark>
          Volver al inicio
        </ArrowLink>
        <ArrowLink to={paths.catalog}>Ver el catálogo</ArrowLink>
      </div>
    </div>
  )
}
