-- Add foreign key relationship between social_reels and profiles
ALTER TABLE public.social_reels 
DROP CONSTRAINT IF EXISTS social_reels_user_id_fkey;

ALTER TABLE public.social_reels 
ADD CONSTRAINT social_reels_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;