import { useState, useEffect } from 'react'
import type { System, SystemCategory } from '../../types'

interface Props {
  open: boolean
  system?: System | null
  onSubmit: (data: SystemFormData) => void
  onClose: () => void
}

export interface SystemFormData {
  name: string
  category: SystemCategory
  color: string
}

const COLORS = ['#3b82f6', '#ef4444', '#f97316', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b']

export function SystemForm({ open, system, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<SystemFormData>({
    name: '',
    category: 'maintenance',
    color: '#3b82f6',
  })

  useEffect(() => {
    if (system) {
      setForm({ name: system.name, category: system.category, color: system.color })
    } else {
      setForm({ name: '', category: 'maintenance', color: '#3b82f6' })
    }
  }, [system, open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {system ? '시스템 수정' : '새 시스템'}
            </h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시스템명 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 결제 API, 관리자 페이지"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">구분</label>
            <div className="flex gap-3">
              {(['maintenance', 'development'] as SystemCategory[]).map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={form.category === cat}
                    onChange={() => setForm({ ...form, category: cat })}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{cat === 'maintenance' ? '유지보수' : '신규개발'}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">색상</label>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    form.color === color ? 'border-gray-900 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
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
              {system ? '수정' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
