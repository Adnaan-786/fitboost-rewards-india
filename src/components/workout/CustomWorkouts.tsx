import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CustomWorkout {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const CustomWorkouts = () => {
  const [workouts, setWorkouts] = useState<CustomWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomWorkouts();
  }, []);

  const fetchCustomWorkouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to view your workouts");
        return;
      }

      const { data, error } = await supabase
        .from("user_custom_workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error("Error fetching custom workouts:", error);
      toast.error("Failed to load your workouts");
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    try {
      const { error } = await supabase
        .from("user_custom_workouts")
        .delete()
        .eq("id", workoutId);

      if (error) throw error;

      setWorkouts(workouts.filter((w) => w.id !== workoutId));
      toast.success("Workout deleted successfully");
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast.error("Failed to delete workout");
    }
  };

  const startWorkout = async (workoutId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: session, error } = await supabase
        .from("workout_sessions")
        .insert({
          user_workout_id: workoutId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Workout started!");
      // Navigate to workout session page (to be created)
      // navigate(`/workout-session/${session.id}`);
    } catch (error) {
      console.error("Error starting workout:", error);
      toast.error("Failed to start workout");
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading your workouts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Custom Workouts</h2>
          <p className="text-muted-foreground">Create and manage your personalized routines</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Workout
        </Button>
      </div>

      {workouts.length === 0 ? (
        <Card className="backdrop-blur-sm bg-card/80">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">You haven't created any custom workouts yet</p>
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Workout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map((workout) => (
            <Card key={workout.id} className="backdrop-blur-sm bg-card/80 hover:bg-card/90 transition-all">
              <CardHeader>
                <CardTitle>{workout.name}</CardTitle>
                {workout.description && (
                  <CardDescription>{workout.description}</CardDescription>
                )}
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(workout.updated_at).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => startWorkout(workout.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                  <Button variant="outline" size="icon">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteWorkout(workout.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomWorkouts;
