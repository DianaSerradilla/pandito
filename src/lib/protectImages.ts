// Makes it harder to save catalog pictures by dragging them or using the context menu (REQ-PI-CATALOG-014).
// It only slows down casual copying: a public page can never be fully protected. Images marked with
// `data-saveable` (the free downloads) are left alone.
const isProtected = (target: EventTarget | null) =>
  target instanceof HTMLImageElement && !target.closest('[data-saveable]')

export function protectImages() {
  const block = (event: Event) => {
    if (isProtected(event.target)) event.preventDefault()
  }
  document.addEventListener('contextmenu', block)
  document.addEventListener('dragstart', block)
}
