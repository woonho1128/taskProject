import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { RecurringTask, TaskPriority, RecurrencePattern } from '../types'

export interface CreateRecurringInput {
  title: string
  description?: string
  system_id?: string | null
  priority?: TaskPriority
  pattern: RecurrencePattern
  day_of_week?: number | null
  day_of_month?: number | null
  next_create_at: string
}

export function useRecurringTasks(userId: string | undefined) {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecurringTasks = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (data) setRecurringTasks(data as RecurringTask[])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchRecurringTasks()
  }, [fetchRecurringTasks])

  const createRecurring = async (input: CreateRecurringInput) => {
    if (!userId) return
    const { error } = await supabase.from('recurring_tasks').insert({
      user_id: userId,
      ...input,
    })
    if (!error) await fetchRecurringTasks()
    return { error }
  }

  const updateRecurring = async (id: string, updates: Partial<RecurringTask>) => {
    const { error } = await supabase.from('recurring_tasks').update(updates).eq('id', id)
    if (!error) await fetchRecurringTasks()
    return { error }
  }

  const deleteRecurring = async (id: string) => {
    const { error } = await supabase.from('recurring_tasks').delete().eq('id', id)
    if (!error) await fetchRecurringTasks()
    return { error }
  }

  return { recurringTasks, loading, createRecurring, updateRecurring, deleteRecurring }
}
