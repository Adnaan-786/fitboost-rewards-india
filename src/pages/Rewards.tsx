import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Rewards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [rewards, setRewards] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user) {
      fetchRewards();
      fetchBalance();
    }
  }, [user]);

  const fetchRewards = async () => {
    const { data } = await supabase
      .from('reward_marketplace')
      .select('*')
      .order('fitcoin_cost', { ascending: true });
    
    if (data) setRewards(data);
  };

  const fetchBalance = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('fitcoin_balance')
      .eq('id', user?.id)
      .single();
    
    if (data) setBalance(data.fitcoin_balance || 0);
  };

  const redeemReward = async (reward: any) => {
    if (balance < reward.fitcoin_cost) {
      toast({
        variant: 'destructive',
        title: 'Insufficient FitCoins',
        description: `You need ${reward.fitcoin_cost - balance} more FitCoins to redeem this reward.`
      });
      return;
    }

    const newBalance = balance - reward.fitcoin_cost;
    
    const { error } = await supabase
      .from('profiles')
      .update({ fitcoin_balance: newBalance })
      .eq('id', user?.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message
      });
    } else {
      const couponCode = `FB${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      toast({
        title: 'Reward Redeemed! 🎉',
        description: `Your coupon code: ${couponCode}. Check your email for details!`
      });
      
      setBalance(newBalance);
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
            <h1 className="text-2xl font-bold">Rewards Marketplace</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
            <Coins className="w-5 h-5 text-primary" />
            <span className="font-bold">{balance}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Exclusive Rewards from Top Indian Brands</h2>
          <p className="text-muted-foreground">Redeem your FitCoins for amazing products and services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rewards.map((reward) => {
            const canAfford = balance >= reward.fitcoin_cost;
            
            return (
              <Card key={reward.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="aspect-square rounded-t-lg overflow-hidden bg-muted">
                    <img 
                      src={reward.product_image} 
                      alt={reward.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <CardTitle className="text-lg line-clamp-1">{reward.product_name}</CardTitle>
                    <CardDescription className="text-sm mt-1">{reward.brand}</CardDescription>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{reward.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-primary" />
                      <span className="text-lg font-bold">{reward.fitcoin_cost}</span>
                    </div>
                    <Button
                      onClick={() => redeemReward(reward)}
                      disabled={!canAfford}
                      size="sm"
                    >
                      {canAfford ? 'Redeem' : 'Not enough'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Rewards;
