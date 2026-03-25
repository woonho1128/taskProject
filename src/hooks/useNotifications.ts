import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task } from '../types'

interface Notification {
  id: string
  taskTitle: string
  type: 'D-3' | 'D-1' | 'D-Day' | 'stale'
  createdAt: Date
  read: boolean
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  const showBrowserNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/vite.svg' })
    }
  }, [])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('notification-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const task = payload.new as Task
        const old = payload.old as Partial<Task>

        if (task.notified_d3 && !old.notified_d3) {
          const notif: Notification = {
            id: `${task.id}-d3`,
            taskTitle: task.title,
            type: 'D-3',
            createdAt: new Date(),
            read: false,
          }
          setNotifications(prev => [notif, ...prev])
          showBrowserNotification('D-3 마감 임박', `"${task.title}" 마감 3일 전입니다`)
        }
        if (task.notified_d1 && !old.notified_d1) {
          const notif: Notification = {
            id: `${task.id}-d1`,
            taskTitle: task.title,
            type: 'D-1',
            createdAt: new Date(),
            read: false,
          }
          setNotifications(prev => [notif, ...prev])
          showBrowserNotification('D-1 마감 임박', `"${task.title}" 마감 내일입니다!`)
        }
        if (task.notified_d0 && !old.notified_d0) {
          const notif: Notification = {
            id: `${task.id}-d0`,
            taskTitle: task.title,
            type: 'D-Day',
            createdAt: new Date(),
            read: false,
          }
          setNotifications(prev => [notif, ...prev])
          showBrowserNotification('D-Day!', `"${task.title}" 오늘이 마감입니다!`)
        }
        if (task.stale_notified && !old.stale_notified) {
          const notif: Notification = {
            id: `${task.id}-stale`,
            taskTitle: task.title,
            type: 'stale',
            createdAt: new Date(),
            read: false,
          }
          setNotifications(prev => [notif, ...prev])
          showBrowserNotification('방치된 업무', `"${task.title}" 3일 이상 업데이트 없음`)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, showBrowserNotification])

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, unreadCount, markAsRead }
}
