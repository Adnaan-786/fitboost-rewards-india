export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      challenges: {
        Row: {
          created_at: string | null
          description: string | null
          duration_days: number
          fitcoins_reward: number
          goal: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_days: number
          fitcoins_reward: number
          goal: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_days?: number
          fitcoins_reward?: number
          goal?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registration_date: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registration_date?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registration_date?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          current_participants: number | null
          description: string | null
          entry_fee: number | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          image_url: string | null
          latitude: number | null
          location_address: string
          location_name: string
          longitude: number | null
          max_participants: number | null
          organizer_id: string
          prize_pool: number | null
          registration_deadline: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          entry_fee?: number | null
          event_date: string
          event_time?: string | null
          event_type: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          location_address: string
          location_name: string
          longitude?: number | null
          max_participants?: number | null
          organizer_id: string
          prize_pool?: number | null
          registration_deadline?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          entry_fee?: number | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          location_address?: string
          location_name?: string
          longitude?: number | null
          max_participants?: number | null
          organizer_id?: string
          prize_pool?: number | null
          registration_deadline?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      exercise_logs: {
        Row: {
          completed_at: string | null
          duration_seconds: number | null
          exercise_id: string
          id: string
          notes: string | null
          reps: number | null
          set_number: number
          weight_kg: number | null
          workout_session_id: string
        }
        Insert: {
          completed_at?: string | null
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          notes?: string | null
          reps?: number | null
          set_number: number
          weight_kg?: number | null
          workout_session_id: string
        }
        Update: {
          completed_at?: string | null
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          notes?: string | null
          reps?: number | null
          set_number?: number
          weight_kg?: number | null
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_logs_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          calories_per_minute: number | null
          created_at: string | null
          description: string | null
          equipment: Database["public"]["Enums"]["equipment_type"]
          id: string
          image_url: string | null
          instructions: string | null
          muscle_group: Database["public"]["Enums"]["muscle_group"]
          name: string
          type: Database["public"]["Enums"]["exercise_type"]
          video_url: string | null
        }
        Insert: {
          calories_per_minute?: number | null
          created_at?: string | null
          description?: string | null
          equipment: Database["public"]["Enums"]["equipment_type"]
          id?: string
          image_url?: string | null
          instructions?: string | null
          muscle_group: Database["public"]["Enums"]["muscle_group"]
          name: string
          type: Database["public"]["Enums"]["exercise_type"]
          video_url?: string | null
        }
        Update: {
          calories_per_minute?: number | null
          created_at?: string | null
          description?: string | null
          equipment?: Database["public"]["Enums"]["equipment_type"]
          id?: string
          image_url?: string | null
          instructions?: string | null
          muscle_group?: Database["public"]["Enums"]["muscle_group"]
          name?: string
          type?: Database["public"]["Enums"]["exercise_type"]
          video_url?: string | null
        }
        Relationships: []
      }
      gyms: {
        Row: {
          address: string
          amenities: string[] | null
          created_at: string | null
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          price_range: string | null
          rating: number | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          price_range?: string | null
          rating?: number | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          price_range?: string | null
          rating?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          status: string | null
          total_price: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          status?: string | null
          total_price: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          status?: string | null
          total_price?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string | null
          email: string
          fitcoin_balance: number | null
          fitness_goal: string | null
          height: number | null
          id: string
          last_workout_date: string | null
          name: string
          profile_picture: string | null
          updated_at: string | null
          verified: boolean | null
          weight: number | null
          workout_streak: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          email: string
          fitcoin_balance?: number | null
          fitness_goal?: string | null
          height?: number | null
          id: string
          last_workout_date?: string | null
          name: string
          profile_picture?: string | null
          updated_at?: string | null
          verified?: boolean | null
          weight?: number | null
          workout_streak?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          email?: string
          fitcoin_balance?: number | null
          fitness_goal?: string | null
          height?: number | null
          id?: string
          last_workout_date?: string | null
          name?: string
          profile_picture?: string | null
          updated_at?: string | null
          verified?: boolean | null
          weight?: number | null
          workout_streak?: number | null
        }
        Relationships: []
      }
      reward_marketplace: {
        Row: {
          brand: string
          created_at: string | null
          description: string | null
          fitcoin_cost: number
          id: string
          product_image: string | null
          product_name: string
        }
        Insert: {
          brand: string
          created_at?: string | null
          description?: string | null
          fitcoin_cost: number
          id?: string
          product_image?: string | null
          product_name: string
        }
        Update: {
          brand?: string
          created_at?: string | null
          description?: string | null
          fitcoin_cost?: number
          id?: string
          product_image?: string | null
          product_name?: string
        }
        Relationships: []
      }
      scheduled_workouts: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          notes: string | null
          reminder_enabled: boolean | null
          reminder_minutes_before: number | null
          scheduled_date: string
          scheduled_time: string | null
          user_id: string
          user_workout_id: string | null
          workout_plan_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reminder_enabled?: boolean | null
          reminder_minutes_before?: number | null
          scheduled_date: string
          scheduled_time?: string | null
          user_id: string
          user_workout_id?: string | null
          workout_plan_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reminder_enabled?: boolean | null
          reminder_minutes_before?: number | null
          scheduled_date?: string
          scheduled_time?: string | null
          user_id?: string
          user_workout_id?: string | null
          workout_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_workouts_user_workout_id_fkey"
            columns: ["user_workout_id"]
            isOneToOne: false
            referencedRelation: "user_custom_workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_workouts_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      social_reels: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          likes: number | null
          user_id: string
          video_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          likes?: number | null
          user_id: string
          video_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          likes?: number | null
          user_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_reels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_bookings: {
        Row: {
          client_id: string
          created_at: string | null
          duration_minutes: number
          id: string
          notes: string | null
          payment_status: string | null
          session_date: string
          session_time: string
          session_type: string
          status: string | null
          total_price: number
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          duration_minutes: number
          id?: string
          notes?: string | null
          payment_status?: string | null
          session_date: string
          session_time: string
          session_type: string
          status?: string | null
          total_price: number
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          payment_status?: string | null
          session_date?: string
          session_time?: string
          session_type?: string
          status?: string | null
          total_price?: number
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_bookings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_conversations: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          last_message_at: string | null
          trainer_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          trainer_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_conversations_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          message_text: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          message_text: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          message_text?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      trainer_profiles: {
        Row: {
          availability_days: string[] | null
          bio: string | null
          business_name: string
          certifications: string[] | null
          cover_image_url: string | null
          created_at: string | null
          hourly_rate: number | null
          id: string
          latitude: number | null
          location_address: string | null
          location_city: string | null
          location_postal_code: string | null
          location_state: string | null
          longitude: number | null
          profile_image_url: string | null
          rating: number | null
          services_offered: string[] | null
          specialties: string[] | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
          years_experience: number | null
        }
        Insert: {
          availability_days?: string[] | null
          bio?: string | null
          business_name: string
          certifications?: string[] | null
          cover_image_url?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          latitude?: number | null
          location_address?: string | null
          location_city?: string | null
          location_postal_code?: string | null
          location_state?: string | null
          longitude?: number | null
          profile_image_url?: string | null
          rating?: number | null
          services_offered?: string[] | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          years_experience?: number | null
        }
        Update: {
          availability_days?: string[] | null
          bio?: string | null
          business_name?: string
          certifications?: string[] | null
          cover_image_url?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          latitude?: number | null
          location_address?: string | null
          location_city?: string | null
          location_postal_code?: string | null
          location_state?: string | null
          longitude?: number | null
          profile_image_url?: string | null
          rating?: number | null
          services_offered?: string[] | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          years_experience?: number | null
        }
        Relationships: []
      }
      trainer_reviews: {
        Row: {
          created_at: string | null
          id: string
          rating: number
          review_text: string | null
          trainer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rating: number
          review_text?: string | null
          trainer_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rating?: number
          review_text?: string | null
          trainer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_reviews_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_type: string
          calories: number | null
          created_at: string | null
          details: string | null
          id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          calories?: number | null
          created_at?: string | null
          details?: string | null
          id?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          calories?: number | null
          created_at?: string | null
          details?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          joined_at: string | null
          progress: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          progress?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          joined_at?: string | null
          progress?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_custom_workouts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_workout_exercises: {
        Row: {
          duration_seconds: number | null
          exercise_id: string
          id: string
          order_index: number
          reps: number | null
          rest_seconds: number | null
          sets: number | null
          user_workout_id: string
        }
        Insert: {
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          order_index: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          user_workout_id: string
        }
        Update: {
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          order_index?: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          user_workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_workout_exercises_user_workout_id_fkey"
            columns: ["user_workout_id"]
            isOneToOne: false
            referencedRelation: "user_custom_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plan_exercises: {
        Row: {
          duration_seconds: number | null
          exercise_id: string
          id: string
          order_index: number
          reps: number | null
          rest_seconds: number | null
          sets: number | null
          workout_plan_id: string
        }
        Insert: {
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          order_index: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          workout_plan_id: string
        }
        Update: {
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          order_index?: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plan_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plan_exercises_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: Database["public"]["Enums"]["difficulty_level"]
          duration_weeks: number | null
          estimated_duration_minutes: number | null
          id: string
          is_featured: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level: Database["public"]["Enums"]["difficulty_level"]
          duration_weeks?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["difficulty_level"]
          duration_weeks?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          name?: string
        }
        Relationships: []
      }
      workout_reminders: {
        Row: {
          created_at: string | null
          id: string
          reminder_time: string
          scheduled_workout_id: string | null
          sent: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reminder_time: string
          scheduled_workout_id?: string | null
          sent?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reminder_time?: string
          scheduled_workout_id?: string | null
          sent?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_reminders_scheduled_workout_id_fkey"
            columns: ["scheduled_workout_id"]
            isOneToOne: false
            referencedRelation: "scheduled_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          completed_at: string | null
          id: string
          notes: string | null
          started_at: string | null
          total_calories_burned: number | null
          total_duration_seconds: number | null
          user_id: string
          user_workout_id: string | null
          workout_plan_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          total_calories_burned?: number | null
          total_duration_seconds?: number | null
          user_id: string
          user_workout_id?: string | null
          workout_plan_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          total_calories_burned?: number | null
          total_duration_seconds?: number | null
          user_id?: string
          user_workout_id?: string | null
          workout_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_workout_id_fkey"
            columns: ["user_workout_id"]
            isOneToOne: false
            referencedRelation: "user_custom_workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          description: string | null
          duration: number
          id: string
          name: string
          type: string
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          name: string
          type: string
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_workout_streak: { Args: { p_user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      equipment_type:
        | "bodyweight"
        | "dumbbells"
        | "barbell"
        | "machine"
        | "resistance_bands"
        | "kettlebell"
        | "treadmill"
        | "bike"
        | "other"
      exercise_type: "cardio" | "strength" | "flexibility" | "sports"
      muscle_group:
        | "chest"
        | "back"
        | "legs"
        | "shoulders"
        | "arms"
        | "core"
        | "full_body"
        | "cardio"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      equipment_type: [
        "bodyweight",
        "dumbbells",
        "barbell",
        "machine",
        "resistance_bands",
        "kettlebell",
        "treadmill",
        "bike",
        "other",
      ],
      exercise_type: ["cardio", "strength", "flexibility", "sports"],
      muscle_group: [
        "chest",
        "back",
        "legs",
        "shoulders",
        "arms",
        "core",
        "full_body",
        "cardio",
      ],
    },
  },
} as const
