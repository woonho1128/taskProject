import type { TaskType } from '../../types'
import { TASK_TYPE_CONFIG } from '../../types'

interface Props {
  type: TaskType
}

export function TaskTypeBadge({ type }: Props) {
  const config = TASK_TYPE_CONFIG[type]
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${config.color} ${config.bgColor}`}>
      {config.label}
    </span>
  )
}
