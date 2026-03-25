import { useState, useEffect } from 'react'
import type { Task, TaskPriority, TaskStatus, TaskType, System, RelatedUrl } from '../../types'
import { PRIORITY_CONFIG, STATUS_CONFIG, TASK_TYPE_CONFIG } from '../../types'

interface Props {
  open: boolean
  task?: Task | null
  systems: System[]
  onSubmit: (data: TaskFormData) => void
  onClose: () => void
}

export interface TaskFormData {
  title: string
  description: string
  system_id: string | null
  priority: TaskPriority
  status: TaskStatus
  task_type: TaskType | null
  due_date: string | null
  due_time: string | null
  related_urls: RelatedUrl[]
  git_branch: string | null
  server_path: string | null
}

export function TaskForm({ open, task, systems, onSubmit, onClose }: Props) {
  const emptyForm: TaskFormData = {
    title: '',
    description: '',
    system_id: null,
    priority: 'normal',
    status: 'todo',
    task_type: null,
    due_date: null,
    due_time: null,
    related_urls: [],
    git_branch: null,
    server_path: null,
  }

  const [form, setForm] = useState<TaskFormData>(emptyForm)

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        system_id: task.system_id,
        priority: task.priority,
        status: task.status,
        task_type: task.task_type ?? null,
        due_date: task.due_date,
        due_time: task.due_time,
        related_urls: task.related_urls ?? [],
        git_branch: task.git_branch ?? null,
        server_path: task.server_path ?? null,
      })
    } else {
      setForm(emptyForm)
    }
  }, [task, open])

  const addUrl = () => setForm({ ...form, related_urls: [...form.related_urls, { label: '', url: '' }] })
  const removeUrl = (i: number) => setForm({ ...form, related_urls: form.related_urls.filter((_, idx) => idx !== i) })
  const updateUrl = (i: number, field: 'label' | 'url', value: string) => {
    const urls = [...form.related_urls]
    urls[i] = { ...urls[i], [field]: value }
    setForm({ ...form, related_urls: urls })
  }

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
              {task ? '태스크 수정' : '새 태스크'}
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
              <select
                value={form.task_type ?? ''}
                onChange={(e) => setForm({ ...form, task_type: (e.target.value || null) as TaskType | null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택 안 함</option>
                {(Object.entries(TASK_TYPE_CONFIG) as [TaskType, { label: string }][]).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Object.entries(STATUS_CONFIG) as [TaskStatus, { label: string }][]).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
              <input
                type="date"
                value={form.due_date ?? ''}
                onChange={(e) => setForm({ ...form, due_date: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">마감 시간</label>
              <input
                type="time"
                value={form.due_time ?? ''}
                onChange={(e) => setForm({ ...form, due_time: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Deep Linking */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Git 브랜치</label>
            <input
              type="text"
              value={form.git_branch ?? ''}
              onChange={(e) => setForm({ ...form, git_branch: e.target.value || null })}
              placeholder="예: feature/payment-fix"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">서버 경로</label>
            <input
              type="text"
              value={form.server_path ?? ''}
              onChange={(e) => setForm({ ...form, server_path: e.target.value || null })}
              placeholder="예: /home/app/api-server"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">관련 링크</label>
              <button type="button" onClick={addUrl} className="text-xs text-blue-600 hover:text-blue-800">+ 추가</button>
            </div>
            {form.related_urls.map((url, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={url.label}
                  onChange={(e) => updateUrl(i, 'label', e.target.value)}
                  placeholder="라벨"
                  className="w-1/3 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={url.url}
                  onChange={(e) => updateUrl(i, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => removeUrl(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
              </div>
            ))}
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
              {task ? '수정' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
