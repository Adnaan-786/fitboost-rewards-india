-- Make adnaangouri58@gmail.com an admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'adnaangouri58@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  application_type TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Users can create their own applications
CREATE POLICY "Users can create applications"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
ON public.applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.applications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update applications
CREATE POLICY "Admins can update applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();