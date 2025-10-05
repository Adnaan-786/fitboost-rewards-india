import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Heart, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Reels = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reels, setReels] = useState<any[]>([]);

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
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Social Reels</h1>
          </div>
          <Button>
            <Video className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {reels.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No reels yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to share your fitness journey!</p>
              <Button>Upload Your First Reel</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto">
            {reels.map((reel) => (
              <Card key={reel.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-[9/16] bg-muted flex items-center justify-center">
                    <Video className="w-16 h-16 text-muted-foreground" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{reel.profiles?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{reel.profiles?.name || 'User'}</p>
                        <p className="text-sm text-muted-foreground">{reel.caption}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likeReel(reel.id, reel.likes)}
                      className="gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      {reel.likes} Likes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Reels;
