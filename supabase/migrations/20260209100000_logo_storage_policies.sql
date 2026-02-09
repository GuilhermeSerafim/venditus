-- Migration: Logo Upload - Create Storage Bucket and RLS Policies
-- Description: Sets up Supabase Storage for organization logos with proper access control

-- Note: Storage buckets are typically created via Supabase Dashboard, not SQL
-- This file documents the required policies for the 'organization-logos' bucket

-- Prerequisites:
-- 1. Create bucket 'organization-logos' in Supabase Dashboard → Storage
-- 2. Set bucket to PUBLIC: true
-- 3. Set file size limit: 2097152 (2MB)
-- 4. Set allowed MIME types: image/png, image/jpeg, image/jpg, image/svg+xml

-- RLS Policies for storage.objects

-- 1. Allow authenticated users to upload logos to their organization folder
CREATE POLICY "Users can upload logos to their organization"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-logos' 
  AND (storage.foldername(name))[1] = (SELECT id::text FROM public.organizations WHERE id = public.get_auth_organization_id())
);

-- 2. Allow public read access to all logos
CREATE POLICY "Public logo access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'organization-logos');

-- 3. Allow org members to update their organization's logo
CREATE POLICY "Users can update their org logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'organization-logos'
  AND (storage.foldername(name))[1] = (SELECT id::text FROM public.organizations WHERE id = public.get_auth_organization_id())
);

-- 4. Allow org members to delete their organization's logo
CREATE POLICY "Users can delete their org logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-logos'
  AND (storage.foldername(name))[1] = (SELECT id::text FROM public.organizations WHERE id = public.get_auth_organization_id())
);
