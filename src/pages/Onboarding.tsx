import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Coins } from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        fitness_goal: fitnessGoal
      })
      .eq('id', user.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error updating profile',
        description: error.message
      });
    } else {
      toast({
        title: 'Welcome to FitBoost!',
        description: 'Your profile is all set up.'
      });
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-accent)' }}>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-sm font-medium text-muted-foreground">
            Step {step} of 3
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && 'Tell us about yourself'}
            {step === 2 && 'What\'s your fitness goal?'}
            {step === 3 && 'About FitCoins'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Help us personalize your experience'}
            {step === 2 && 'Choose what you want to achieve'}
            {step === 3 && 'Earn rewards for staying active'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                  <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                  <SelectItem value="Stay Active">Stay Active</SelectItem>
                  <SelectItem value="Improve Flexibility">Improve Flexibility</SelectItem>
                  <SelectItem value="Build Endurance">Build Endurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                <Coins className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Earn FitCoins</h3>
                <p className="text-muted-foreground">
                  Complete workouts, challenges, and stay active to earn FitCoins. 
                  Redeem them for awesome rewards from top Indian brands!
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button 
              onClick={step === 3 ? handleComplete : handleNext}
              disabled={loading || (step === 1 && (!age || !weight || !height)) || (step === 2 && !fitnessGoal)}
              className="flex-1"
            >
              {step === 3 ? (loading ? 'Setting up...' : 'Get Started') : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
