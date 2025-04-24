/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope

// Extend NotificationOptions to include actions
interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: { action: string; title: string }[]
}

// Extend ServiceWorkerRegistration to include periodicSync
interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  periodicSync: {
    register: (tag: string, options: { minInterval: number }) => Promise<void>
  }
}

// Extend Event to include periodic sync properties
interface PeriodicSyncEvent extends ExtendableEvent {
  tag: string
}

// Clean up old caches
cleanupOutdatedCaches()

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST)

// Take control of all clients as soon as it activates
self.skipWaiting()
clientsClaim()

// Register periodic sync
async function registerPeriodicSync() {
  try {
    const registration = await self.registration as ExtendedServiceWorkerRegistration
    await registration.periodicSync.register('check-tasks', {
      minInterval: 10 * 60 * 1000 // 10 minutes
    })
  } catch (error) {
    console.error('Periodic sync registration failed:', error)
  }
}

// Handle periodic sync
self.addEventListener('periodicsync', (event: Event) => {
  const syncEvent = event as unknown as PeriodicSyncEvent
  if (syncEvent.tag === 'check-tasks') {
    syncEvent.waitUntil(checkTasks())
  }
})

// Function to check tasks and send notifications
async function checkTasks() {
  try {
    // Get all clients to access IndexedDB
    const clients = await self.clients.matchAll({ type: 'window' })
    if (clients.length === 0) return

    // Send message to client to check tasks
    clients.forEach(client => {
      client.postMessage({ type: 'CHECK_TASKS' })
    })
  } catch (error) {
    console.error('Error checking tasks:', error)
  }
}

// Handle messages from clients
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, data } = event.data
    const options: ExtendedNotificationOptions = {
      body,
      icon: '/web-app-manifest-192x192.png',
      badge: '/web-app-manifest-192x192.png',
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
        ...data
      },
      actions: [
        {
          action: 'complete',
          title: 'Mark as Complete'
        }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(title, options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  if (event.action === 'complete') {
    // Send message to client to mark task as complete
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          const client = clientList[0]
          client.postMessage({
            type: 'COMPLETE_TASK',
            taskId: event.notification.data.taskId
          })
          return client.focus()
        }
      })
    )
  } else {
    // Default click behavior
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          let client = clientList[0]
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i]
            }
          }
          return client.focus()
        }
        return self.clients.openWindow('/')
      })
    )
  }
})

// Register periodic sync when service worker activates
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(registerPeriodicSync())
}) 