import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard } from 'lucide-react';

export const SeedMembershipButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-membership-data');
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: data.message || 'Membership data seeded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to seed membership data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSeedData} 
      disabled={loading}
      variant="outline"
      className="gap-2"
    >
      <CreditCard className="w-4 h-4" />
      {loading ? 'Seeding...' : 'Seed Membership'}
    </Button>
  );
};
