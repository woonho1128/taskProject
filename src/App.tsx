import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './hooks/useAuth'
import { AuthForm } from './components/auth/AuthForm'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { KanbanPage } from './components/kanban/KanbanPage'
import { CalendarPage } from './components/calendar/CalendarPage'
import { SystemsPage } from './components/systems/SystemsPage'
import { RecurringPage } from './components/recurring/RecurringPage'
import { TriagePage } from './components/triage/TriagePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><AuthForm /></PublicRoute>} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="kanban" element={<KanbanPage />} />
            <Route path="triage" element={<TriagePage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="systems" element={<SystemsPage />} />
            <Route path="recurring" element={<RecurringPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
