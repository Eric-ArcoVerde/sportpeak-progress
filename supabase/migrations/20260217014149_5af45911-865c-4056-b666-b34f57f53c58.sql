
-- Make movements insert policy more specific: require created_by to match the user
DROP POLICY "Authenticated users can insert movements" ON public.movements;

CREATE POLICY "Authenticated users can insert movements"
  ON public.movements FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());
