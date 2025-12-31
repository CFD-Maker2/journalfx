-- Add currency pair, take profit pips, and stop loss pips columns to journal_entries
ALTER TABLE public.journal_entries
ADD COLUMN currency_pair TEXT,
ADD COLUMN take_profit_pips NUMERIC,
ADD COLUMN stop_loss_pips NUMERIC;