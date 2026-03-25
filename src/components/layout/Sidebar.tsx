import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: '대시보드', icon: '📊' },
  { to: '/kanban', label: '칸반보드', icon: '📋' },
  { to: '/triage', label: '이슈 분류', icon: '🏷️' },
  { to: '/calendar', label: '캘린더', icon: '📅' },
  { to: '/systems', label: '시스템 관리', icon: '⚙️' },
  { to: '/recurring', label: '반복 태스크', icon: '🔄' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 p-4 transition-transform
        lg:static lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <nav className="space-y-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
