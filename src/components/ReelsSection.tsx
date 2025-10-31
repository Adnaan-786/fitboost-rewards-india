import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Video, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReelsSection = () => {
  const [reels, setReels] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    const { data } = await supabase
      .from('social_reels')
      .select(`
        *,
        profiles (name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data) setReels(data);
  };

  const likeReel = async (reelId: string, currentLikes: number) => {
    await supabase
      .from('social_reels')
      .update({ likes: currentLikes + 1 })
      .eq('id', reelId);
    
    fetchReels();
  };

  if (reels.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Trending Reels 🔥</h3>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/reels')}
          className="gap-2"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {reels.map((reel, idx) => {
          const gradients = [
            { from: 'rgb(169, 85, 255)', to: 'rgb(234, 81, 255)' },
            { from: 'rgb(86, 204, 242)', to: 'rgb(47, 128, 237)' },
            { from: 'rgb(255, 153, 102)', to: 'rgb(255, 94, 98)' },
            { from: 'rgb(128, 255, 114)', to: 'rgb(126, 232, 250)' },
            { from: 'rgb(255, 169, 198)', to: 'rgb(244, 52, 226)' }
          ];
          const gradient = gradients[idx % gradients.length];

          return (
            <Card 
              key={reel.id} 
              className="min-w-[200px] flex-shrink-0 overflow-hidden relative group cursor-pointer hover:scale-105 transition-transform duration-300"
              style={{
                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`
              }}
            >
              <div className="aspect-[9/16] relative">
                {reel.video_url ? (
                  <>
                    <video
                      src={reel.video_url}
                      className="absolute inset-0 w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </>
                ) : (
                  <>
                    <div 
                      className="absolute inset-0 backdrop-blur-xl opacity-30"
                      style={{
                        background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-12 h-12 text-white/60" />
                    </div>
                  </>
                )}
                <div className="relative z-10 h-full flex flex-col justify-end p-4 text-white">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 border-2 border-white/30">
                        <AvatarFallback className="text-xs bg-white/20 text-white">
                          {reel.profiles?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-semibold truncate flex-1">
                        {reel.profiles?.name || 'User'}
                      </p>
                    </div>
                    <p className="text-xs opacity-90 line-clamp-2">{reel.caption}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        likeReel(reel.id, reel.likes);
                      }}
                      className="w-full gap-2 text-white hover:bg-white/20 border border-white/30"
                    >
                      <Heart className="w-3 h-3 fill-white" />
                      {reel.likes}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ReelsSection;
