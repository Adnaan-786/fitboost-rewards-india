import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dumbbell, Search, Play } from "lucide-react";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_group: string;
  equipment: string;
  type: string;
  instructions: string;
  image_url: string | null;
  video_url: string | null;
  calories_per_minute: number;
}

const ExerciseLibrary = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery, muscleFilter, equipmentFilter, typeFilter]);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name");

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error("Failed to load exercises");
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (searchQuery) {
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (muscleFilter !== "all") {
      filtered = filtered.filter((ex) => ex.muscle_group === muscleFilter);
    }

    if (equipmentFilter !== "all") {
      filtered = filtered.filter((ex) => ex.equipment === equipmentFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((ex) => ex.type === typeFilter);
    }

    setFilteredExercises(filtered);
  };

  const getMuscleGroupColor = (group: string) => {
    const colors: Record<string, string> = {
      chest: "bg-red-500/20 text-red-500",
      back: "bg-blue-500/20 text-blue-500",
      legs: "bg-green-500/20 text-green-500",
      shoulders: "bg-yellow-500/20 text-yellow-500",
      arms: "bg-purple-500/20 text-purple-500",
      core: "bg-orange-500/20 text-orange-500",
      full_body: "bg-pink-500/20 text-pink-500",
      cardio: "bg-cyan-500/20 text-cyan-500",
    };
    return colors[group] || "bg-gray-500/20 text-gray-500";
  };

  if (loading) {
    return <div className="text-center py-12">Loading exercises...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={muscleFilter} onValueChange={setMuscleFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Muscle Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Muscles</SelectItem>
            <SelectItem value="chest">Chest</SelectItem>
            <SelectItem value="back">Back</SelectItem>
            <SelectItem value="legs">Legs</SelectItem>
            <SelectItem value="shoulders">Shoulders</SelectItem>
            <SelectItem value="arms">Arms</SelectItem>
            <SelectItem value="core">Core</SelectItem>
            <SelectItem value="full_body">Full Body</SelectItem>
            <SelectItem value="cardio">Cardio</SelectItem>
          </SelectContent>
        </Select>

        <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Equipment</SelectItem>
            <SelectItem value="bodyweight">Bodyweight</SelectItem>
            <SelectItem value="dumbbells">Dumbbells</SelectItem>
            <SelectItem value="barbell">Barbell</SelectItem>
            <SelectItem value="machine">Machine</SelectItem>
            <SelectItem value="resistance_bands">Resistance Bands</SelectItem>
            <SelectItem value="kettlebell">Kettlebell</SelectItem>
            <SelectItem value="treadmill">Treadmill</SelectItem>
            <SelectItem value="bike">Bike</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="cardio">Cardio</SelectItem>
            <SelectItem value="strength">Strength</SelectItem>
            <SelectItem value="flexibility">Flexibility</SelectItem>
            <SelectItem value="sports">Sports</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No exercises found matching your filters
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="backdrop-blur-sm bg-card/80 hover:bg-card/90 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Dumbbell className="w-8 h-8 icon-gradient" />
                  <Badge className={getMuscleGroupColor(exercise.muscle_group)}>
                    {exercise.muscle_group.replace("_", " ")}
                  </Badge>
                </div>
                <CardTitle className="mt-2">{exercise.name}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {exercise.equipment.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline">
                      {exercise.type}
                    </Badge>
                    <Badge variant="outline">
                      {exercise.calories_per_minute} cal/min
                    </Badge>
                  </div>
                  {exercise.instructions && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {exercise.instructions}
                    </p>
                  )}
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={() => {
                      setSelectedExercise(exercise);
                      setDetailsOpen(true);
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredExercises.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredExercises.length} of {exercises.length} exercises
        </div>
      )}

      {/* Exercise Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="w-6 h-6 icon-gradient" />
              {selectedExercise?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedExercise?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedExercise && (
            <div className="space-y-6">
              {/* Visual Content */}
              {(selectedExercise.video_url || selectedExercise.image_url) && (
                <div className="rounded-lg overflow-hidden bg-muted">
                  {selectedExercise.video_url ? (
                    <video
                      src={selectedExercise.video_url}
                      controls
                      loop
                      className="w-full aspect-video object-cover"
                      poster={selectedExercise.image_url || undefined}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : selectedExercise.image_url ? (
                    <img
                      src={selectedExercise.image_url}
                      alt={selectedExercise.name}
                      className="w-full aspect-video object-cover"
                    />
                  ) : null}
                </div>
              )}

              {/* Exercise Info Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getMuscleGroupColor(selectedExercise.muscle_group)}>
                  {selectedExercise.muscle_group.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  Equipment: {selectedExercise.equipment.replace("_", " ")}
                </Badge>
                <Badge variant="outline">
                  Type: {selectedExercise.type}
                </Badge>
                <Badge variant="outline">
                  {selectedExercise.calories_per_minute} cal/min
                </Badge>
              </div>
              
              {/* Instructions */}
              {selectedExercise.instructions && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">How to Perform</h4>
                  <div className="space-y-2">
                    {selectedExercise.instructions.split('\n').filter(line => line.trim()).map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-sm text-muted-foreground flex-1 pt-0.5">
                          {step.replace(/^\d+\.\s*/, '')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips Section */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm">💡 Pro Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Maintain proper form throughout the movement</li>
                  <li>Control the weight during both concentric and eccentric phases</li>
                  <li>Breathe steadily - exhale on exertion, inhale on release</li>
                  <li>Start with lighter weights to master the technique</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseLibrary;
