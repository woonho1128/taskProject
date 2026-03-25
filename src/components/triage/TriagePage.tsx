import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { useSystems } from '../../hooks/useSystems'
import { TaskCard } from '../tasks/TaskCard'
import { TaskForm, type TaskFormData } from '../tasks/TaskForm'
import { TaskDetailModal } from '../tasks/TaskDetailModal'
import { TimeSpentModal } from '../tasks/TimeSpentModal'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import type { Task, TaskType, TaskPriority, TaskStatus, TimeSpent } from '../../types'
import { TASK_TYPE_CONFIG, PRIORITY_CONFIG, STATUS_CONFIG } from '../../types'

export function TriagePage() {
  const { user } = useAuth()
  const { tasks, createTask, updateTask, deleteTask } = useTasks(user?.id)
  const { systems } = useSystems(user?.id)

  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pendingDone, setPendingDone] = useState<Task | null>(null)

  // Filters
  const [filterType, setFilterType] = useState<TaskType | ''>('')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('')

  const activeTasks = tasks.filter(t => t.status !== 'done')

  const filteredTasks = activeTasks.filter(t => {
    if (filterType && t.task_type !== filterType) return false
    if (filterPriority && t.priority !== filterPriority) return false
    if (filterStatus && t.status !== filterStatus) return false
    return true
  })

  // Group by task_type
  const typeOrder: (TaskType | '_none')[] = ['urgent_issue', 'maintenance', 'new_development', 'simple_inquiry', '_none']
  const grouped: Record<string, Task[]> = {}
  typeOrder.forEach(t => { grouped[t] = [] })
  filteredTasks.forEach(t => {
    const key = t.task_type ?? '_none'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(t)
  })
  // Sort each group by priority
  const priorityOrder: TaskPriority[] = ['urgent', 'high', 'normal', 'low']
  Object.values(grouped).forEach(arr => {
    arr.sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority))
  })

  const clearFilters = () => {
    setFilterType('')
    setFilterPriority('')
    setFilterStatus('')
  }

  const handleSubmit = async (data: TaskFormData) => {
    if (editingTask) {
      // Intercept status change to done
      if (data.status === 'done' && editingTask.status !== 'done') {
        setPendingDone({ ...editingTask, ...data } as Task)
        setShowForm(false)
        setEditingTask(null)
        return
      }
      await updateTask(editingTask.id, data)
    } else {
      await createTask(data)
    }
    setShowForm(false)
    setEditingTask(null)
  }

  const handleTimeSpent = async (timeSpent: TimeSpent) => {
    if (pendingDone) {
      await updateTask(pendingDone.id, {
        status: 'done' as TaskStatus,
        time_spent: timeSpent,
      })
      setPendingDone(null)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">이슈 분류</h1>
          <p className="text-sm text-gray-500 mt-1">유형별로 업무를 분류하고 우선순위에 따라 처리합니다</p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true) }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + 새 태스크
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterType}
            onChange={e => setFilterType((e.target.value || '') as TaskType | '')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">모든 유형</option>
            {(Object.entries(TASK_TYPE_CONFIG) as [TaskType, { label: string }][]).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority((e.target.value || '') as TaskPriority | '')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">모든 우선순위</option>
            {(Object.entries(PRIORITY_CONFIG) as [TaskPriority, { label: string }][]).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus((e.target.value || '') as TaskStatus | '')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">모든 상태</option>
            {(Object.entries(STATUS_CONFIG) as [TaskStatus, { label: string }][]).filter(([k]) => k !== 'done').map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>

          {(filterType || filterPriority || filterStatus) && (
            <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700">
              필터 초기화
            </button>
          )}

          <div className="ml-auto">
            <span className="text-xs text-gray-400">{filteredTasks.length}건</span>
          </div>
        </div>
      </div>

      {/* Grouped Tasks */}
      {filteredTasks.length === 0 ? (
        <EmptyState icon="🏷️" title="해당 조건의 태스크가 없습니다" />
      ) : (
        <div className="space-y-6">
          {typeOrder.map(typeKey => {
            const group = grouped[typeKey]
            if (!group || group.length === 0) return null
            const label = typeKey === '_none' ? '미분류' : TASK_TYPE_CONFIG[typeKey as TaskType].label
            const config = typeKey !== '_none' ? TASK_TYPE_CONFIG[typeKey as TaskType] : null
            return (
              <div key={typeKey}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                    config ? `${config.color} ${config.bgColor}` : 'text-gray-600 bg-gray-100'
                  }`}>
                    {label}
                  </span>
                  <span className="text-xs text-gray-400">{group.length}건</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {group.map(task => (
                    <TaskCard key={task.id} task={task} onClick={() => setDetailTask(task)} />
                  ))}
                </div>
              </div>
            )
          })}
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

      <TimeSpentModal
        open={!!pendingDone}
        onConfirm={handleTimeSpent}
        onClose={() => {
          if (pendingDone) {
            updateTask(pendingDone.id, { status: 'done' as TaskStatus })
            setPendingDone(null)
          }
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
