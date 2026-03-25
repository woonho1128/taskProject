import { useState } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { useSystems } from '../../hooks/useSystems'
import { KanbanColumn } from './KanbanColumn'
import { TaskForm, type TaskFormData } from '../tasks/TaskForm'
import { TaskDetailModal } from '../tasks/TaskDetailModal'
import { TimeSpentModal } from '../tasks/TimeSpentModal'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { groupByStatus, getInsertPosition } from '../../utils/kanban'
import type { Task, TaskStatus, TimeSpent } from '../../types'

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'done', 'hold']

export function KanbanPage() {
  const { user } = useAuth()
  const { tasks, createTask, updateTask, deleteTask } = useTasks(user?.id)
  const { systems } = useSystems(user?.id)

  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Time spent modal state
  const [pendingDone, setPendingDone] = useState<{ id: string; position: number } | null>(null)

  const grouped = groupByStatus(tasks)

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const destStatus = destination.droppableId as TaskStatus
    const destTasks = grouped[destStatus].filter(t => t.id !== draggableId)
    const newPosition = getInsertPosition(destTasks, destination.index)

    const sourceStatus = source.droppableId as TaskStatus

    // Intercept drag to 'done' — show time spent modal
    if (destStatus === 'done' && sourceStatus !== 'done') {
      setPendingDone({ id: draggableId, position: newPosition })
      return
    }

    await updateTask(draggableId, {
      status: destStatus,
      position: newPosition,
    })
  }

  const handleTimeSpentConfirm = async (timeSpent: TimeSpent) => {
    if (pendingDone) {
      await updateTask(pendingDone.id, {
        status: 'done' as TaskStatus,
        position: pendingDone.position,
        time_spent: timeSpent,
      })
      setPendingDone(null)
    }
  }

  const handleSubmit = async (data: TaskFormData) => {
    if (editingTask) {
      await updateTask(editingTask.id, data)
    } else {
      await createTask(data)
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
        <h1 className="text-2xl font-bold text-gray-900">칸반보드</h1>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true) }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + 새 태스크
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={grouped[status]}
              onTaskClick={setDetailTask}
            />
          ))}
        </div>
      </DragDropContext>

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
        onConfirm={handleTimeSpentConfirm}
        onClose={() => {
          // 나중에 선택 — 시간 없이 완료 처리
          if (pendingDone) {
            updateTask(pendingDone.id, { status: 'done' as TaskStatus, position: pendingDone.position })
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
