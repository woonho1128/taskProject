import { useState } from 'react'
import type { Task } from '../../types'
import { PriorityBadge } from '../ui/PriorityBadge'
import { StatusBadge } from '../ui/StatusBadge'
import { TaskTypeBadge } from '../ui/TaskTypeBadge'
import { SystemTag } from '../ui/SystemTag'
import { TIME_SPENT_CONFIG } from '../../types'
import { formatDate, getDDay } from '../../utils/date'

interface Props {
  task: Task | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export function TaskDetailModal({ task, onClose, onEdit, onDelete }: Props) {
  const [copied, setCopied] = useState<string | null>(null)

  if (!task) return null

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
                {task.task_type && <TaskTypeBadge type={task.task_type} />}
                {task.system && <SystemTag system={task.system} />}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2">✕</button>
          </div>

          {task.description && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">설명</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {task.due_date && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">마감일</h3>
              <p className="text-sm text-gray-600">
                {formatDate(task.due_date)} {task.due_time && `${task.due_time}`}
                <span className="ml-2 font-medium">{getDDay(task.due_date)}</span>
              </p>
            </div>
          )}

          {task.time_spent && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">소요 시간</h3>
              <p className="text-sm text-gray-600">{TIME_SPENT_CONFIG[task.time_spent].label}</p>
            </div>
          )}

          {/* Deep Linking */}
          {(task.git_branch || task.server_path || (task.related_urls?.length > 0)) && (
            <div className="mb-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-700">컨텍스트 링크</h3>

              {task.git_branch && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-16 shrink-0">브랜치</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">{task.git_branch}</code>
                  <button
                    onClick={() => copyToClipboard(task.git_branch!, 'branch')}
                    className="text-xs text-blue-600 hover:text-blue-800 shrink-0"
                  >
                    {copied === 'branch' ? '복사됨' : '복사'}
                  </button>
                </div>
              )}

              {task.server_path && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-16 shrink-0">서버</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">{task.server_path}</code>
                  <button
                    onClick={() => copyToClipboard(task.server_path!, 'path')}
                    className="text-xs text-blue-600 hover:text-blue-800 shrink-0"
                  >
                    {copied === 'path' ? '복사됨' : '복사'}
                  </button>
                </div>
              )}

              {task.related_urls?.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-16 shrink-0">{link.label || '링크'}</span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline truncate flex-1"
                  >
                    {link.url}
                  </a>
                </div>
              ))}
            </div>
          )}

          {task.stale_notified && task.status !== 'done' && (
            <div className="mb-4 p-2 bg-orange-50 rounded-lg">
              <p className="text-xs text-orange-700 font-medium">3일 이상 업데이트 없는 방치된 업무입니다</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onDelete}
              className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
            >
              삭제
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              수정
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
