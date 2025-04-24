import { db } from '@/lib/db'
import { requestNotificationPermission } from './notificationUtils'

// Function to mark a task as complete
export async function markTaskAsComplete(taskId: string) {
  try {
    await db.todos.update(taskId, {
      completed: true,
      completedAt: new Date(),
      updatedAt: new Date()
    })
    return true
  } catch (error) {
    console.error('Error marking task as complete:', error)
    return false
  }
}

// Function to check tasks and send notifications
export async function checkTasksForNotifications() {
  try {
    // Request notification permission if not already granted
    const permissionGranted = await requestNotificationPermission()
    if (!permissionGranted) return

    // Get all tasks from IndexedDB
    const tasks = await db.todos
      .filter(task => !task.completed && task.dueDate !== null)
      .toArray()

    const now = new Date()

    // Check each task
    for (const task of tasks) {
      const dueDate = new Date(task.dueDate!)
      const timeUntilDue = dueDate.getTime() - now.getTime()

      // Notify if task is due in the next hour
      if (timeUntilDue > 0 && timeUntilDue <= 60 * 60 * 1000) {
        // Send message to service worker to show notification
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: 'Task Due Soon',
            body: `Task "${task.title}" is due in ${Math.round(timeUntilDue / (60 * 1000))} minutes`,
            data: {
              taskId: task.id,
              taskTitle: task.title
            }
          })
        }
      }
    }
  } catch (error) {
    console.error('Error checking tasks for notifications:', error)
  }
}

// Initialize task notification checking
export function initializeTaskNotifications() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported')
    return
  }

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', async (event) => {
    if (event.data.type === 'CHECK_TASKS') {
      await checkTasksForNotifications()
    } else if (event.data.type === 'COMPLETE_TASK') {
      const success = await markTaskAsComplete(event.data.taskId)
      if (success) {
        // Recheck tasks after marking as complete
        await checkTasksForNotifications()
      }
    }
  })

  // Initial check
  checkTasksForNotifications()
} 