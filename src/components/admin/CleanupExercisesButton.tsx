import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

const CleanupExercisesButton = () => {
  const [loading, setLoading] = useState(false);

  const handleCleanup = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('cleanup-exercises');

      if (error) throw error;

      toast.success(data.message || "Duplicates removed successfully!");
      console.log("Cleanup result:", data);
      
      // Refresh the page to show updated data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error cleaning up exercises:", error);
      toast.error("Failed to cleanup exercises");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCleanup}
      disabled={loading}
      variant="destructive"
      size="sm"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Cleaning...
        </>
      ) : (
        <>
          <Trash2 className="w-4 h-4 mr-2" />
          Remove Duplicates
        </>
      )}
    </Button>
  );
};

export default CleanupExercisesButton;
