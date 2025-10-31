import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Play, Star } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  difficulty_level: string;
  duration_weeks: number | null;
  estimated_duration_minutes: number | null;
  is_featured: boolean;
}

const WorkoutPlans = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("workout_plans")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("name");

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching workout plans:", error);
      toast.error("Failed to load workout plans");
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = async (planId: string) => {
    try {
      const { data: session, error } = await supabase
        .from("workout_sessions")
        .insert({
          workout_plan_id: planId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
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

  const getDifficultyColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-green-500/20 text-green-500",
      intermediate: "bg-yellow-500/20 text-yellow-500",
      advanced: "bg-red-500/20 text-red-500",
    };
    return colors[level] || "bg-gray-500/20 text-gray-500";
  };

  if (loading) {
    return <div className="text-center py-12">Loading workout plans...</div>;
  }

  return (
    <div className="space-y-6">
      {plans.length === 0 ? (
        <Card className="backdrop-blur-sm bg-card/80">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No workout plans available yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back later for expert-designed workout routines!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`backdrop-blur-sm bg-card/80 hover:bg-card/90 transition-all ${
                plan.is_featured ? "border-primary" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {plan.is_featured && (
                      <div className="flex items-center gap-1 text-primary mb-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-semibold">Featured</span>
                      </div>
                    )}
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getDifficultyColor(plan.difficulty_level)}>
                      {plan.difficulty_level}
                    </Badge>
                    {plan.duration_weeks && (
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {plan.duration_weeks} weeks
                      </Badge>
                    )}
                    {plan.estimated_duration_minutes && (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {plan.estimated_duration_minutes} min
                      </Badge>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => startWorkout(plan.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Workout
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

export default WorkoutPlans;
