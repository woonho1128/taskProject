import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

interface Notification {
  id: string
  taskTitle: string
  type: string
  createdAt: Date
  read: boolean
}

interface Props {
  onMenuClick: () => void
  notifications: Notification[]
  unreadCount: number
  onMarkRead: (id: string) => void
}

export function Header({ onMenuClick, notifications, unreadCount, onMarkRead }: Props) {
  const { user, signOut } = useAuth()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      <button onClick={onMenuClick} className="lg:hidden text-gray-600 hover:text-gray-900">
        ☰
      </button>
      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 text-gray-500 hover:text-gray-700"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
              <div className="p-3 border-b border-gray-100 font-medium text-sm text-gray-900">알림</div>
              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">알림이 없습니다</div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => onMarkRead(n.id)}
                    className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${
                      !n.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${
                        n.type === 'D-Day' ? 'text-red-600' : n.type === 'D-1' ? 'text-orange-600' : n.type === 'stale' ? 'text-orange-700' : 'text-yellow-600'
                      }`}>
                        {n.type === 'stale' ? '방치' : n.type}
                      </span>
                      <span className="text-sm text-gray-900 truncate">{n.taskTitle}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
              {user?.email?.[0].toUpperCase()}
            </span>
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-100 text-xs text-gray-500 truncate">
                {user?.email}
              </div>
              <button
                onClick={signOut}
                className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
