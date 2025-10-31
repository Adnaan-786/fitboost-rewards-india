import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

const StreakTracker = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [weekDays, setWeekDays] = useState<{ date: Date; hasWorkout: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch current streak using the database function
      const { data: streakData, error: streakError } = await supabase.rpc(
        "calculate_workout_streak",
        { p_user_id: user.id }
      );

      if (streakError) throw streakError;
      setCurrentStreak(streakData || 0);

      // Fetch total completed workouts
      const { count: totalCount, error: totalError } = await supabase
        .from("workout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("completed_at", "is", null);

      if (totalError) throw totalError;
      setTotalWorkouts(totalCount || 0);

      // Fetch this week's workouts
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());

      const { count: weekCount, error: weekError } = await supabase
        .from("workout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .gte("completed_at", weekStart.toISOString())
        .lte("completed_at", weekEnd.toISOString());

      if (weekError) throw weekError;
      setWeeklyWorkouts(weekCount || 0);

      // Get workout data for last 7 days for visualization
      const { data: recentSessions, error: recentError } = await supabase
        .from("workout_sessions")
        .select("completed_at")
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .gte("completed_at", subDays(new Date(), 7).toISOString());

      if (recentError) throw recentError;

      // Create array of last 7 days with workout status
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const hasWorkout = recentSessions?.some(
          (session) =>
            format(new Date(session.completed_at!), "yyyy-MM-dd") ===
            format(date, "yyyy-MM-dd")
        );
        return { date, hasWorkout: hasWorkout || false };
      });

      setWeekDays(days);
    } catch (error) {
      console.error("Error fetching streak data:", error);
      toast.error("Failed to load streak data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading streak data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="backdrop-blur-sm bg-card/80">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <div className="text-3xl font-bold">{currentStreak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-card/80">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-3xl font-bold">{weeklyWorkouts}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-card/80">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Trophy className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-3xl font-bold">{totalWorkouts}</div>
                <div className="text-sm text-muted-foreground">Total Workouts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card className="backdrop-blur-sm bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-2">
                  {format(day.date, "EEE")}
                </div>
                <div
                  className={`h-16 rounded-lg flex items-center justify-center transition-all ${
                    day.hasWorkout
                      ? "bg-green-500/20 border-2 border-green-500"
                      : "bg-muted/50"
                  }`}
                >
                  {day.hasWorkout && (
                    <Flame className="w-6 h-6 text-green-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(day.date, "d")}
                </div>
              </div>
            ))}
          </div>

          {currentStreak > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-center font-semibold text-orange-500">
                🔥 Keep it up! You're on a {currentStreak}-day streak!
              </p>
            </div>
          )}

          {currentStreak === 0 && totalWorkouts > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-center font-semibold text-blue-500">
                💪 Complete a workout today to start your streak!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Motivational Badges */}
      <Card className="backdrop-blur-sm bg-card/80">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {totalWorkouts >= 1 && (
              <Badge variant="outline" className="px-4 py-2 text-base">
                🎯 First Workout
              </Badge>
            )}
            {totalWorkouts >= 5 && (
              <Badge variant="outline" className="px-4 py-2 text-base">
                💪 5 Workouts
              </Badge>
            )}
            {totalWorkouts >= 10 && (
              <Badge variant="outline" className="px-4 py-2 text-base">
                🏆 10 Workouts
              </Badge>
            )}
            {currentStreak >= 3 && (
              <Badge variant="outline" className="px-4 py-2 text-base">
                🔥 3-Day Streak
              </Badge>
            )}
            {currentStreak >= 7 && (
              <Badge variant="outline" className="px-4 py-2 text-base">
                ⭐ 7-Day Streak
              </Badge>
            )}
            {currentStreak >= 30 && (
              <Badge variant="outline" className="px-4 py-2 text-base">
                👑 30-Day Streak
              </Badge>
            )}
            {totalWorkouts === 0 && (
              <p className="text-muted-foreground">
                Complete workouts to unlock achievements!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakTracker;
