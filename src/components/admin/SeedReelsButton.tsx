import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Video } from 'lucide-react';

export const SeedReelsButton = () => {
  const { toast } = useToast();

  const seedReelsData = async () => {
    try {
      toast({
        title: 'Seeding reels...',
        description: 'Adding sample fitness videos'
      });

      const { data, error } = await supabase.functions.invoke('seed-reels-data');

      if (error) throw error;

      toast({
        title: 'Success!',
        description: data.message || 'Sample reels added successfully'
      });

      // Refresh the page to show new reels
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to seed reels data',
        variant: 'destructive'
      });
    }
  };

  return (
    <Button onClick={seedReelsData} variant="outline" className="gap-2">
      <Video className="w-4 h-4" />
      Seed Reels
    </Button>
  );
};
