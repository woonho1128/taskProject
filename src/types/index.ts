export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'hold'
export type TaskType = 'new_development' | 'maintenance' | 'simple_inquiry' | 'urgent_issue'
export type TimeSpent = 'under_1h' | 'half_day' | 'over_1day' | 'over_3days'
export type RecurrencePattern = 'daily' | 'weekly' | 'biweekly' | 'monthly'
export type SystemCategory = 'maintenance' | 'development'

export interface RelatedUrl {
  label: string
  url: string
}

export interface System {
  id: string
  user_id: string
  name: string
  category: SystemCategory
  color: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  system_id: string | null
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  task_type: TaskType | null
  due_date: string | null
  due_time: string | null
  position: number
  recurring_task_id: string | null
  notified_d3: boolean
  notified_d1: boolean
  notified_d0: boolean
  stale_notified: boolean
  related_urls: RelatedUrl[]
  git_branch: string | null
  server_path: string | null
  time_spent: TimeSpent | null
  created_at: string
  updated_at: string
  // joined
  system?: System
}

export interface RecurringTask {
  id: string
  user_id: string
  system_id: string | null
  title: string
  description: string
  priority: TaskPriority
  pattern: RecurrencePattern
  day_of_week: number | null
  day_of_month: number | null
  next_create_at: string
  is_active: boolean
  created_at: string
}

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  urgent: { label: '긴급', color: 'text-red-600', bgColor: 'bg-red-100' },
  high: { label: '높음', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  normal: { label: '보통', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  low: { label: '낮음', color: 'text-gray-600', bgColor: 'bg-gray-100' },
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  todo: { label: '할 일', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  in_progress: { label: '진행 중', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  done: { label: '완료', color: 'text-green-700', bgColor: 'bg-green-100' },
  hold: { label: '대기 중', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
}

export const TASK_TYPE_CONFIG: Record<TaskType, { label: string; color: string; bgColor: string }> = {
  new_development: { label: '신규개발', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  maintenance: { label: '유지보수', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  simple_inquiry: { label: '단순문의', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  urgent_issue: { label: '긴급장애', color: 'text-red-600', bgColor: 'bg-red-100' },
}

export const TIME_SPENT_CONFIG: Record<TimeSpent, { label: string }> = {
  under_1h: { label: '1시간 이내' },
  half_day: { label: '반나절' },
  over_1day: { label: '1일 이상' },
  over_3days: { label: '3일 이상' },
}
