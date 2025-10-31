import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Coins, Dumbbell, Flame, Droplet, Play, Pause, RotateCcw, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
import GradientMenu from '@/components/ui/gradient-menu';
import ReelsSection from '@/components/ReelsSection';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SeedGymDataButton } from '@/components/admin/SeedGymDataButton';
import { SeedMembershipButton } from '@/components/admin/SeedMembershipButton';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [todayStats, setTodayStats] = useState({ steps: 5420, calories: 320, water: 5 });
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [aiTip, setAiTip] = useState('');
  const [dietPlan, setDietPlan] = useState('');
  const [loadingDietPlan, setLoadingDietPlan] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    weight: '',
    height: '',
    age: '',
    fitness_goal: ''
  });

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
    if (profile && profile.weight && profile.height) {
      generateDietPlan();
    }
  }, [profile]);

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
    
    if (data) {
      setProfile(data);
      setProfileForm({
        name: data.name || '',
        weight: data.weight?.toString() || '',
        height: data.height?.toString() || '',
        age: data.age?.toString() || '',
        fitness_goal: data.fitness_goal || ''
      });
    }
  };

  const updateProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profileForm.name,
        weight: profileForm.weight ? parseFloat(profileForm.weight) : null,
        height: profileForm.height ? parseFloat(profileForm.height) : null,
        age: profileForm.age ? parseInt(profileForm.age) : null,
        fitness_goal: profileForm.fitness_goal
      })
      .eq('id', user?.id);

    if (!error) {
      toast({
        title: 'Profile updated!',
        description: 'Your profile has been updated successfully.'
      });
      setProfileDialogOpen(false);
      fetchProfile();
    } else {
      toast({
        title: 'Error',
        description: 'Could not update profile. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateDietPlan = async () => {
    if (!profile || !profile.weight || !profile.height) return;
    
    setLoadingDietPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-diet-plan', {
        body: {
          weight: profile.weight,
          height: profile.height,
          age: profile.age || 25,
          fitnessGoal: profile.fitness_goal || 'General Fitness'
        }
      });

      if (error) throw error;
      
      if (data?.dietPlan) {
        setDietPlan(data.dietPlan);
      }
    } catch (error) {
      console.error('Error generating diet plan:', error);
      toast({
        title: 'Error',
        description: 'Could not generate diet plan. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoadingDietPlan(false);
    }
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Gradient Animation */}
      <div className="fixed inset-0 z-0">
        <BackgroundGradientAnimation
          gradientBackgroundStart="rgb(108, 0, 162)"
          gradientBackgroundEnd="rgb(0, 17, 82)"
          firstColor="18, 113, 255"
          secondColor="221, 74, 255"
          thirdColor="100, 220, 255"
          fourthColor="200, 50, 50"
          fifthColor="180, 180, 50"
          interactive={true}
        />
      </div>

      <header className="border-b relative z-10 bg-background/30 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 icon-gradient" />
            <h1 className="text-2xl font-bold">FitBoost</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full badge-gradient">
              <Coins className="w-5 h-5 text-white" />
              <span className="font-bold text-white">{profile?.fitcoin_balance || 0}</span>
            </div>
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5 icon-gradient" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profileForm.weight}
                      onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                      placeholder="70"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profileForm.height}
                      onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                      placeholder="175"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                      placeholder="25"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fitness_goal">Fitness Goal</Label>
                    <Input
                      id="fitness_goal"
                      value={profileForm.fitness_goal}
                      onChange={(e) => setProfileForm({ ...profileForm, fitness_goal: e.target.value })}
                      placeholder="Weight Loss, Muscle Gain, etc."
                    />
                  </div>
                </div>
                <Button onClick={updateProfile} className="w-full">
                  Save Changes
                </Button>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-5 h-5 icon-gradient" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6 relative z-10">
        <div>
          <h2 className="text-3xl font-bold">Hello, {profile?.name || 'there'}! 👋</h2>
          <p className="text-muted-foreground mt-1">Ready to crush your fitness goals today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card style={{ background: 'var(--gradient-card)' }} className="backdrop-blur-sm bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Steps Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayStats.steps}</div>
              <Progress value={(todayStats.steps / 10000) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">Goal: 10,000 steps</p>
            </CardContent>
          </Card>

          <Card style={{ background: 'var(--gradient-card)' }} className="backdrop-blur-sm bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flame className="w-4 h-4 icon-gradient" />
                Calories Burned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayStats.calories}</div>
              <Progress value={(todayStats.calories / 500) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">Goal: 500 kcal</p>
            </CardContent>
          </Card>

          <Card style={{ background: 'var(--gradient-card)' }} className="backdrop-blur-sm bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Droplet className="w-4 h-4 icon-gradient" />
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
          <Card style={{ background: 'var(--gradient-card)' }} className="backdrop-blur-sm bg-card/80">
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

          <Card style={{ background: 'var(--gradient-card)' }} className="backdrop-blur-sm bg-card/80">
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
                  {isRunning ? <Pause className="w-4 h-4 mr-2 icon-gradient" /> : <Play className="w-4 h-4 mr-2 icon-gradient" />}
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button 
                  onClick={() => { setTimer(0); setIsRunning(false); }}
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 icon-gradient" />
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

        <Card style={{ background: 'var(--gradient-card)' }} className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle>💡 AI Coach Tip of the Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{aiTip}</p>
          </CardContent>
        </Card>

        <Card style={{ background: 'var(--gradient-card)' }} className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🥗 Personalized AI Diet Plan</span>
              {!loadingDietPlan && dietPlan && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateDietPlan}
                >
                  Regenerate
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Based on your profile: {profile?.weight}kg, {profile?.height}cm, Goal: {profile?.fitness_goal || 'Not set'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDietPlan ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Generating your personalized diet plan...</span>
              </div>
            ) : dietPlan ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-line text-base leading-relaxed">{dietPlan}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  {!profile?.weight || !profile?.height 
                    ? 'Please complete your profile (weight, height, age) in settings to get a personalized diet plan.'
                    : 'Click the button below to generate your diet plan.'}
                </p>
                {profile?.weight && profile?.height && (
                  <Button onClick={generateDietPlan}>
                    Generate Diet Plan
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gradient Menu Navigation */}
        <GradientMenu />

        {/* Admin Tools */}
        <Card style={{ background: 'var(--gradient-card)' }} className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle>🔧 Admin Tools</CardTitle>
            <CardDescription>Development and testing utilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <SeedGymDataButton />
              <SeedMembershipButton />
            </div>
          </CardContent>
        </Card>

        {/* Reels Section */}
        <ReelsSection />
      </main>
    </div>
  );
};

export default Dashboard;
