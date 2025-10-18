-- Create a new storage bucket for sidebar advertisements
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sidebar-ads',
  'sidebar-ads',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the sidebar-ads bucket
CREATE POLICY "Anyone can view sidebar ad files"
ON storage.objects FOR SELECT
USING (bucket_id = 'sidebar-ads');

CREATE POLICY "Admins can upload sidebar ad files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sidebar-ads' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update sidebar ad files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'sidebar-ads' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete sidebar ad files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'sidebar-ads' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
