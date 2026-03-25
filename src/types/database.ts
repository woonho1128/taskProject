export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      systems: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          color?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          system_id: string | null
          title: string
          description: string
          priority: string
          status: string
          due_date: string | null
          due_time: string | null
          position: number
          recurring_task_id: string | null
          notified_d3: boolean
          notified_d1: boolean
          notified_d0: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          system_id?: string | null
          title: string
          description?: string
          priority?: string
          status?: string
          due_date?: string | null
          due_time?: string | null
          position?: number
          recurring_task_id?: string | null
          notified_d3?: boolean
          notified_d1?: boolean
          notified_d0?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          system_id?: string | null
          title?: string
          description?: string
          priority?: string
          status?: string
          due_date?: string | null
          due_time?: string | null
          position?: number
          recurring_task_id?: string | null
          notified_d3?: boolean
          notified_d1?: boolean
          notified_d0?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recurring_tasks: {
        Row: {
          id: string
          user_id: string
          system_id: string | null
          title: string
          description: string
          priority: string
          pattern: string
          day_of_week: number | null
          day_of_month: number | null
          next_create_at: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          system_id?: string | null
          title: string
          description?: string
          priority?: string
          pattern: string
          day_of_week?: number | null
          day_of_month?: number | null
          next_create_at: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          system_id?: string | null
          title?: string
          description?: string
          priority?: string
          pattern?: string
          day_of_week?: number | null
          day_of_month?: number | null
          next_create_at?: string
          is_active?: boolean
          created_at?: string
        }
      }
    }
  }
}
