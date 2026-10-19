import { Pando } from '../../components/pando/Pando'

// Pando in the hero (REQ-WEB-HOME-003), following the approved composition: big, on the LEFT,
// cropped by the section edge so only the head, beanie and raised hand show. Decorative.
// On mobile the head peeks from the bottom edge below the call to action. In both cases the
// promise line and the call to action stay readable (Pando must not cover them).
// Only his eyes move (useHeroMotion); the rest stays still. The black outline is one merged shape,
// so arm, fingers and legs could not move on their own anyway until the layered file arrives.
export function PandoBehind() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Pando className="absolute bottom-[-250px] left-[-12%] h-[460px] w-auto max-w-none md:bottom-auto md:left-0 md:top-[2%] md:h-[145%]" />
    </div>
  )
}
