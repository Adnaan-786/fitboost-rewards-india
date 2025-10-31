import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Reel {
  id: string;
  video_url: string;
  caption: string;
  likes: number;
  profiles: {
    name: string;
  };
}

const Reels = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (user) {
      fetchReels();
    }
  }, [user]);

  const fetchReels = async () => {
    const { data } = await supabase
      .from('social_reels')
      .select(`
        *,
        profiles (name)
      `)
      .order('created_at', { ascending: false });
    
    if (data) setReels(data);
  };

  const likeReel = async (reelId: string, currentLikes: number) => {
    const { error } = await supabase
      .from('social_reels')
      .update({ likes: currentLikes + 1 })
      .eq('id', reelId);

    if (!error) {
      fetchReels();
      toast({
        title: "Liked!",
        description: "Keep the motivation going! 💪",
      });
    }
  };

  const handleScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentReel = reels[currentIndex];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" onWheel={handleScroll}>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-white">Reels</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {reels.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold mb-2">No reels yet</h3>
            <p className="text-white/70">Be the first to share your fitness journey!</p>
          </div>
        </div>
      ) : (
        <div className="relative h-full w-full flex items-center justify-center">
          {/* Main Reel Content */}
          <div className="relative w-full max-w-md h-full">
            {/* Background Image/Video */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentReel?.video_url})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            </div>

            {/* Content Overlay */}
            <div className="relative h-full flex flex-col justify-end p-6 pb-24">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="border-2 border-white">
                  <AvatarFallback className="bg-primary text-white">
                    {currentReel?.profiles?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-white text-lg">{currentReel?.profiles?.name || 'User'}</p>
                  <p className="text-sm text-white/90">{currentReel?.caption}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons - Right Side */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-6">
              <button 
                onClick={() => likeReel(currentReel.id, currentReel.likes)}
                className="flex flex-col items-center gap-1 transition-transform hover:scale-110"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white fill-white" />
                </div>
                <span className="text-white text-sm font-semibold">{currentReel?.likes}</span>
              </button>

              <button className="flex flex-col items-center gap-1 transition-transform hover:scale-110">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-sm font-semibold">12</span>
              </button>

              <button className="flex flex-col items-center gap-1 transition-transform hover:scale-110">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
              </button>

              <button className="flex flex-col items-center gap-1 transition-transform hover:scale-110">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bookmark className="w-6 h-6 text-white" />
                </div>
              </button>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {reels.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reels;
