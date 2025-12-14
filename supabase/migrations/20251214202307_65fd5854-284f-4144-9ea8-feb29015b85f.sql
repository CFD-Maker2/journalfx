-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create enum types
CREATE TYPE public.emotion_type AS ENUM (
  'confident', 'anxious', 'calm', 'stressed', 'excited', 
  'fearful', 'focused', 'frustrated', 'neutral'
);

CREATE TYPE public.trade_type AS ENUM (
  'long', 'short', 'scalp', 'swing', 'day'
);

CREATE TYPE public.market_condition AS ENUM (
  'trending', 'ranging', 'volatile', 'calm'
);

CREATE TYPE public.trade_outcome AS ENUM (
  'profit', 'loss', 'breakeven'
);

-- Create journal_entries table
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  emotion public.emotion_type NOT NULL DEFAULT 'neutral',
  emotion_intensity INTEGER NOT NULL DEFAULT 3 CHECK (emotion_intensity >= 1 AND emotion_intensity <= 5),
  confidence_level INTEGER NOT NULL DEFAULT 3 CHECK (confidence_level >= 1 AND confidence_level <= 5),
  trade_type public.trade_type,
  market_condition public.market_condition,
  pre_trade TEXT,
  during_trade TEXT,
  post_trade TEXT,
  tags TEXT[] DEFAULT '{}',
  outcome public.trade_outcome,
  profit_loss DECIMAL(10, 2),
  ai_insight TEXT,
  reflection_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Journal entries policies
CREATE POLICY "Users can view their own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create mood_logs table
CREATE TABLE public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  emotion public.emotion_type NOT NULL,
  intensity INTEGER NOT NULL DEFAULT 3 CHECK (intensity >= 1 AND intensity <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mood_logs
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- Mood logs policies
CREATE POLICY "Users can view their own mood logs"
  ON public.mood_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood logs"
  ON public.mood_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood logs"
  ON public.mood_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create reflection_responses table
CREATE TABLE public.reflection_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  category TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reflection_responses
ALTER TABLE public.reflection_responses ENABLE ROW LEVEL SECURITY;

-- Reflection responses policies
CREATE POLICY "Users can view their own reflections"
  ON public.reflection_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reflections"
  ON public.reflection_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name', NEW.email);
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();