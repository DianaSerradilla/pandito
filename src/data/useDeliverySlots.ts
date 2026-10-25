import { useSearchParams } from 'react-router'
import { deliverySlots, type DeliverySlot } from './publicCatalog'

// REQ-WEB-CART-004. The delivery windows the cart offers: only the public, active ones. Today they
// are local; later they come from Supabase (the panel turns them on and off). In development only,
// `?franjas=ninguna` shows the cart as it is when there are none, so that state can be tested.
export function useDeliverySlots(): DeliverySlot[] {
  const [params] = useSearchParams()
  return import.meta.env.DEV && params.get('franjas') === 'ninguna' ? [] : deliverySlots
}
