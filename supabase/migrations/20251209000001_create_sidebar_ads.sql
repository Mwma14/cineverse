-- Create sidebar_ads table for desktop right sidebar advertisement (single ad)
CREATE TABLE IF NOT EXISTS public.sidebar_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sidebar_ads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sidebar_ads (public read, admin write)
CREATE POLICY "Anyone can view sidebar ads"
  ON public.sidebar_ads FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert sidebar ads"
  ON public.sidebar_ads FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sidebar ads"
  ON public.sidebar_ads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sidebar ads"
  ON public.sidebar_ads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sidebar_ads_updated_at
  BEFORE UPDATE ON public.sidebar_ads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for clarity
COMMENT ON TABLE public.sidebar_ads IS 'Desktop-only right sidebar advertisement (single placement under genres)';
