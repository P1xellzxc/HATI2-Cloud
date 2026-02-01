-- Fix: Allow paid_by (user_id) to be null so Placeholders can pay
ALTER TABLE public.expenses ALTER COLUMN paid_by DROP NOT NULL;
