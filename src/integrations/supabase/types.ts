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
      journal_entries: {
        Row: {
          ai_insight: string | null
          confidence_level: number
          created_at: string
          currency_pair: string | null
          during_trade: string | null
          emotion: Database["public"]["Enums"]["emotion_type"]
          emotion_intensity: number
          entry_date: string
          id: string
          market_condition:
            | Database["public"]["Enums"]["market_condition"]
            | null
          outcome: Database["public"]["Enums"]["trade_outcome"] | null
          post_trade: string | null
          pre_trade: string | null
          profit_loss: number | null
          reflection_prompt: string | null
          sentiment: string | null
          sentiment_score: number | null
          stop_loss_pips: number | null
          tags: string[] | null
          take_profit_pips: number | null
          trade_type: Database["public"]["Enums"]["trade_type"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_insight?: string | null
          confidence_level?: number
          created_at?: string
          currency_pair?: string | null
          during_trade?: string | null
          emotion?: Database["public"]["Enums"]["emotion_type"]
          emotion_intensity?: number
          entry_date?: string
          id?: string
          market_condition?:
            | Database["public"]["Enums"]["market_condition"]
            | null
          outcome?: Database["public"]["Enums"]["trade_outcome"] | null
          post_trade?: string | null
          pre_trade?: string | null
          profit_loss?: number | null
          reflection_prompt?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          stop_loss_pips?: number | null
          tags?: string[] | null
          take_profit_pips?: number | null
          trade_type?: Database["public"]["Enums"]["trade_type"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_insight?: string | null
          confidence_level?: number
          created_at?: string
          currency_pair?: string | null
          during_trade?: string | null
          emotion?: Database["public"]["Enums"]["emotion_type"]
          emotion_intensity?: number
          entry_date?: string
          id?: string
          market_condition?:
            | Database["public"]["Enums"]["market_condition"]
            | null
          outcome?: Database["public"]["Enums"]["trade_outcome"] | null
          post_trade?: string | null
          pre_trade?: string | null
          profit_loss?: number | null
          reflection_prompt?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          stop_loss_pips?: number | null
          tags?: string[] | null
          take_profit_pips?: number | null
          trade_type?: Database["public"]["Enums"]["trade_type"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          created_at: string
          emotion: Database["public"]["Enums"]["emotion_type"]
          id: string
          intensity: number
          log_date: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          emotion: Database["public"]["Enums"]["emotion_type"]
          id?: string
          intensity?: number
          log_date?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          emotion?: Database["public"]["Enums"]["emotion_type"]
          id?: string
          intensity?: number
          log_date?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reflection_responses: {
        Row: {
          category: string
          created_at: string
          id: string
          prompt_id: string
          prompt_text: string
          response: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          prompt_id: string
          prompt_text: string
          response: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          prompt_id?: string
          prompt_text?: string
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      app_role: "admin" | "moderator" | "user"
      emotion_type:
        | "confident"
        | "anxious"
        | "calm"
        | "stressed"
        | "excited"
        | "fearful"
        | "focused"
        | "frustrated"
        | "neutral"
      market_condition: "trending" | "ranging" | "volatile" | "calm"
      trade_outcome: "profit" | "loss" | "breakeven"
      trade_type: "long" | "short" | "scalp" | "swing" | "day"
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
      app_role: ["admin", "moderator", "user"],
      emotion_type: [
        "confident",
        "anxious",
        "calm",
        "stressed",
        "excited",
        "fearful",
        "focused",
        "frustrated",
        "neutral",
      ],
      market_condition: ["trending", "ranging", "volatile", "calm"],
      trade_outcome: ["profit", "loss", "breakeven"],
      trade_type: ["long", "short", "scalp", "swing", "day"],
    },
  },
} as const
