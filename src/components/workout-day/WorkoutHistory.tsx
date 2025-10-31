import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Flame, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface WorkoutSession {
  id: string;
  started_at: string;
  completed_at: string | null;
  total_duration_seconds: number | null;
  total_calories_burned: number | null;
  notes: string | null;
  workout_plans?: { name: string } | null;
  user_custom_workouts?: { name: string } | null;
}

const WorkoutHistory = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  const fetchWorkoutHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("workout_sessions")
        .select(`
          *,
          workout_plans(name),
          user_custom_workouts(name)
        `)
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching workout history:", error);
      toast.error("Failed to load workout history");
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutName = (session: WorkoutSession) => {
    if (session.workout_plans) return session.workout_plans.name;
    if (session.user_custom_workouts) return session.user_custom_workouts.name;
    return "Custom Workout";
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (loading) {
    return <div className="text-center py-12">Loading workout history...</div>;
  }

  return (
    <div className="space-y-4">
      <Card className="backdrop-blur-sm bg-card/80">
        <CardHeader>
          <CardTitle>Workout History</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No completed workouts yet</p>
              <p className="text-sm mt-2">Start your first workout to see it here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id} className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{getWorkoutName(session)}</h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          {session.completed_at
                            ? format(new Date(session.completed_at), "MMM d, yyyy")
                            : "Unknown"}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-500/20 text-green-500">
                        Completed
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                          <div className="font-semibold">
                            {formatDuration(session.total_duration_seconds)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <Flame className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Calories</div>
                          <div className="font-semibold">
                            {session.total_calories_burned || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    {session.notes && (
                      <div className="mt-3 p-3 rounded-lg bg-background">
                        <p className="text-sm text-muted-foreground">
                          {session.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutHistory;
