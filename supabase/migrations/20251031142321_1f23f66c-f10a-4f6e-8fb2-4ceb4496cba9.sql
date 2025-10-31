-- Create products table for gym merchandise
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view products
CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
USING (true);

-- Create cart/orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert sample gym products
INSERT INTO public.products (name, description, price, category, stock, image_url) VALUES
('FitQuest Performance Tee', 'Premium moisture-wicking gym t-shirt with breathable fabric', 29.99, 'Apparel', 50, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'),
('FitQuest Training Shorts', 'Comfortable athletic shorts with phone pocket', 34.99, 'Apparel', 45, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500'),
('FitQuest Sports Cap', 'Adjustable cap with moisture-wicking sweatband', 19.99, 'Accessories', 60, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500'),
('FitQuest Water Bottle', 'Insulated 750ml stainless steel water bottle', 24.99, 'Accessories', 40, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'),
('FitQuest Gym Bag', 'Spacious duffel bag with separate shoe compartment', 49.99, 'Accessories', 30, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'),
('FitQuest Hoodie', 'Soft cotton blend hoodie perfect for warm-ups', 44.99, 'Apparel', 35, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500');

-- Insert sample motivational reels
INSERT INTO public.social_reels (user_id, video_url, caption, likes) 
SELECT 
  id,
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500',
  'No pain, no gain! 💪 Keep pushing your limits',
  234
FROM profiles LIMIT 1;

INSERT INTO public.social_reels (user_id, video_url, caption, likes)
SELECT 
  id,
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500',
  'Consistency is key 🔥 Every workout counts!',
  189
FROM profiles LIMIT 1;

INSERT INTO public.social_reels (user_id, video_url, caption, likes)
SELECT 
  id,
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500',
  'Strong body, strong mind 💯 #FitnessMotivation',
  312
FROM profiles LIMIT 1;

INSERT INTO public.social_reels (user_id, video_url, caption, likes)
SELECT 
  id,
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500',
  'Transform your life one rep at a time 🏋️',
  267
FROM profiles LIMIT 1;