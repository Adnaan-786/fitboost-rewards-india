-- Add verified field to profiles
ALTER TABLE public.profiles
ADD COLUMN verified BOOLEAN DEFAULT false;

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'Competition', 'Workshop', 'Meetup', 'Challenge'
  location_name TEXT NOT NULL,
  location_address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  event_date DATE NOT NULL,
  event_time TIME,
  registration_deadline DATE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  entry_fee INTEGER DEFAULT 0,
  prize_pool INTEGER,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event_registrations table
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'registered', -- 'registered', 'cancelled', 'attended'
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Everyone can view upcoming and ongoing events"
  ON public.events FOR SELECT
  TO authenticated
  USING (status IN ('upcoming', 'ongoing'));

CREATE POLICY "Verified users can create events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.verified = true
    )
    AND auth.uid() = organizer_id
  );

CREATE POLICY "Organizers can update their own events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their own events"
  ON public.events FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- RLS Policies for event_registrations
CREATE POLICY "Users can view their own registrations"
  ON public.event_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Event organizers can view registrations for their events"
  ON public.event_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_registrations.event_id
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Users can register for events"
  ON public.event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own registrations"
  ON public.event_registrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registrations"
  ON public.event_registrations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for events updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample events
INSERT INTO public.events (
  title, description, event_type, location_name, location_address,
  latitude, longitude, event_date, event_time, registration_deadline,
  max_participants, entry_fee, prize_pool, organizer_id, status, image_url
)
SELECT
  'Jaipur Marathon 2025',
  'Join us for the annual Jaipur Marathon! Run 5K, 10K, or half marathon routes through the beautiful Pink City.',
  'Competition',
  'Central Park, Jaipur',
  'Jawaharlal Nehru Marg, Jaipur, Rajasthan',
  26.9124,
  75.7873,
  CURRENT_DATE + INTERVAL '15 days',
  '06:00:00',
  CURRENT_DATE + INTERVAL '10 days',
  500,
  500,
  50000,
  id,
  'upcoming',
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800'
FROM public.profiles
LIMIT 1;

INSERT INTO public.events (
  title, description, event_type, location_name, location_address,
  latitude, longitude, event_date, event_time, registration_deadline,
  max_participants, entry_fee, organizer_id, status, image_url
)
SELECT
  'Yoga & Meditation Workshop',
  'Learn advanced yoga techniques and meditation practices from certified instructors. Suitable for all levels.',
  'Workshop',
  'YogaBliss Studio',
  'Malviya Nagar, Jaipur',
  26.8523,
  75.8107,
  CURRENT_DATE + INTERVAL '7 days',
  '09:00:00',
  CURRENT_DATE + INTERVAL '5 days',
  30,
  0,
  id,
  'upcoming',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'
FROM public.profiles
LIMIT 1;

INSERT INTO public.events (
  title, description, event_type, location_name, location_address,
  latitude, longitude, event_date, event_time, registration_deadline,
  max_participants, entry_fee, prize_pool, organizer_id, status, image_url
)
SELECT
  'CrossFit Challenge 2025',
  'Test your strength, endurance, and skills in this ultimate CrossFit competition. Teams and individual categories available.',
  'Competition',
  'Elite Fitness Center',
  'Vaishali Nagar, Jaipur',
  26.9146,
  75.7245,
  CURRENT_DATE + INTERVAL '20 days',
  '08:00:00',
  CURRENT_DATE + INTERVAL '15 days',
  100,
  1000,
  100000,
  id,
  'upcoming',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
FROM public.profiles
LIMIT 1;

INSERT INTO public.events (
  title, description, event_type, location_name, location_address,
  latitude, longitude, event_date, event_time, registration_deadline,
  max_participants, entry_fee, organizer_id, status, image_url
)
SELECT
  'Fitness Community Meetup',
  'Connect with fellow fitness enthusiasts! Share your journey, exchange tips, and make new workout buddies.',
  'Meetup',
  'Central Park, Jaipur',
  'JLN Marg, Jaipur',
  26.9124,
  75.7873,
  CURRENT_DATE + INTERVAL '3 days',
  '17:00:00',
  CURRENT_DATE + INTERVAL '2 days',
  50,
  0,
  id,
  'upcoming',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800'
FROM public.profiles
LIMIT 1;