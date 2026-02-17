
-- Add FK on logs.user_id with CASCADE delete
ALTER TABLE public.logs
  DROP CONSTRAINT IF EXISTS logs_user_id_fkey,
  ADD CONSTRAINT logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add FK on movements.created_by with SET NULL
ALTER TABLE public.movements
  DROP CONSTRAINT IF EXISTS movements_created_by_fkey,
  ADD CONSTRAINT movements_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add FK on profiles.id with CASCADE delete
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
