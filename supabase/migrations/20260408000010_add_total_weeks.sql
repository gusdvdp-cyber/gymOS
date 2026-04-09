-- Add total_weeks to routines
ALTER TABLE public.routines
  ADD COLUMN total_weeks int CHECK (total_weeks > 0);
