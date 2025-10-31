import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SeedDataButton = () => {
  const [loading, setLoading] = useState(false);

  const seedDatabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-workout-data');
      
      if (error) throw error;
      
      toast.success(`✅ Database seeded! ${data.counts.exercises} exercises and ${data.counts.plans} plans added`);
    } catch (error) {
      console.error('Error seeding database:', error);
      toast.error('Failed to seed database. It may already contain data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={seedDatabase} 
      disabled={loading}
      variant="outline"
      size="sm"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Seeding...
        </>
      ) : (
        <>
          <Database className="w-4 h-4 mr-2" />
          Seed Sample Data
        </>
      )}
    </Button>
  );
};

export default SeedDataButton;
