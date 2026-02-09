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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      custom_dashboards: {
        Row: {
          color: string | null
          created_at: string | null
          data_source: string
          description: string | null
          fields: Json | null
          formula: string
          icon: string | null
          id: string
          is_shared: boolean | null
          name: string
          order_position: number | null
          updated_at: string | null
          user_id: string
          visualization_type: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          data_source: string
          description?: string | null
          fields?: Json | null
          formula: string
          icon?: string | null
          id?: string
          is_shared?: boolean | null
          name: string
          order_position?: number | null
          updated_at?: string | null
          user_id: string
          visualization_type: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          data_source?: string
          description?: string | null
          fields?: Json | null
          formula?: string
          icon?: string | null
          id?: string
          is_shared?: boolean | null
          name?: string
          order_position?: number | null
          updated_at?: string | null
          user_id?: string
          visualization_type?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          attended_count: number | null
          capacity: number | null
          confirmed_count: number | null
          cost: number | null
          created_at: string | null
          event_date: string
          id: string
          leads_count: number | null
          location: string | null
          name: string
          negotiation_count: number | null
          notes: string | null
          organization_id: string
          purchased_count: number | null
          updated_at: string | null
        }
        Insert: {
          attended_count?: number | null
          capacity?: number | null
          confirmed_count?: number | null
          cost?: number | null
          created_at?: string | null
          event_date: string
          id?: string
          leads_count?: number | null
          location?: string | null
          name: string
          negotiation_count?: number | null
          notes?: string | null
          organization_id: string
          purchased_count?: number | null
          updated_at?: string | null
        }
        Update: {
          attended_count?: number | null
          capacity?: number | null
          confirmed_count?: number | null
          cost?: number | null
          created_at?: string | null
          event_date?: string
          id?: string
          leads_count?: number | null
          location?: string | null
          name?: string
          negotiation_count?: number | null
          notes?: string | null
          organization_id?: string
          purchased_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          created_at: string | null
          expense_date: string
          id: string
          name: string
          notes: string | null
          organization_id: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          expense_date?: string
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          expense_date?: string
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          interaction_date: string | null
          interaction_type: string
          lead_id: string
          next_action: string | null
          next_action_date: string | null
          organization_id: string
          outcome: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          interaction_date?: string | null
          interaction_type: string
          lead_id: string
          next_action?: string | null
          next_action_date?: string | null
          organization_id: string
          outcome?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          interaction_date?: string | null
          interaction_type?: string
          lead_id?: string
          next_action?: string | null
          next_action_date?: string | null
          organization_id?: string
          outcome?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_events: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          lead_id: string
          notes: string | null
          organization_id: string
          registered_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          lead_id: string
          notes?: string | null
          organization_id: string
          registered_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          lead_id?: string
          notes?: string | null
          organization_id?: string
          registered_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          cnpj: string | null
          company_name: string
          cpf: string | null
          created_at: string | null
          email: string | null
          event_id: string | null
          has_partner: boolean | null
          id: string
          lead_source: string
          name: string
          notes: string | null
          organization_id: string
          partner_name: string | null
          phone: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cnpj?: string | null
          company_name?: string
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          event_id?: string | null
          has_partner?: boolean | null
          id?: string
          lead_source?: string
          name: string
          notes?: string | null
          organization_id: string
          partner_name?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cnpj?: string | null
          company_name?: string
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          event_id?: string | null
          has_partner?: boolean | null
          id?: string
          lead_source?: string
          name?: string
          notes?: string | null
          organization_id?: string
          partner_name?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          theme_config: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          theme_config?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          theme_config?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          organization_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          organization_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          organization_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      revenues: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          revenue_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          revenue_date?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          revenue_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string | null
          expected_payment_date: string | null
          id: string
          installments_count: number | null
          installments_status: Json | null
          lead_id: string
          net_value: number
          notes: string | null
          organization_id: string
          outstanding_value: number
          paid_date: string | null
          payment_method: string | null
          payment_status: string | null
          product_id: string
          sale_date: string
          seller_name: string | null
          sold_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expected_payment_date?: string | null
          id?: string
          installments_count?: number | null
          installments_status?: Json | null
          lead_id: string
          net_value?: number
          notes?: string | null
          organization_id: string
          outstanding_value?: number
          paid_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_id: string
          sale_date?: string
          seller_name?: string | null
          sold_value?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expected_payment_date?: string | null
          id?: string
          installments_count?: number | null
          installments_status?: Json | null
          lead_id?: string
          net_value?: number
          notes?: string | null
          organization_id?: string
          outstanding_value?: number
          paid_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_id?: string
          sale_date?: string
          seller_name?: string | null
          sold_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_organization_id: { Args: never; Returns: string }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "comercial" | "financeiro" | "somente_leitura"
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
      app_role: ["admin", "comercial", "financeiro", "somente_leitura"],
    },
  },
} as const
