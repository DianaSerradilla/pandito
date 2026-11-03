import { useToday } from './useToday'

// True only while there is an active HOY event with at least one piece. The nav shows the HOY link
// just then; the /hoy page itself stays reachable (its own empty and expired states, QR links).
export function useTodayAvailable(): boolean {
  const today = useToday()
  return today.status === 'ready' && today.event.status === 'active' && today.items.length > 0
}
