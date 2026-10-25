import { useEffect } from 'react'

// REQ-WEB-QUALITY-002. Title, description and the Open Graph card of the page on screen. They are set
// on the document (not as hoisted tags) because index.html already has a base title, and the browser
// would keep reading the first one. The tags are created once and updated on each route.
export type PageMeta = {
  title: string
  description?: string
  /** A page that must stay out of search results (404, errors). */
  noindex?: boolean
}

const setTag = (attr: 'name' | 'property', key: string, content: string | undefined) => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (content === undefined) {
    tag?.remove()
    return
  }
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.content = content
}

export function usePageMeta({ title, description, noindex }: PageMeta) {
  useEffect(() => {
    document.title = title
    setTag('name', 'description', description)
    setTag('name', 'robots', noindex ? 'noindex' : undefined)
    setTag('property', 'og:type', 'website')
    setTag('property', 'og:site_name', 'Pandito')
    setTag('property', 'og:locale', 'es_AR')
    setTag('property', 'og:title', title)
    setTag('property', 'og:description', description)
    setTag('property', 'og:url', window.location.origin + window.location.pathname)
    // og:image is pending: the team has not delivered the social preview picture yet.
  }, [title, description, noindex])
}
