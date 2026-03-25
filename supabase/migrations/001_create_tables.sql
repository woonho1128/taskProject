-- ============================================
-- TaskFlow - Supabase DB Schema
-- Supabase SQL Editor에서 이 파일을 실행하세요
-- ============================================

-- 1. ENUM 타입 생성
CREATE TYPE task_priority AS ENUM ('urgent', 'high', 'normal', 'low');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'hold');
CREATE TYPE recurrence_pattern AS ENUM ('daily', 'weekly', 'biweekly', 'monthly');

-- 2. systems 테이블
CREATE TABLE public.systems (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        text NOT NULL,
  category    text NOT NULL DEFAULT 'maintenance',
  color       text NOT NULL DEFAULT '#3b82f6',
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own systems"
  ON public.systems FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. tasks 테이블
CREATE TABLE public.tasks (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  system_id       uuid REFERENCES public.systems(id) ON DELETE SET NULL,
  title           text NOT NULL,
  description     text DEFAULT '',
  priority        task_priority NOT NULL DEFAULT 'normal',
  status          task_status NOT NULL DEFAULT 'todo',
  due_date        date,
  due_time        time,
  position        integer NOT NULL DEFAULT 0,
  recurring_task_id uuid,
  notified_d3     boolean DEFAULT false,
  notified_d1     boolean DEFAULT false,
  notified_d0     boolean DEFAULT false,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tasks"
  ON public.tasks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_tasks_user_due ON public.tasks (user_id, due_date)
  WHERE status != 'done';

CREATE INDEX idx_tasks_user_status_pos ON public.tasks (user_id, status, position);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. recurring_tasks 테이블
CREATE TABLE public.recurring_tasks (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  system_id       uuid REFERENCES public.systems(id) ON DELETE SET NULL,
  title           text NOT NULL,
  description     text DEFAULT '',
  priority        task_priority NOT NULL DEFAULT 'normal',
  pattern         recurrence_pattern NOT NULL,
  day_of_week     smallint,
  day_of_month    smallint,
  next_create_at  date NOT NULL,
  is_active       boolean DEFAULT true NOT NULL,
  created_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.recurring_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own recurring tasks"
  ON public.recurring_tasks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
