/* Service worker: web push notifications only (no offline cache, so a new version of the site is always loaded). */
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('push', (e) => {
  let data = {}
  try {
    data = e.data ? e.data.json() : {}
  } catch {
    data = { title: 'Mes Problèmes', body: e.data ? e.data.text() : '' }
  }
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      // The app is open and visible: it already shows what happened, no notification.
      if (list.some((c) => c.visibilityState === 'visible')) return
      return self.registration.showNotification(data.title || 'Mes Problèmes', {
        body: data.body || '',
        tag: data.tag,
        renotify: true,
        icon: 'pwa/icon-192.png',
        badge: 'pwa/icon-192.png',
        data: { game: data.game || null },
      })
    }),
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const game = e.notification.data && e.notification.data.game
  const url = new URL(game ? `./?game=${game}` : './', self.registration.scope).href
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => c.url.startsWith(self.registration.scope))
      if (open) {
        if (game) open.postMessage({ type: 'open-game', id: game })
        return open.focus()
      }
      return self.clients.openWindow(url)
    }),
  )
})
