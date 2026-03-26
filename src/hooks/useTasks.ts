import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, TaskStatus, TaskPriority, TaskType, RelatedUrl } from '../types'

export interface CreateTaskInput {
  title: string
  description?: string
  system_id?: string | null
  priority?: TaskPriority
  status?: TaskStatus
  task_type?: TaskType | null
  due_date?: string | null
  due_time?: string | null
  position?: number
  related_urls?: RelatedUrl[]
  git_branch?: string | null
  server_path?: string | null
}

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('tasks')
      .select('*, system:systems(*)')
      .eq('user_id', userId)
      .order('position', { ascending: true })
    if (data) setTasks(data as unknown as Task[])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Realtime subscription
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, fetchTasks])

  const createTask = async (input: CreateTaskInput) => {
    if (!userId) return
    const { error } = await supabase.from('tasks').insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? '',
      system_id: input.system_id ?? null,
      priority: input.priority ?? 'normal',
      status: input.status ?? 'todo',
      task_type: input.task_type ?? null,
      due_date: input.due_date ?? null,
      due_time: input.due_time ?? null,
      position: input.position ?? Math.floor(Date.now() / 1000) % 2000000000,
      related_urls: input.related_urls ?? [],
      git_branch: input.git_branch ?? null,
      server_path: input.server_path ?? null,
    })
    if (!error) await fetchTasks()
    return { error }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id)
    if (!error) await fetchTasks()
    return { error }
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) await fetchTasks()
    return { error }
  }

  return { tasks, loading, createTask, updateTask, deleteTask, refetch: fetchTasks }
}
