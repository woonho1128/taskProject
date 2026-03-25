import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { useSystems } from '../../hooks/useSystems'
import { TaskCard } from '../tasks/TaskCard'
import { TaskForm, type TaskFormData } from '../tasks/TaskForm'
import { TaskDetailModal } from '../tasks/TaskDetailModal'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import { isOverdue, isToday, todayStr } from '../../utils/date'
import type { Task } from '../../types'
import { TASK_TYPE_CONFIG, TIME_SPENT_CONFIG } from '../../types'
import type { TaskType, TimeSpent } from '../../types'

export function DashboardPage() {
  const { user } = useAuth()
  const { tasks, createTask, updateTask, deleteTask } = useTasks(user?.id)
  const { systems } = useSystems(user?.id)

  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const activeTasks = tasks.filter(t => t.status !== 'done')
  const overdueTasks = activeTasks.filter(t => t.due_date && isOverdue(t.due_date))
  const staleTasks = activeTasks.filter(t => t.stale_notified)
  const todayTasks = activeTasks.filter(t => t.due_date && isToday(t.due_date))
  const upcomingTasks = activeTasks.filter(t => {
    if (!t.due_date) return false
    const d = new Date(t.due_date + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekLater = new Date(today)
    weekLater.setDate(weekLater.getDate() + 7)
    return d > today && d <= weekLater
  })
  const noDueTasks = activeTasks.filter(t => !t.due_date)

  // Time spent stats
  const doneTasks = tasks.filter(t => t.status === 'done' && t.time_spent)
  const timeByType: Record<string, Record<TimeSpent, number>> = {}
  doneTasks.forEach(t => {
    const typeKey = t.task_type ?? '_none'
    if (!timeByType[typeKey]) timeByType[typeKey] = { under_1h: 0, half_day: 0, over_1day: 0, over_3days: 0 }
    timeByType[typeKey][t.time_spent!]++
  })

  const handleSubmit = async (data: TaskFormData) => {
    if (editingTask) {
      await updateTask(editingTask.id, data)
    } else {
      await createTask({ ...data, due_date: data.due_date || todayStr() })
    }
    setShowForm(false)
    setEditingTask(null)
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTask(deleteId)
      setDeleteId(null)
      setDetailTask(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true) }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + 새 태스크
        </button>
      </div>

      {/* Stale Tasks Banner */}
      {staleTasks.length > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <h2 className="text-sm font-bold text-orange-700 mb-3">방치된 업무 ({staleTasks.length}) - 3일 이상 업데이트 없음</h2>
          <div className="space-y-2">
            {staleTasks.map(task => (
              <TaskCard key={task.id} task={task} onClick={() => setDetailTask(task)} />
            ))}
          </div>
        </div>
      )}

      {/* Overdue Alert */}
      {overdueTasks.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-sm font-bold text-red-700 mb-3">지연된 태스크 ({overdueTasks.length})</h2>
          <div className="space-y-2">
            {overdueTasks.map(task => (
              <TaskCard key={task.id} task={task} onClick={() => setDetailTask(task)} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">오늘 할 일 ({todayTasks.length})</h2>
          {todayTasks.length === 0 ? (
            <EmptyState icon="✅" title="오늘 할 일이 없습니다" />
          ) : (
            <div className="space-y-2">
              {todayTasks.map(task => (
                <TaskCard key={task.id} task={task} onClick={() => setDetailTask(task)} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">다가오는 마감 ({upcomingTasks.length})</h2>
          {upcomingTasks.length === 0 ? (
            <EmptyState icon="📅" title="7일 내 마감 태스크 없음" />
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map(task => (
                <TaskCard key={task.id} task={task} onClick={() => setDetailTask(task)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* No due date */}
      {noDueTasks.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">마감일 미지정 ({noDueTasks.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {noDueTasks.map(task => (
              <TaskCard key={task.id} task={task} onClick={() => setDetailTask(task)} />
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: '전체 진행 중', count: activeTasks.length, color: 'bg-blue-50 text-blue-700' },
          { label: '지연', count: overdueTasks.length, color: 'bg-red-50 text-red-700' },
          { label: '방치', count: staleTasks.length, color: 'bg-orange-50 text-orange-700' },
          { label: '완료', count: tasks.filter(t => t.status === 'done').length, color: 'bg-green-50 text-green-700' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            <div className="text-2xl font-bold">{stat.count}</div>
            <div className="text-xs font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Time Spent Stats */}
      {doneTasks.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">소요 시간 통계 (완료된 태스크)</h2>
          <div className="space-y-3">
            {Object.entries(timeByType).map(([typeKey, counts]) => {
              const total = Object.values(counts).reduce((a, b) => a + b, 0)
              const typeLabel = typeKey === '_none' ? '미분류' : TASK_TYPE_CONFIG[typeKey as TaskType]?.label ?? typeKey
              return (
                <div key={typeKey}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{typeLabel}</span>
                    <span className="text-gray-500">{total}건</span>
                  </div>
                  <div className="flex h-5 rounded overflow-hidden bg-gray-100">
                    {(Object.entries(counts) as [TimeSpent, number][]).map(([ts, count]) => {
                      if (count === 0) return null
                      const pct = (count / total) * 100
                      const colors: Record<TimeSpent, string> = {
                        under_1h: 'bg-green-400',
                        half_day: 'bg-blue-400',
                        over_1day: 'bg-yellow-400',
                        over_3days: 'bg-red-400',
                      }
                      return (
                        <div
                          key={ts}
                          className={`${colors[ts]} flex items-center justify-center text-[10px] text-white font-medium`}
                          style={{ width: `${pct}%` }}
                          title={`${TIME_SPENT_CONFIG[ts].label}: ${count}건`}
                        >
                          {pct > 15 ? TIME_SPENT_CONFIG[ts].label : ''}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            <div className="flex items-center gap-4 text-[10px] text-gray-500 mt-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-400"></span>1시간 이내</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-400"></span>반나절</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-400"></span>1일 이상</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-400"></span>3일 이상</span>
            </div>
          </div>
        </div>
      )}

      <TaskForm
        open={showForm}
        task={editingTask}
        systems={systems}
        onSubmit={handleSubmit}
        onClose={() => { setShowForm(false); setEditingTask(null) }}
      />

      <TaskDetailModal
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onEdit={() => {
          setEditingTask(detailTask)
          setDetailTask(null)
          setShowForm(true)
        }}
        onDelete={() => {
          setDeleteId(detailTask?.id ?? null)
          setDetailTask(null)
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="태스크 삭제"
        message="이 태스크를 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
