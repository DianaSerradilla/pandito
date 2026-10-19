import { Button, ButtonLink } from '../components/ui/Button'
import { Heading } from '../components/ui/Heading'
import { Script } from '../components/ui/Script'
import { StatusMessage } from '../components/ui/StatusMessage'
import { Tag } from '../components/ui/Tag'

// Development-only reference for the team (route registered only in `npm run dev`).
// Shows the tokens and base components. Placeholder labels, not public copy.
const palette = [
  { name: 'naranja', hex: '#D4571F', bg: 'bg-naranja', text: 'text-crema', role: 'Logo y protagonista' },
  { name: 'azul', hex: '#2340E8', bg: 'bg-azul', text: 'text-crema', role: 'Acento fuerte' },
  { name: 'tinta', hex: '#14141A', bg: 'bg-tinta', text: 'text-crema', role: 'Texto y fondo oscuro' },
  { name: 'crema', hex: '#F5EEE2', bg: 'bg-crema border border-tinta', text: 'text-tinta', role: 'Fondo claro' },
  { name: 'amarillo', hex: '#FFD23F', bg: 'bg-amarillo', text: 'text-tinta', role: 'Chispa, solo detalles' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t-2 border-tinta py-8">
      <h2 className="mb-6 font-sans text-body font-bold">{title}</h2>
      {children}
    </section>
  )
}

export function DesignTokensPage() {
  return (
    <div>
      <Heading as="h1" size="title">Tokens y base</Heading>
      <p className="mt-2 max-w-prose">
        Referencia interna, solo visible en desarrollo. Escala tipográfica web, radio y sombras son
        propuestas pendientes de aprobación.
      </p>

      <Section title="Paleta Pista">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {palette.map((c) => (
            <li key={c.name} className={`${c.bg} ${c.text} rounded-ui p-4`}>
              <p className="font-display text-subtitle uppercase">{c.name}</p>
              <p>{c.hex}</p>
              <p>{c.role}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Tipografía">
        <div className="space-y-4">
          <Heading as="h2" size="display">Display Anton</Heading>
          <Heading as="h3" size="title">Título Anton</Heading>
          <Heading as="h4" size="subtitle">Subtítulo Anton</Heading>
          <Script>Comentario en Rock Salt</Script>
          <div className="bg-tinta p-4">
            <Script on="dark">Sobre tinta, en amarillo</Script>
          </div>
          <p>
            DM Sans para textos largos, etiquetas, precios y datos. Mínimo 16 px en web. Tiene
            regular, <strong>negrita</strong> y <em>cursiva</em>.
          </p>
        </div>
      </Section>

      <Section title="Botones">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Principal</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="accent">Acento</Button>
          <Button size="lg" tiltDeg="-1deg">Grande</Button>
          <Button disabled>Deshabilitado</Button>
          <ButtonLink to="/catalogo" variant="secondary">Enlace</ButtonLink>
        </div>
      </Section>

      <Section title="Etiquetas">
        <div className="flex flex-wrap gap-3">
          <Tag>Termo</Tag>
          <Tag tone="ink">Celular</Tag>
          <Tag tone="blue">Cápsula</Tag>
        </div>
      </Section>

      <Section title="Estados">
        <div className="grid gap-4 md:grid-cols-3">
          <StatusMessage kind="loading" title="Cargando">Texto de ejemplo.</StatusMessage>
          <StatusMessage
            kind="empty"
            title="Sin resultados"
            action={<ButtonLink to="/catalogo" variant="secondary">Ver todo</ButtonLink>}
          >
            Texto de ejemplo.
          </StatusMessage>
          <StatusMessage kind="error" title="Algo falló">Texto de ejemplo.</StatusMessage>
        </div>
      </Section>
    </div>
  )
}
