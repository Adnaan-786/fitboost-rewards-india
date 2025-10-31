import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, GripVertical, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
}

interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps?: number;
  duration_seconds?: number;
  rest_seconds: number;
  order_index: number;
}

const WorkoutBuilder = () => {
  const navigate = useNavigate();
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name, muscle_group, equipment")
        .order("name");

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error("Failed to load exercises");
    }
  };

  const addExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      exercise,
      sets: 3,
      reps: 10,
      rest_seconds: 60,
      order_index: selectedExercises.length,
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setIsExerciseDialogOpen(false);
  };

  const removeExercise = (index: number) => {
    const updated = selectedExercises.filter((_, i) => i !== index);
    // Update order indices
    updated.forEach((ex, i) => {
      ex.order_index = i;
    });
    setSelectedExercises(updated);
  };

  const updateExercise = (index: number, field: string, value: number) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      toast.error("Please enter a workout name");
      return;
    }

    if (selectedExercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to save workouts");
        return;
      }

      // Create custom workout
      const { data: workout, error: workoutError } = await supabase
        .from("user_custom_workouts")
        .insert({
          user_id: user.id,
          name: workoutName,
          description: workoutDescription,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Add exercises to workout
      const exercisesToInsert = selectedExercises.map((ex) => ({
        user_workout_id: workout.id,
        exercise_id: ex.exercise.id,
        order_index: ex.order_index,
        sets: ex.sets,
        reps: ex.reps,
        duration_seconds: ex.duration_seconds,
        rest_seconds: ex.rest_seconds,
      }));

      const { error: exercisesError } = await supabase
        .from("user_workout_exercises")
        .insert(exercisesToInsert);

      if (exercisesError) throw exercisesError;

      toast.success("Workout saved successfully!");
      navigate("/self-workout");
    } catch (error) {
      console.error("Error saving workout:", error);
      toast.error("Failed to save workout");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/self-workout")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Workout Builder</h1>
            <p className="text-muted-foreground">Create your custom workout routine</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Workout Details */}
          <Card className="backdrop-blur-sm bg-card/80">
            <CardHeader>
              <CardTitle>Workout Details</CardTitle>
              <CardDescription>Give your workout a name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Workout Name</Label>
                <Input
                  id="name"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="e.g., Morning Full Body Blast"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={workoutDescription}
                  onChange={(e) => setWorkoutDescription(e.target.value)}
                  placeholder="Describe your workout..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Exercises */}
          <Card className="backdrop-blur-sm bg-card/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Exercises</CardTitle>
                  <CardDescription>Build your workout routine</CardDescription>
                </div>
                <Dialog open={isExerciseDialogOpen} onOpenChange={setIsExerciseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exercise
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Select Exercise</DialogTitle>
                      <DialogDescription>
                        Choose an exercise to add to your workout
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {exercises.map((exercise) => (
                        <Card
                          key={exercise.id}
                          className="cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => addExercise(exercise)}
                        >
                          <CardHeader>
                            <CardTitle className="text-base">{exercise.name}</CardTitle>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                {exercise.muscle_group}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {exercise.equipment}
                              </Badge>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {selectedExercises.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No exercises added yet. Click "Add Exercise" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedExercises.map((workoutEx, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <GripVertical className="w-5 h-5 text-muted-foreground mt-2" />
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{workoutEx.exercise.name}</h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeExercise(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label className="text-xs">Sets</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={workoutEx.sets}
                                  onChange={(e) =>
                                    updateExercise(index, "sets", parseInt(e.target.value))
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Reps</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={workoutEx.reps || ""}
                                  onChange={(e) =>
                                    updateExercise(index, "reps", parseInt(e.target.value))
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Rest (sec)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={workoutEx.rest_seconds}
                                  onChange={(e) =>
                                    updateExercise(index, "rest_seconds", parseInt(e.target.value))
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button className="w-full" size="lg" onClick={saveWorkout}>
            <Save className="w-5 h-5 mr-2" />
            Save Workout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutBuilder;
