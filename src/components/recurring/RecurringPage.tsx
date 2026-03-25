import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRecurringTasks } from '../../hooks/useRecurringTasks'
import { useSystems } from '../../hooks/useSystems'
import { RecurringForm, type RecurringFormData } from './RecurringForm'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import { PriorityBadge } from '../ui/PriorityBadge'
import type { RecurringTask } from '../../types'

const PATTERN_LABELS: Record<string, string> = {
  daily: '매일',
  weekly: '매주',
  biweekly: '격주',
  monthly: '매월',
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export function RecurringPage() {
  const { user } = useAuth()
  const { recurringTasks, createRecurring, updateRecurring, deleteRecurring } = useRecurringTasks(user?.id)
  const { systems } = useSystems(user?.id)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<RecurringTask | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleSubmit = async (data: RecurringFormData) => {
    if (editing) {
      await updateRecurring(editing.id, data)
    } else {
      await createRecurring(data)
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteRecurring(deleteId)
      setDeleteId(null)
    }
  }

  const toggleActive = async (rt: RecurringTask) => {
    await updateRecurring(rt.id, { is_active: !rt.is_active })
  }

  const getScheduleText = (rt: RecurringTask) => {
    let text = PATTERN_LABELS[rt.pattern]
    if (rt.pattern === 'weekly' || rt.pattern === 'biweekly') {
      text += rt.day_of_week != null ? ` ${DAY_LABELS[rt.day_of_week]}요일` : ''
    }
    if (rt.pattern === 'monthly') {
      text += rt.day_of_month != null ? ` ${rt.day_of_month}일` : ''
    }
    return text
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">반복 태스크</h1>
          <p className="text-sm text-gray-500 mt-1">자동으로 생성되는 정기 업무를 관리합니다</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + 새 반복 태스크
        </button>
      </div>

      {recurringTasks.length === 0 ? (
        <EmptyState
          icon="🔄"
          title="등록된 반복 태스크가 없습니다"
          description="정기 점검, 배포 등 반복 업무를 등록해보세요"
          action={
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              반복 태스크 추가
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {recurringTasks.map(rt => {
            const system = systems.find(s => s.id === rt.system_id)
            return (
              <div
                key={rt.id}
                className={`bg-white rounded-xl border border-gray-200 p-4 ${
                  !rt.is_active ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{rt.title}</h3>
                      <PriorityBadge priority={rt.priority} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{getScheduleText(rt)}</span>
                      {system && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: system.color }}>
                          {system.name}
                        </span>
                      )}
                      <span>다음 생성: {rt.next_create_at}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleActive(rt)}
                      className={`text-xs px-2 py-1 rounded ${
                        rt.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {rt.is_active ? '활성' : '비활성'}
                    </button>
                    <button
                      onClick={() => { setEditing(rt); setShowForm(true) }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setDeleteId(rt.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <RecurringForm
        open={showForm}
        recurring={editing}
        systems={systems}
        onSubmit={handleSubmit}
        onClose={() => { setShowForm(false); setEditing(null) }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="반복 태스크 삭제"
        message="이 반복 태스크를 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
