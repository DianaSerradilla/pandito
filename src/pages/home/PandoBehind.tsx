import { Pando } from '../../components/pando/Pando'

// Pando is decorative in the hero. On desktop he shifts toward the copy while preserving
// the intentional crop; on mobile he still peeks up from below the CTA.
export function PandoBehind() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Pando className="absolute bottom-[-250px] left-[-12%] h-[460px] w-auto max-w-none md:bottom-auto md:left-[7%] md:top-[2%] md:h-[145%]" />
    </div>
  )
}