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
        Relationships: []
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
    },
  },
} as const
