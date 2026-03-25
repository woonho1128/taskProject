import type { Task, TaskStatus } from '../types'

const POSITION_GAP = 1000

export function getNewPosition(tasks: Task[]): number {
  if (tasks.length === 0) return POSITION_GAP
  return Math.max(...tasks.map(t => t.position)) + POSITION_GAP
}

export function getInsertPosition(tasks: Task[], destIndex: number): number {
  if (tasks.length === 0) return POSITION_GAP
  if (destIndex === 0) return tasks[0].position / 2
  if (destIndex >= tasks.length) return tasks[tasks.length - 1].position + POSITION_GAP

  const before = tasks[destIndex - 1].position
  const after = tasks[destIndex].position
  return (before + after) / 2
}

export function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const groups: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
    hold: [],
  }
  for (const task of tasks) {
    groups[task.status].push(task)
  }
  for (const status of Object.keys(groups) as TaskStatus[]) {
    groups[status].sort((a, b) => a.position - b.position)
  }
  return groups
}
