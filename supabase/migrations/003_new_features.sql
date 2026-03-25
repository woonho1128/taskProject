-- ============================================
-- Feature 2: task_type (이슈 분류)
-- ============================================
CREATE TYPE task_type AS ENUM ('new_development', 'maintenance', 'simple_inquiry', 'urgent_issue');
ALTER TABLE public.tasks ADD COLUMN task_type task_type DEFAULT NULL;

-- ============================================
-- Feature 3: stale_notified (방치 업무 알림)
-- ============================================
ALTER TABLE public.tasks ADD COLUMN stale_notified boolean DEFAULT false;

-- 방치 업무 감지 함수
CREATE OR REPLACE FUNCTION check_stale_tasks()
RETURNS void AS $$
BEGIN
  UPDATE public.tasks
  SET stale_notified = true, updated_at = now()
  WHERE status IN ('in_progress', 'hold')
    AND stale_notified = false
    AND updated_at < now() - INTERVAL '3 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- stale_notified 리셋 트리거
CREATE OR REPLACE FUNCTION reset_stale_notified()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stale_notified = true AND NEW.stale_notified = true THEN
    IF NEW.title IS DISTINCT FROM OLD.title
       OR NEW.description IS DISTINCT FROM OLD.description
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.priority IS DISTINCT FROM OLD.priority
    THEN
      NEW.stale_notified = false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_reset_stale
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION reset_stale_notified();

-- ============================================
-- Feature 4: Deep Linking (컨텍스트 연결)
-- ============================================
ALTER TABLE public.tasks
  ADD COLUMN related_urls jsonb DEFAULT '[]',
  ADD COLUMN git_branch text DEFAULT NULL,
  ADD COLUMN server_path text DEFAULT NULL;

-- ============================================
-- Feature 5: time_spent (작업 시간 기록)
-- ============================================
CREATE TYPE time_spent_type AS ENUM ('under_1h', 'half_day', 'over_1day', 'over_3days');
ALTER TABLE public.tasks ADD COLUMN time_spent time_spent_type DEFAULT NULL;
