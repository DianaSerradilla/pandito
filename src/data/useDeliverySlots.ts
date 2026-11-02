import { useSearchParams } from 'react-router'
import { deliverySlots, isConnected, useCatalog, type DeliverySlot } from './publicCatalog'

// REQ-WEB-CART-004. The delivery windows the cart offers: only the public, active ones. Connected,
// they are read from Supabase with the catalog (the panel turns them on and off); without it they
// are the sample ones. In development only, `?franjas=ninguna` shows the cart as it is when there
// are none, so that state can be tested.
export function useDeliverySlots(): DeliverySlot[] {
  const [params] = useSearchParams()
  const catalog = useCatalog()
  if (import.meta.env.DEV && params.get('franjas') === 'ninguna') return []
  return isConnected ? catalog.slots : deliverySlots
}
