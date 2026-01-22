-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  wallet_balance DECIMAL(18, 8) DEFAULT 1337.42,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add role column to profiles if it doesn't exist (in case table existed but col didn't)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- Create admin user function
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'Kaos55480@bitlanta.com') THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'Kaos55480@bitlanta.com',
      crypt('ilikepie87', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"display_name": "Kaos55480"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, email, display_name, role, wallet_balance)
    VALUES (
      new_user_id,
      'Kaos55480@bitlanta.com',
      'Kaos55480',
      'admin',
      999999.99
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', wallet_balance = 999999.99;
    
  ELSE
    -- Update existing user to be admin
    UPDATE public.profiles
    SET role = 'admin'
    WHERE email = 'Kaos55480@bitlanta.com';
  END IF;
END;
$$;

-- Execute the function to create the user
SELECT create_admin_user();

-- Drop the function after use
DROP FUNCTION create_admin_user();

-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Admin
-- Drop existing policies to avoid conflicts if re-running
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_delete_profiles" ON public.profiles;

-- Allow admins to read all profiles
CREATE POLICY "admins_read_all_profiles" ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  OR auth.uid() = id
);

-- Allow admins to update all profiles
CREATE POLICY "admins_update_all_profiles" ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  OR auth.uid() = id
);

-- Allow admins to delete users (if needed in profiles)
CREATE POLICY "admins_delete_profiles" ON public.profiles
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
