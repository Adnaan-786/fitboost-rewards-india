import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import WorkoutCalendar from "@/components/workout-day/WorkoutCalendar";
import WorkoutHistory from "@/components/workout-day/WorkoutHistory";
import StreakTracker from "@/components/workout-day/StreakTracker";

const WorkoutDay = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="icon-gradient"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Workout Day</h1>
            <p className="text-muted-foreground">Schedule, track, and review your fitness journey</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="streak">Streak</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <WorkoutCalendar />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <WorkoutHistory />
          </TabsContent>

          <TabsContent value="streak" className="space-y-4">
            <StreakTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkoutDay;
