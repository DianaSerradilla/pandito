import { ClosingSection } from './home/ClosingSection'
import { FeaturedSection } from './home/FeaturedSection'
import { HeroSection } from './home/HeroSection'
import { HowToBuySection } from './home/HowToBuySection'
import { ManifestoSection } from './home/ManifestoSection'
import { TapeDivider } from './home/TapeDivider'

// REQ-WEB-HOME-001: the five approved blocks, in this order. Do not add sections without a task.
// The tape between the hero and the Manifiesto is a decorative divider, not a section.
export function HomePage() {
  return (
    <>
      <HeroSection />
      <TapeDivider />
      <ManifestoSection />
      <FeaturedSection />
      <HowToBuySection />
      <ClosingSection />
    </>
  )
}
