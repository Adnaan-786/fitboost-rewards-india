import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import ExerciseLibrary from "@/components/workout/ExerciseLibrary";
import WorkoutPlans from "@/components/workout/WorkoutPlans";
import CustomWorkouts from "@/components/workout/CustomWorkouts";
import SeedDataButton from "@/components/admin/SeedDataButton";
import CleanupExercisesButton from "@/components/admin/CleanupExercisesButton";

const SelfWorkout = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("exercises");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="icon-gradient"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Self Workout</h1>
              <p className="text-muted-foreground">Your personal fitness library</p>
            </div>
          </div>
          <div className="flex gap-2">
            <CleanupExercisesButton />
            <SeedDataButton />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
            <TabsTrigger value="plans">Workout Plans</TabsTrigger>
            <TabsTrigger value="custom">My Workouts</TabsTrigger>
          </TabsList>

          <TabsContent value="exercises" className="space-y-4">
            <ExerciseLibrary />
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <WorkoutPlans />
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <CustomWorkouts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SelfWorkout;
