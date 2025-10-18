-- Create advertisements table
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  placement TEXT NOT NULL,
  target_url TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  alt_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for advertisements (public read, admin write)
CREATE POLICY "Anyone can view advertisements"
  ON public.advertisements FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert advertisements"
  ON public.advertisements FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update advertisements"
  ON public.advertisements FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete advertisements"
  ON public.advertisements FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_advertisements_updated_at
  BEFORE UPDATE ON public.advertisements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for placement lookup
CREATE INDEX IF NOT EXISTS idx_advertisements_placement ON public.advertisements(placement);
CREATE INDEX IF NOT EXISTS idx_advertisements_is_active ON public.advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_advertisements_display_order ON public.advertisements(display_order);