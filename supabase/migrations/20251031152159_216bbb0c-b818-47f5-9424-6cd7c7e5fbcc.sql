-- Create scheduled workouts table (future workout plans)
CREATE TABLE scheduled_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE SET NULL,
  user_workout_id UUID REFERENCES user_custom_workouts(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_minutes_before INTEGER DEFAULT 30,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout reminders table
CREATE TABLE workout_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scheduled_workout_id UUID REFERENCES scheduled_workouts(id) ON DELETE CASCADE,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE scheduled_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled_workouts
CREATE POLICY "Users can view their own scheduled workouts" 
  ON scheduled_workouts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled workouts" 
  ON scheduled_workouts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled workouts" 
  ON scheduled_workouts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled workouts" 
  ON scheduled_workouts FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for workout_reminders
CREATE POLICY "Users can view their own reminders" 
  ON workout_reminders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
  ON workout_reminders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
  ON workout_reminders FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_scheduled_workouts_user_id ON scheduled_workouts(user_id);
CREATE INDEX idx_scheduled_workouts_scheduled_date ON scheduled_workouts(scheduled_date);
CREATE INDEX idx_workout_reminders_user_id ON workout_reminders(user_id);
CREATE INDEX idx_workout_reminders_reminder_time ON workout_reminders(reminder_time);

-- Function to calculate workout streak
CREATE OR REPLACE FUNCTION calculate_workout_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE;
BEGIN
  -- Start from today and count backwards
  v_check_date := v_current_date;
  
  LOOP
    -- Check if user worked out on this date
    IF EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE user_id = p_user_id 
        AND completed_at IS NOT NULL
        AND DATE(completed_at) = v_check_date
    ) THEN
      v_streak := v_streak + 1;
      v_check_date := v_check_date - INTERVAL '1 day';
    ELSE
      -- If today and no workout yet, don't break streak
      IF v_check_date = v_current_date THEN
        v_check_date := v_check_date - INTERVAL '1 day';
        CONTINUE;
      END IF;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_streak;
END;
$$;