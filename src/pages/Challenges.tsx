import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Coins, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Challenges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [myChallenges, setMyChallenges] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchChallenges();
      fetchMyChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setChallenges(data);
  };

  const fetchMyChallenges = async () => {
    const { data } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenges (*)
      `)
      .eq('user_id', user?.id);
    
    if (data) setMyChallenges(data);
  };

  const joinChallenge = async (challengeId: string) => {
    const { error } = await supabase
      .from('user_challenges')
      .insert({
        user_id: user?.id,
        challenge_id: challengeId,
        progress: 0,
        status: 'In Progress'
      });

    if (error) {
      if (error.code === '23505') {
        toast({
          variant: 'destructive',
          title: 'Already joined',
          description: 'You have already joined this challenge!'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message
        });
      }
    } else {
      toast({
        title: 'Challenge joined!',
        description: 'Good luck on your fitness journey! 💪'
      });
      fetchMyChallenges();
    }
  };

  const isJoined = (challengeId: string) => {
    return myChallenges.some(mc => mc.challenge_id === challengeId);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Challenges</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="my-challenges">My Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{challenge.duration_days} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Goal</span>
                        <span className="font-medium">{challenge.goal}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Coins className="w-5 h-5 text-primary" />
                        <span className="text-lg font-bold">{challenge.fitcoins_reward} FitCoins</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => joinChallenge(challenge.id)}
                      disabled={isJoined(challenge.id)}
                    >
                      {isJoined(challenge.id) ? 'Already Joined' : 'Join Challenge'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-challenges" className="space-y-4">
            {myChallenges.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No challenges yet</h3>
                  <p className="text-muted-foreground">Join a challenge to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myChallenges.map((userChallenge) => (
                  <Card key={userChallenge.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">{userChallenge.challenges.title}</CardTitle>
                        <Badge variant={userChallenge.status === 'Completed' ? 'default' : 'secondary'}>
                          {userChallenge.status}
                        </Badge>
                      </div>
                      <CardDescription>{userChallenge.challenges.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{userChallenge.progress}%</span>
                        </div>
                        <Progress value={userChallenge.progress} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">{userChallenge.challenges.fitcoins_reward} FitCoins reward</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Challenges;
