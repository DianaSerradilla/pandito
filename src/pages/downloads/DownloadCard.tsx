import { SafeImage } from '../../components/ui/SafeImage'
import type { DownloadItem } from '../../data/publicCatalog'
import { registerDownload } from '../../lib/registerDownload'

// One free resource: its preview, what it is, its format and resolution, and a direct download. The
// link points at the file itself (no account, no email). It names the piece, since a screen reader
// hears the links out of context (REQ-WEB-DOWNLOAD-001). When the team wrote terms of use for the
// resource, they are shown under its data.
const noPreview = <span className="px-2 text-center text-sm font-semibold text-tinta/75">Vista previa no disponible</span>

export function DownloadCard({ item, index, compact }: { item: DownloadItem; index: number; compact: boolean }) {
  const details = [item.format, item.resolution].filter((part) => part !== '').join(' · ')
  return (
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      data-saveable
      className="today-card flex h-full flex-col rounded-ui border-[1.5px] border-tinta bg-crema p-2 shadow-sticker md:p-3"
    >
      <div className="grid aspect-square place-items-center overflow-hidden rounded-[0.25rem] bg-tinta/5">
        {item.preview ? (
          <SafeImage
            src={item.preview}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            fallback={noPreview}
            className="max-h-[84%] w-[68%] select-none object-contain"
          />
        ) : (
          noPreview
        )}
      </div>
      <h3 className={`mt-3 font-display text-xl uppercase leading-none tracking-[-0.01em] ${compact ? '' : 'md:text-2xl'}`}>{item.name}</h3>
      <p className="mt-1.5 text-sm font-medium text-tinta/75">{item.kind}</p>
      {details && (
        <p className="mt-1 text-sm tabular-nums text-tinta/75">
          <span className="sr-only">Formato y resolución: </span>
          {details}
        </p>
      )}
      {item.terms && <p className="mt-1 text-sm text-tinta/75">{item.terms}</p>}
      <a
        href={item.file}
        download
        onClick={() => registerDownload(item.slug)}
        aria-label={`Descargar ${item.name}, ${item.kind}${item.format ? `, ${item.format}` : ''}`}
        className="mt-3 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-ui border-[1.5px] border-tinta bg-tinta px-3 font-display text-lg uppercase tracking-wide text-crema transition-colors duration-150 hover:bg-azul focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-azul"
      >
        Descargar
      </a>
    </article>
  )
}
