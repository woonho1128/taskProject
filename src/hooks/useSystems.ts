import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { System, SystemCategory } from '../types'

export function useSystems(userId: string | undefined) {
  const [systems, setSystems] = useState<System[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSystems = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('systems')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (data) setSystems(data as System[])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchSystems()
  }, [fetchSystems])

  const createSystem = async (name: string, category: SystemCategory, color: string) => {
    if (!userId) return
    const { error } = await supabase.from('systems').insert({
      user_id: userId,
      name,
      category,
      color,
    })
    if (!error) await fetchSystems()
    return { error }
  }

  const updateSystem = async (id: string, updates: Partial<Pick<System, 'name' | 'category' | 'color'>>) => {
    const { error } = await supabase.from('systems').update(updates).eq('id', id)
    if (!error) await fetchSystems()
    return { error }
  }

  const deleteSystem = async (id: string) => {
    const { error } = await supabase.from('systems').delete().eq('id', id)
    if (!error) await fetchSystems()
    return { error }
  }

  return { systems, loading, createSystem, updateSystem, deleteSystem, refetch: fetchSystems }
}
