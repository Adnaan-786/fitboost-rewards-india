-- Create gym memberships table
CREATE TABLE public.gym_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_price NUMERIC(10,2) NOT NULL,
  qr_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'expired', 'cancelled', 'pending'))
);

-- Create gym check-ins table
CREATE TABLE public.gym_check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  membership_id UUID NOT NULL REFERENCES public.gym_memberships(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gym payments table
CREATE TABLE public.gym_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  membership_id UUID NOT NULL REFERENCES public.gym_memberships(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'completed',
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_payment_status CHECK (status IN ('completed', 'pending', 'failed', 'refunded'))
);

-- Enable RLS
ALTER TABLE public.gym_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gym_memberships
CREATE POLICY "Users can view their own memberships"
  ON public.gym_memberships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memberships"
  ON public.gym_memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships"
  ON public.gym_memberships FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for gym_check_ins
CREATE POLICY "Users can view their own check-ins"
  ON public.gym_check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins"
  ON public.gym_check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for gym_payments
CREATE POLICY "Users can view their own payments"
  ON public.gym_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
  ON public.gym_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_gym_memberships_user_id ON public.gym_memberships(user_id);
CREATE INDEX idx_gym_memberships_status ON public.gym_memberships(status);
CREATE INDEX idx_gym_check_ins_user_id ON public.gym_check_ins(user_id);
CREATE INDEX idx_gym_check_ins_time ON public.gym_check_ins(check_in_time DESC);
CREATE INDEX idx_gym_payments_user_id ON public.gym_payments(user_id);
CREATE INDEX idx_gym_payments_membership_id ON public.gym_payments(membership_id);

-- Create trigger for updating gym_memberships updated_at
CREATE TRIGGER update_gym_memberships_updated_at
  BEFORE UPDATE ON public.gym_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();