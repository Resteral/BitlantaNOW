-- Promote the user to admin
UPDATE public.profiles
SET role = 'admin', wallet_balance = 999999.99
WHERE email = 'Kaos55480@bitlanta.com';
