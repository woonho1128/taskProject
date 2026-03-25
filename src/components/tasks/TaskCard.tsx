import type { Task } from '../../types'
import { PriorityBadge } from '../ui/PriorityBadge'
import { TaskTypeBadge } from '../ui/TaskTypeBadge'
import { SystemTag } from '../ui/SystemTag'
import { getDDay, isOverdue } from '../../utils/date'

interface Props {
  task: Task
  onClick: () => void
  dragHandleProps?: object
}

export function TaskCard({ task, onClick, dragHandleProps }: Props) {
  const overdue = task.due_date && task.status !== 'done' && isOverdue(task.due_date)
  const hasLinks = (task.related_urls?.length > 0) || task.git_branch || task.server_path

  return (
    <div
      onClick={onClick}
      {...dragHandleProps}
      className={`bg-white rounded-lg border p-3 cursor-pointer hover:shadow-sm transition-shadow ${
        overdue ? 'border-red-300 bg-red-50/50' : task.stale_notified ? 'border-orange-300 bg-orange-50/50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</h4>
        <div className="flex items-center gap-1 shrink-0">
          {hasLinks && <span className="text-xs" title="관련 링크 있음">🔗</span>}
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {task.task_type && <TaskTypeBadge type={task.task_type} />}
        {task.system && <SystemTag system={task.system} />}
        {task.due_date && (
          <span className={`text-xs font-medium ${
            overdue ? 'text-red-600' : 'text-gray-500'
          }`}>
            {getDDay(task.due_date)}
          </span>
        )}
        {task.stale_notified && task.status !== 'done' && (
          <span className="text-xs text-orange-600 font-medium">방치됨</span>
        )}
      </div>
    </div>
  )
}
