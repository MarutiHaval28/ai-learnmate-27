-- Fix the RLS policies - the previous policies referenced auth.uid() but we need proper policies for our custom users table
-- Since we're using a custom users table, we need to create proper authentication flow

-- First, let's create a profiles table that links to auth.users for Supabase authentication
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Update tests table to reference profiles instead
ALTER TABLE public.tests DROP CONSTRAINT tests_user_id_fkey;
ALTER TABLE public.tests ADD CONSTRAINT tests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update tests policies to work with auth.users
DROP POLICY "Users can view their own tests" ON public.tests;
DROP POLICY "Users can create their own tests" ON public.tests;
DROP POLICY "Users can update their own tests" ON public.tests;

CREATE POLICY "Users can view their own tests" 
ON public.tests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tests" 
ON public.tests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tests" 
ON public.tests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for profiles timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'Student'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();