-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  profile_picture TEXT,
  age INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  fitness_goal TEXT,
  fitcoin_balance INTEGER DEFAULT 0,
  workout_streak INTEGER DEFAULT 0,
  last_workout_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Create workouts table
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  description TEXT,
  calories_burned INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_activity_log table
CREATE TABLE public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  details TEXT,
  calories INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  goal TEXT NOT NULL,
  fitcoins_reward INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_challenges table
CREATE TABLE public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'In Progress',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, challenge_id)
);

-- Create social_reels table
CREATE TABLE public.social_reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  caption TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gyms table
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  price_range TEXT,
  rating DECIMAL(2, 1),
  description TEXT,
  amenities TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reward_marketplace table
CREATE TABLE public.reward_marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  product_image TEXT,
  brand TEXT NOT NULL,
  description TEXT,
  fitcoin_cost INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_marketplace ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for workouts
CREATE POLICY "Everyone can view workouts"
  ON public.workouts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage workouts"
  ON public.workouts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_activity_log
CREATE POLICY "Users can view their own activity"
  ON public.user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON public.user_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for challenges
CREATE POLICY "Everyone can view challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage challenges"
  ON public.challenges FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_challenges
CREATE POLICY "Users can view their own challenges"
  ON public.user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join challenges"
  ON public.user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
  ON public.user_challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for social_reels
CREATE POLICY "Everyone can view reels"
  ON public.social_reels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own reels"
  ON public.social_reels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reels"
  ON public.social_reels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reels"
  ON public.social_reels FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for gyms
CREATE POLICY "Everyone can view gyms"
  ON public.gyms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage gyms"
  ON public.gyms FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for reward_marketplace
CREATE POLICY "Everyone can view rewards"
  ON public.reward_marketplace FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage rewards"
  ON public.reward_marketplace FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.workouts (name, type, duration, description, calories_burned) VALUES
  ('Morning Yoga Flow', 'Yoga', 30, 'Start your day with gentle stretches and breathing exercises', 120),
  ('HIIT Cardio Blast', 'HIIT', 20, 'High-intensity interval training for maximum calorie burn', 250),
  ('Strength Training', 'Strength', 45, 'Build muscle with bodyweight and resistance exercises', 200),
  ('Evening Walk', 'Cardio', 30, 'Light cardio to wind down your day', 100);

INSERT INTO public.challenges (title, description, duration_days, goal, fitcoins_reward) VALUES
  ('10K Steps Daily', 'Walk 10,000 steps every day for a week', 7, 'Complete 70,000 steps total', 500),
  ('30-Day Yoga Challenge', 'Practice yoga for 30 consecutive days', 30, 'Complete 30 yoga sessions', 1000),
  ('Water Warrior', 'Drink 8 glasses of water daily for 2 weeks', 14, 'Log 112 glasses of water', 300),
  ('Cardio Champion', 'Complete 10 cardio workouts this month', 30, 'Finish 10 cardio sessions', 800);

INSERT INTO public.gyms (name, address, latitude, longitude, price_range, rating, description, amenities) VALUES
  ('PowerFit Gym', 'C-Scheme, Jaipur, Rajasthan', 26.9124, 75.7873, '$', 4.5, 'Modern gym with state-of-the-art equipment', ARRAY['Cardio Equipment', 'Weight Training', 'Lockers', 'Parking']),
  ('YogaBliss Studio', 'Malviya Nagar, Jaipur', 26.8523, 75.8107, '$$', 4.8, 'Peaceful yoga and meditation center', ARRAY['Yoga Classes', 'Meditation', 'Air Conditioned', 'Shower']),
  ('Elite Fitness Center', 'Vaishali Nagar, Jaipur', 26.9146, 75.7245, '$$$', 4.7, 'Premium fitness facility with personal trainers', ARRAY['Personal Training', 'Spa', 'Swimming Pool', 'Cafe']);

INSERT INTO public.reward_marketplace (product_name, brand, description, fitcoin_cost, product_image) VALUES
  ('Protein Shake - Chocolate', 'MuscleBlaze', 'High-quality whey protein for muscle recovery', 500, 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400'),
  ('Yoga Mat Premium', 'Decathlon', 'Non-slip premium yoga mat with carry bag', 800, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'),
  ('Fitness Tracker Watch', 'Noise', 'Track your steps, heart rate, and calories', 2000, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400'),
  ('Gym Bag', 'Nike', 'Spacious gym bag with multiple compartments', 1200, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400');