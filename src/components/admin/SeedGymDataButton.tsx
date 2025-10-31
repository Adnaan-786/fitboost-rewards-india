import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin } from 'lucide-react';

export const SeedGymDataButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-gym-data');
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: data.message || 'Gym data seeded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to seed gym data',
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
      <MapPin className="w-4 h-4" />
      {loading ? 'Seeding...' : 'Seed Gym Data'}
    </Button>
  );
};
