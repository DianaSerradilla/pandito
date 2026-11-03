// Text block under the hero (after the one on extrafazant.nl/wat-we-doen): one big sentence and a
// few small lines. PROVISIONAL COPY, to be replaced by the team's own.
export function AboutIntro() {
  return (
    <section aria-label="Sobre el estudio" className="mx-auto max-w-6xl px-2 py-16 text-center md:py-28">
      <p data-reveal className="text-pretty font-sans text-[clamp(1.6rem,3.5vw,3.25rem)] leading-[1.1] tracking-tight">
        <span className="font-semibold">Pandito hace stickers</span>
        <span className="font-normal"> para quienes no tienen miedo de llamar la atención. Bien pensados, bien hechos y con una idea que se queda pegada.</span>
      </p>
      <p data-reveal className="mx-auto mt-8 max-w-sm text-balance text-base leading-relaxed text-tinta/80 md:text-lg">
        Sin humo ni vueltas. Sin diseños de catálogo. Cada pieza la pienso, la trabajo y la curo yo.
      </p>
    </section>
  )
}
