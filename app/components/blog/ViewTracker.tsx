'use client'
// ─── components/blog/ViewTracker.tsx ─────────────────────────────────────────
// Invisible Client Component — fires the view-count API once per session per post.
// Renders nothing.

import { useEffect } from 'react'

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`
    if (sessionStorage.getItem(key)) return

    fetch(`/api/blog/${slug}/view`, { method: 'POST' })
      .then(() => sessionStorage.setItem(key, '1'))
      .catch(() => { /* silently ignore — never block UX */ })
  }, [slug])

  return null
}
