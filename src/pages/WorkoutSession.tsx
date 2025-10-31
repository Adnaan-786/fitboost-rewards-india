import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, CheckCircle2, Timer, Flame } from "lucide-react";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  duration_seconds?: number;
  rest_seconds: number;
  order_index: number;
}

interface ExerciseLog {
  exercise_id: string;
  set_number: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
}

const WorkoutSession = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [totalCalories, setTotalCalories] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [currentReps, setCurrentReps] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");

  useEffect(() => {
    fetchWorkoutSession();
  }, [sessionId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            toast.success("Rest complete! Ready for next set");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  const fetchWorkoutSession = async () => {
    try {
      // Fetch session details and associated exercises
      // This would need to query the workout_sessions table and join with exercises
      // For now, mock data
      toast.info("Loading workout session...");
    } catch (error) {
      console.error("Error fetching workout session:", error);
      toast.error("Failed to load workout session");
    }
  };

  const completeSet = async () => {
    const currentExercise = exercises[currentExerciseIndex];
    if (!currentExercise) return;

    const log: ExerciseLog = {
      exercise_id: currentExercise.id,
      set_number: currentSet,
      ...(currentReps && { reps: parseInt(currentReps) }),
      ...(currentWeight && { weight_kg: parseFloat(currentWeight) }),
    };

    setExerciseLogs([...exerciseLogs, log]);
    
    if (currentSet < (currentExercise.sets || 1)) {
      // Start rest period
      setIsResting(true);
      setRestTimeLeft(currentExercise.rest_seconds);
      setCurrentSet(currentSet + 1);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
      } else {
        // Workout complete
        completeWorkout();
      }
    }

    setCurrentReps("");
    setCurrentWeight("");
  };

  const completeWorkout = async () => {
    try {
      const duration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      
      // Update workout session
      const { error: sessionError } = await supabase
        .from("workout_sessions")
        .update({
          completed_at: new Date().toISOString(),
          total_duration_seconds: duration,
          total_calories_burned: totalCalories,
        })
        .eq("id", sessionId);

      if (sessionError) throw sessionError;

      // Insert exercise logs
      const logsToInsert = exerciseLogs.map(log => ({
        workout_session_id: sessionId,
        ...log,
      }));

      const { error: logsError } = await supabase
        .from("exercise_logs")
        .insert(logsToInsert);

      if (logsError) throw logsError;

      toast.success("Workout completed! 🎉");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing workout:", error);
      toast.error("Failed to save workout");
    }
  };

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/self-workout")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Active Workout</h1>
            <p className="text-muted-foreground">Stay focused and crush it!</p>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="backdrop-blur-sm bg-card/80">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 icon-gradient" />
                <div>
                  <div className="text-2xl font-bold">
                    {Math.floor((Date.now() - sessionStartTime.getTime()) / 60000)}m
                  </div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-card/80">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 icon-gradient" />
                <div>
                  <div className="text-2xl font-bold">
                    {currentExerciseIndex + 1}/{exercises.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Exercises</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-card/80">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 icon-gradient" />
                <div>
                  <div className="text-2xl font-bold">{totalCalories}</div>
                  <div className="text-xs text-muted-foreground">Calories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Exercise */}
        {currentExercise && (
          <Card className="backdrop-blur-sm bg-card/80 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{currentExercise.name}</CardTitle>
                <Badge variant="outline">
                  Set {currentSet}/{currentExercise.sets || 1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isResting ? (
                <div className="text-center py-8">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {restTimeLeft}
                  </div>
                  <p className="text-muted-foreground">Rest Time Remaining</p>
                  <Pause className="w-12 h-12 mx-auto mt-4 text-primary animate-pulse" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {currentExercise.reps && (
                      <div>
                        <label className="text-sm text-muted-foreground block mb-2">
                          Target Reps
                        </label>
                        <div className="text-3xl font-bold">{currentExercise.reps}</div>
                      </div>
                    )}
                    {currentExercise.duration_seconds && (
                      <div>
                        <label className="text-sm text-muted-foreground block mb-2">
                          Duration
                        </label>
                        <div className="text-3xl font-bold">
                          {currentExercise.duration_seconds}s
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">
                        Reps Completed
                      </label>
                      <Input
                        type="number"
                        value={currentReps}
                        onChange={(e) => setCurrentReps(e.target.value)}
                        placeholder="Enter reps"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">
                        Weight (kg) - Optional
                      </label>
                      <Input
                        type="number"
                        step="0.5"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        placeholder="Enter weight"
                      />
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={completeSet}>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Complete Set
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Exercise List */}
        <Card className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle>Workout Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === currentExerciseIndex
                      ? "bg-primary/20"
                      : index < currentExerciseIndex
                      ? "bg-green-500/10"
                      : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {index < currentExerciseIndex ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : index === currentExerciseIndex ? (
                      <Play className="w-5 h-5 text-primary" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted" />
                    )}
                    <span className="font-medium">{exercise.name}</span>
                  </div>
                  <Badge variant="outline">
                    {exercise.sets}x{exercise.reps || `${exercise.duration_seconds}s`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutSession;
