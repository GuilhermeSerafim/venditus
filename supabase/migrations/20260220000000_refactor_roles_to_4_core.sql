-- Migration: 20260220000000_refactor_roles_to_4_core.sql
-- Description: Renames 'sdr' to 'comercial', 'somente_leitura' to 'auditor'. Maps existing 'cs' and 'social_selling' to 'comercial'. Valid roles will now strictly be: admin, comercial, financeiro, auditor.

-- 1. Map existing users with 'cs' or 'social_selling' down to 'sdr' (which will be renamed to 'comercial').
-- We cast the enum to text to prevent 'invalid input value' errors if the enum values don't exist.
UPDATE public.user_roles 
SET role = 'sdr' 
WHERE role::text IN ('cs', 'social_selling');

-- 2. Rename the app_role enum values
ALTER TYPE public.app_role RENAME VALUE 'sdr' TO 'comercial';
ALTER TYPE public.app_role RENAME VALUE 'somente_leitura' TO 'auditor';

-- Note: Postgres does not natively support dropping enum values. 
-- The 'cs' and 'social_selling' enum values will remain in the database schema but will be considered legacy and unused by the application logic.

-- 3. Confirm the intended target roles in the app_role enum:
-- 'admin'
-- 'comercial' (formerly 'sdr' and 'comercial')
-- 'financeiro'
-- 'auditor' (formerly 'somente_leitura')
-- 'social_selling' (deprecated)
-- 'cs' (deprecated)
