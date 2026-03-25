-- ============================================
-- pg_cron 함수 (선택사항 - Supabase Pro 플랜 필요)
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 반복 태스크 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_recurring_tasks()
RETURNS void AS $$
BEGIN
  INSERT INTO public.tasks (user_id, system_id, title, description, priority, status, due_date, recurring_task_id, position)
  SELECT
    rt.user_id,
    rt.system_id,
    rt.title,
    rt.description,
    rt.priority,
    'todo',
    rt.next_create_at,
    rt.id,
    extract(epoch from now())::integer
  FROM public.recurring_tasks rt
  WHERE rt.is_active = true
    AND rt.next_create_at <= CURRENT_DATE;

  UPDATE public.recurring_tasks SET next_create_at =
    CASE pattern
      WHEN 'daily'    THEN next_create_at + INTERVAL '1 day'
      WHEN 'weekly'   THEN next_create_at + INTERVAL '7 days'
      WHEN 'biweekly' THEN next_create_at + INTERVAL '14 days'
      WHEN 'monthly'  THEN next_create_at + INTERVAL '1 month'
    END
  WHERE is_active = true
    AND next_create_at <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 알림 플래그 갱신 함수
CREATE OR REPLACE FUNCTION check_due_notifications()
RETURNS void AS $$
BEGIN
  UPDATE public.tasks
  SET notified_d3 = true, updated_at = now()
  WHERE due_date = CURRENT_DATE + INTERVAL '3 days'
    AND notified_d3 = false AND status != 'done';

  UPDATE public.tasks
  SET notified_d1 = true, updated_at = now()
  WHERE due_date = CURRENT_DATE + INTERVAL '1 day'
    AND notified_d1 = false AND status != 'done';

  UPDATE public.tasks
  SET notified_d0 = true, updated_at = now()
  WHERE due_date = CURRENT_DATE
    AND notified_d0 = false AND status != 'done';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- pg_cron 스케줄 (Supabase 대시보드 > Database > Extensions에서 pg_cron 활성화 필요)
-- SELECT cron.schedule('generate-recurring-tasks', '5 15 * * *', 'SELECT generate_recurring_tasks()');
-- SELECT cron.schedule('check-due-notifications', '0 * * * *', 'SELECT check_due_notifications()');
