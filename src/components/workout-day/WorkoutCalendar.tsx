import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ScheduleWorkoutDialog from "./ScheduleWorkoutDialog";

interface ScheduledWorkout {
  id: string;
  scheduled_date: string;
  scheduled_time: string | null;
  completed: boolean;
  workout_plan_id: string | null;
  user_workout_id: string | null;
  notes: string | null;
  workout_plans?: { name: string } | null;
  user_custom_workouts?: { name: string } | null;
}

const WorkoutCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [selectedDateWorkouts, setSelectedDateWorkouts] = useState<ScheduledWorkout[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledWorkouts();
  }, []);

  useEffect(() => {
    if (date) {
      filterWorkoutsForDate(date);
    }
  }, [date, scheduledWorkouts]);

  const fetchScheduledWorkouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("scheduled_workouts")
        .select(`
          *,
          workout_plans(name),
          user_custom_workouts(name)
        `)
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      setScheduledWorkouts(data || []);
    } catch (error) {
      console.error("Error fetching scheduled workouts:", error);
      toast.error("Failed to load scheduled workouts");
    } finally {
      setLoading(false);
    }
  };

  const filterWorkoutsForDate = (selectedDate: Date) => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const filtered = scheduledWorkouts.filter(
      (workout) => workout.scheduled_date === dateStr
    );
    setSelectedDateWorkouts(filtered);
  };

  const getWorkoutName = (workout: ScheduledWorkout) => {
    if (workout.workout_plans) return workout.workout_plans.name;
    if (workout.user_custom_workouts) return workout.user_custom_workouts.name;
    return "Unnamed Workout";
  };

  const markAsCompleted = async (workoutId: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_workouts")
        .update({ completed: true })
        .eq("id", workoutId);

      if (error) throw error;

      toast.success("Workout marked as completed! 🎉");
      fetchScheduledWorkouts();
    } catch (error) {
      console.error("Error marking workout as completed:", error);
      toast.error("Failed to update workout");
    }
  };

  const datesWithWorkouts = scheduledWorkouts.map(w => new Date(w.scheduled_date));

  if (loading) {
    return <div className="text-center py-12">Loading calendar...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card className="backdrop-blur-sm bg-card/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Schedule
            </CardTitle>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Workout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
              booked: datesWithWorkouts,
            }}
            modifiersStyles={{
              booked: {
                backgroundColor: "hsl(var(--primary) / 0.2)",
                fontWeight: "bold",
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Scheduled Workouts for Selected Date */}
      <Card className="backdrop-blur-sm bg-card/80">
        <CardHeader>
          <CardTitle>
            {date ? format(date, "MMMM d, yyyy") : "Select a date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateWorkouts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No workouts scheduled for this date</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Workout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateWorkouts.map((workout) => (
                <Card key={workout.id} className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {getWorkoutName(workout)}
                        </h4>
                        {workout.scheduled_time && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            {workout.scheduled_time}
                          </div>
                        )}
                      </div>
                      {workout.completed ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline">Scheduled</Badge>
                      )}
                    </div>
                    {workout.notes && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {workout.notes}
                      </p>
                    )}
                    {!workout.completed && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => markAsCompleted(workout.id)}
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ScheduleWorkoutDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={date}
        onWorkoutScheduled={fetchScheduledWorkouts}
      />
    </div>
  );
};

export default WorkoutCalendar;
