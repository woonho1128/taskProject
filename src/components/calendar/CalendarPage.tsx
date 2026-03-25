import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { useSystems } from '../../hooks/useSystems'
import { TaskForm, type TaskFormData } from '../tasks/TaskForm'
import { TaskDetailModal } from '../tasks/TaskDetailModal'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { PRIORITY_CONFIG } from '../../types'
import type { Task } from '../../types'

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  normal: '#3b82f6',
  low: '#6b7280',
}

export function CalendarPage() {
  const { user } = useAuth()
  const { tasks, createTask, updateTask, deleteTask } = useTasks(user?.id)
  const { systems } = useSystems(user?.id)

  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const events = tasks
    .filter(t => t.due_date)
    .map(t => ({
      id: t.id,
      title: `${PRIORITY_CONFIG[t.priority].label} ${t.title}`,
      start: t.due_date!,
      backgroundColor: PRIORITY_COLORS[t.priority],
      borderColor: PRIORITY_COLORS[t.priority],
      extendedProps: { task: t },
    }))

  const handleSubmit = async (data: TaskFormData) => {
    if (editingTask) {
      await updateTask(editingTask.id, data)
    } else {
      await createTask({ ...data, due_date: data.due_date || selectedDate })
    }
    setShowForm(false)
    setEditingTask(null)
    setSelectedDate(null)
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
        <h1 className="text-2xl font-bold text-gray-900">캘린더</h1>
        <button
          onClick={() => { setEditingTask(null); setSelectedDate(null); setShowForm(true) }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + 새 태스크
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          locale="ko"
          events={events}
          height="auto"
          dateClick={(info) => {
            setSelectedDate(info.dateStr)
            setEditingTask(null)
            setShowForm(true)
          }}
          eventClick={(info) => {
            const task = info.event.extendedProps.task as Task
            setDetailTask(task)
          }}
        />
      </div>

      <TaskForm
        open={showForm}
        task={editingTask ?? (selectedDate ? { due_date: selectedDate } as Task : null)}
        systems={systems}
        onSubmit={handleSubmit}
        onClose={() => { setShowForm(false); setEditingTask(null); setSelectedDate(null) }}
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
