import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";

interface ScheduleWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onWorkoutScheduled: () => void;
}

interface WorkoutOption {
  id: string;
  name: string;
  type: "plan" | "custom";
}

const ScheduleWorkoutDialog = ({
  open,
  onOpenChange,
  selectedDate,
  onWorkoutScheduled,
}: ScheduleWorkoutDialogProps) => {
  const [workoutOptions, setWorkoutOptions] = useState<WorkoutOption[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState("30");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchWorkoutOptions();
      if (selectedDate) {
        setDate(format(selectedDate, "yyyy-MM-dd"));
      }
    }
  }, [open, selectedDate]);

  const fetchWorkoutOptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [plansResult, customResult] = await Promise.all([
        supabase.from("workout_plans").select("id, name"),
        supabase
          .from("user_custom_workouts")
          .select("id, name")
          .eq("user_id", user.id),
      ]);

      const plans: WorkoutOption[] =
        plansResult.data?.map((p) => ({ ...p, type: "plan" as const })) || [];
      const custom: WorkoutOption[] =
        customResult.data?.map((c) => ({ ...c, type: "custom" as const })) || [];

      setWorkoutOptions([...plans, ...custom]);
    } catch (error) {
      console.error("Error fetching workout options:", error);
    }
  };

  const handleSchedule = async () => {
    if (!selectedWorkout || !date) {
      toast.error("Please select a workout and date");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const workout = workoutOptions.find((w) => w.id === selectedWorkout);
      if (!workout) return;

      const scheduleData = {
        user_id: user.id,
        scheduled_date: date,
        scheduled_time: time || null,
        notes: notes || null,
        reminder_enabled: reminderEnabled,
        reminder_minutes_before: parseInt(reminderMinutes),
        ...(workout.type === "plan"
          ? { workout_plan_id: workout.id }
          : { user_workout_id: workout.id }),
      };

      const { error } = await supabase
        .from("scheduled_workouts")
        .insert(scheduleData);

      if (error) throw error;

      toast.success("Workout scheduled successfully!");
      onWorkoutScheduled();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error scheduling workout:", error);
      toast.error("Failed to schedule workout");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedWorkout("");
    setDate("");
    setTime("");
    setNotes("");
    setReminderEnabled(true);
    setReminderMinutes("30");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Workout</DialogTitle>
          <DialogDescription>
            Plan your workout and set a reminder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Select Workout</Label>
            <Select value={selectedWorkout} onValueChange={setSelectedWorkout}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a workout" />
              </SelectTrigger>
              <SelectContent>
                {workoutOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name} ({option.type === "plan" ? "Plan" : "Custom"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <Label>Time (Optional)</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this workout..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Enable Reminder</Label>
              <Switch
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>

            {reminderEnabled && (
              <div>
                <Label>Remind me (minutes before)</Label>
                <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            onClick={handleSchedule}
            disabled={loading}
          >
            {loading ? "Scheduling..." : "Schedule Workout"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleWorkoutDialog;
