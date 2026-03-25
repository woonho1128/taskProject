import { PRIORITY_CONFIG, type TaskPriority } from '../../types'

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color} ${config.bgColor}`}>
      {config.label}
    </span>
  )
}
