// Public files (images, stickers, brand SVGs) live at the site root in the build. When the site is
// served from a subpath (GitHub Pages: /pandito/) the root moves, so every public URL is built from
// the base the build was made with. At a domain root the base is "/" and nothing changes.
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\/+/, '')
}
