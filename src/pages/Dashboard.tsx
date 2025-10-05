import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Coins, Dumbbell, Flame, Droplet, Play, Pause, RotateCcw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [todayStats, setTodayStats] = useState({ steps: 5420, calories: 320, water: 5 });
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [aiTip, setAiTip] = useState('');

  const tips = [
    'Start your day with a glass of water to boost metabolism',
    'Take short walking breaks every hour to stay active',
    'Consistency is key - aim for 30 minutes of exercise daily',
    'Mix cardio and strength training for best results',
    'Rest days are important for muscle recovery'
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
      setAiTip(tips[Math.floor(Math.random() * tips.length)]);
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    
    if (data) setProfile(data);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveWorkout = async () => {
    if (timer === 0) return;
    
    const { error } = await supabase
      .from('user_activity_log')
      .insert({
        user_id: user?.id,
        activity_type: 'Workout',
        details: `Quick workout - ${formatTime(timer)}`,
        calories: Math.floor(timer / 60) * 8
      });

    if (!error) {
      const newBalance = (profile?.fitcoin_balance || 0) + 10;
      await supabase
        .from('profiles')
        .update({ 
          fitcoin_balance: newBalance,
          workout_streak: (profile?.workout_streak || 0) + 1,
          last_workout_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', user?.id);

      toast({
        title: 'Workout saved!',
        description: `You earned 10 FitCoins! 🎉`
      });
      
      setTimer(0);
      setIsRunning(false);
      fetchProfile();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">FitBoost</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
              <Coins className="w-5 h-5 text-primary" />
              <span className="font-bold">{profile?.fitcoin_balance || 0}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Hello, {profile?.name || 'there'}! 👋</h2>
          <p className="text-muted-foreground mt-1">Ready to crush your fitness goals today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Steps Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayStats.steps}</div>
              <Progress value={(todayStats.steps / 10000) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">Goal: 10,000 steps</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                Calories Burned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayStats.calories}</div>
              <Progress value={(todayStats.calories / 500) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">Goal: 500 kcal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Droplet className="w-4 h-4 text-accent" />
                Water Intake
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayStats.water} / 8</div>
              <Progress value={(todayStats.water / 8) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">Glasses today</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Workout Streak 🔥</CardTitle>
              <CardDescription>Keep it going!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-6xl font-bold text-primary">{profile?.workout_streak || 0}</div>
                <p className="text-muted-foreground mt-2">Consecutive days</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Workout Timer</CardTitle>
              <CardDescription>Track your workout session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-5xl font-bold font-mono">{formatTime(timer)}</div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsRunning(!isRunning)}
                  className="flex-1"
                  variant={isRunning ? "secondary" : "default"}
                >
                  {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button 
                  onClick={() => { setTimer(0); setIsRunning(false); }}
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              {timer > 0 && !isRunning && (
                <Button onClick={saveWorkout} className="w-full">
                  Save Workout & Earn Coins
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card style={{ background: 'var(--gradient-card)' }}>
          <CardHeader>
            <CardTitle>💡 AI Coach Tip of the Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{aiTip}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button onClick={() => navigate('/challenges')} className="h-24" variant="outline">
            <div className="text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm font-medium">Challenges</div>
            </div>
          </Button>
          <Button onClick={() => navigate('/events')} className="h-24" variant="outline">
            <div className="text-center">
              <div className="text-2xl mb-1">📅</div>
              <div className="text-sm font-medium">Events</div>
            </div>
          </Button>
          <Button onClick={() => navigate('/rewards')} className="h-24" variant="outline">
            <div className="text-center">
              <div className="text-2xl mb-1">🎁</div>
              <div className="text-sm font-medium">Rewards</div>
            </div>
          </Button>
          <Button onClick={() => navigate('/gyms')} className="h-24" variant="outline">
            <div className="text-center">
              <div className="text-2xl mb-1">🏋️</div>
              <div className="text-sm font-medium">Find Gyms</div>
            </div>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
