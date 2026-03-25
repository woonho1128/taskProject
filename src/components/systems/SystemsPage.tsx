import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSystems } from '../../hooks/useSystems'
import { SystemForm, type SystemFormData } from './SystemForm'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import type { System } from '../../types'

export function SystemsPage() {
  const { user } = useAuth()
  const { systems, createSystem, updateSystem, deleteSystem } = useSystems(user?.id)

  const [showForm, setShowForm] = useState(false)
  const [editingSystem, setEditingSystem] = useState<System | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleSubmit = async (data: SystemFormData) => {
    if (editingSystem) {
      await updateSystem(editingSystem.id, data)
    } else {
      await createSystem(data.name, data.category, data.color)
    }
    setShowForm(false)
    setEditingSystem(null)
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSystem(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시스템 관리</h1>
          <p className="text-sm text-gray-500 mt-1">담당하는 시스템/프로젝트를 관리합니다</p>
        </div>
        <button
          onClick={() => { setEditingSystem(null); setShowForm(true) }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + 새 시스템
        </button>
      </div>

      {systems.length === 0 ? (
        <EmptyState
          icon="⚙️"
          title="등록된 시스템이 없습니다"
          description="담당하는 시스템을 추가해보세요"
          action={
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              시스템 추가
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systems.map(system => (
            <div
              key={system.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: system.color }} />
                <h3 className="font-medium text-gray-900">{system.name}</h3>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                system.category === 'maintenance'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {system.category === 'maintenance' ? '유지보수' : '신규개발'}
              </span>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => { setEditingSystem(system); setShowForm(true) }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  수정
                </button>
                <button
                  onClick={() => setDeleteId(system.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SystemForm
        open={showForm}
        system={editingSystem}
        onSubmit={handleSubmit}
        onClose={() => { setShowForm(false); setEditingSystem(null) }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="시스템 삭제"
        message="이 시스템을 삭제하시겠습니까? 관련 태스크의 시스템 연결이 해제됩니다."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
