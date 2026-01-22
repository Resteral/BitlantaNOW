-- Clean up the broken admin user to allow manual sign up
BEGIN;
  DELETE FROM public.profiles WHERE email = 'Kaos55480@bitlanta.com';
  DELETE FROM auth.users WHERE email = 'Kaos55480@bitlanta.com';
COMMIT;
