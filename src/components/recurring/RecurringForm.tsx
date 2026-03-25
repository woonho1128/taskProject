import { useState, useEffect } from 'react'
import type { RecurringTask, TaskPriority, RecurrencePattern, System } from '../../types'
import { PRIORITY_CONFIG } from '../../types'
import { todayStr } from '../../utils/date'

interface Props {
  open: boolean
  recurring?: RecurringTask | null
  systems: System[]
  onSubmit: (data: RecurringFormData) => void
  onClose: () => void
}

export interface RecurringFormData {
  title: string
  description: string
  system_id: string | null
  priority: TaskPriority
  pattern: RecurrencePattern
  day_of_week: number | null
  day_of_month: number | null
  next_create_at: string
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export function RecurringForm({ open, recurring, systems, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<RecurringFormData>({
    title: '',
    description: '',
    system_id: null,
    priority: 'normal',
    pattern: 'weekly',
    day_of_week: 1,
    day_of_month: 1,
    next_create_at: todayStr(),
  })

  useEffect(() => {
    if (recurring) {
      setForm({
        title: recurring.title,
        description: recurring.description,
        system_id: recurring.system_id,
        priority: recurring.priority,
        pattern: recurring.pattern,
        day_of_week: recurring.day_of_week,
        day_of_month: recurring.day_of_month,
        next_create_at: recurring.next_create_at,
      })
    } else {
      setForm({
        title: '',
        description: '',
        system_id: null,
        priority: 'normal',
        pattern: 'weekly',
        day_of_week: 1,
        day_of_month: 1,
        next_create_at: todayStr(),
      })
    }
  }, [recurring, open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {recurring ? '반복 태스크 수정' : '새 반복 태스크'}
            </h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 서버 정기 점검, 주간 배포"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시스템</label>
              <select
                value={form.system_id ?? ''}
                onChange={(e) => setForm({ ...form, system_id: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택 안 함</option>
                {systems.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Object.entries(PRIORITY_CONFIG) as [TaskPriority, { label: string }][]).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">반복 주기</label>
            <select
              value={form.pattern}
              onChange={(e) => setForm({ ...form, pattern: e.target.value as RecurrencePattern })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="biweekly">격주</option>
              <option value="monthly">매월</option>
            </select>
          </div>

          {(form.pattern === 'weekly' || form.pattern === 'biweekly') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">요일</label>
              <div className="flex gap-2">
                {DAYS.map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm({ ...form, day_of_week: i })}
                    className={`w-9 h-9 rounded-full text-xs font-medium ${
                      form.day_of_week === i
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {form.pattern === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
              <input
                type="number"
                min={1}
                max={31}
                value={form.day_of_month ?? 1}
                onChange={(e) => setForm({ ...form, day_of_month: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">첫 생성일</label>
            <input
              type="date"
              value={form.next_create_at}
              onChange={(e) => setForm({ ...form, next_create_at: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {recurring ? '수정' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
