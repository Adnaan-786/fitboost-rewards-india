-- Create trainer profiles table
CREATE TABLE trainer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  business_name TEXT NOT NULL,
  bio TEXT,
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  years_experience INTEGER,
  profile_image_url TEXT,
  cover_image_url TEXT,
  hourly_rate NUMERIC(10,2),
  location_address TEXT,
  location_city TEXT,
  location_state TEXT,
  location_postal_code TEXT,
  latitude NUMERIC(10,6),
  longitude NUMERIC(10,6),
  services_offered TEXT[] DEFAULT ARRAY[]::TEXT[],
  availability_days TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trainer reviews table
CREATE TABLE trainer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trainer_id, user_id)
);

-- Create trainer bookings table
CREATE TABLE trainer_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  session_type TEXT NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trainer messages table
CREATE TABLE trainer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message_text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trainer conversations table
CREATE TABLE trainer_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trainer_id, client_id)
);

-- Enable RLS
ALTER TABLE trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trainer_profiles
CREATE POLICY "Everyone can view trainer profiles" 
  ON trainer_profiles FOR SELECT 
  USING (true);

CREATE POLICY "Trainers can update their own profile" 
  ON trainer_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Trainers can create their own profile" 
  ON trainer_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for trainer_reviews
CREATE POLICY "Everyone can view reviews" 
  ON trainer_reviews FOR SELECT 
  USING (true);

CREATE POLICY "Users can create reviews for bookings" 
  ON trainer_reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON trainer_reviews FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for trainer_bookings
CREATE POLICY "Clients can view their own bookings" 
  ON trainer_bookings FOR SELECT 
  USING (auth.uid() = client_id);

CREATE POLICY "Trainers can view their bookings" 
  ON trainer_bookings FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM trainer_profiles WHERE id = trainer_bookings.trainer_id));

CREATE POLICY "Clients can create bookings" 
  ON trainer_bookings FOR INSERT 
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own bookings" 
  ON trainer_bookings FOR UPDATE 
  USING (auth.uid() = client_id);

CREATE POLICY "Trainers can update their bookings" 
  ON trainer_bookings FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM trainer_profiles WHERE id = trainer_bookings.trainer_id));

-- RLS Policies for trainer_conversations
CREATE POLICY "Users can view their conversations" 
  ON trainer_conversations FOR SELECT 
  USING (
    auth.uid() = client_id OR 
    auth.uid() IN (SELECT user_id FROM trainer_profiles WHERE id = trainer_conversations.trainer_id)
  );

CREATE POLICY "Users can create conversations" 
  ON trainer_conversations FOR INSERT 
  WITH CHECK (auth.uid() = client_id);

-- RLS Policies for trainer_messages
CREATE POLICY "Users can view their messages" 
  ON trainer_messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
  ON trainer_messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read" 
  ON trainer_messages FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- Create indexes
CREATE INDEX idx_trainer_profiles_location ON trainer_profiles(latitude, longitude);
CREATE INDEX idx_trainer_profiles_rating ON trainer_profiles(rating DESC);
CREATE INDEX idx_trainer_reviews_trainer_id ON trainer_reviews(trainer_id);
CREATE INDEX idx_trainer_bookings_trainer_id ON trainer_bookings(trainer_id);
CREATE INDEX idx_trainer_bookings_client_id ON trainer_bookings(client_id);
CREATE INDEX idx_trainer_messages_conversation_id ON trainer_messages(conversation_id);
CREATE INDEX idx_trainer_conversations_trainer_id ON trainer_conversations(trainer_id);
CREATE INDEX idx_trainer_conversations_client_id ON trainer_conversations(client_id);

-- Trigger for updating trainer_profiles.updated_at
CREATE TRIGGER update_trainer_profiles_updated_at
  BEFORE UPDATE ON trainer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updating trainer_bookings.updated_at
CREATE TRIGGER update_trainer_bookings_updated_at
  BEFORE UPDATE ON trainer_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update trainer rating
CREATE OR REPLACE FUNCTION update_trainer_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE trainer_profiles
  SET 
    rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM trainer_reviews WHERE trainer_id = NEW.trainer_id),
    total_reviews = (SELECT COUNT(*) FROM trainer_reviews WHERE trainer_id = NEW.trainer_id)
  WHERE id = NEW.trainer_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update trainer rating when review is added/updated
CREATE TRIGGER update_trainer_rating_trigger
  AFTER INSERT OR UPDATE ON trainer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_trainer_rating();