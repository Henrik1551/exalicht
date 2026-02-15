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
      categories: {
        Row: {
          created_at: string
          id: string
          image: string | null
          name: string
          name_en: string | null
          parent_slug: string | null
          product_count: number | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          name: string
          name_en?: string | null
          parent_slug?: string | null
          product_count?: number | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          name_en?: string | null
          parent_slug?: string | null
          product_count?: number | null
          slug?: string
        }
        Relationships: []
      }
      round_config_prices: {
        Row: {
          id: string
          ulw_cm: number
          material: string
          optik: string
          schale: number
          hoehe_cm: number
          daemmung_mm: number
          luefterrahmen_variante: string
          lichtkuppel_preis: number
          aufsatzkranz_preis: number
          luefterrahmen_preis: number
          zusatzkosten: number
          total_preis: number
          created_at: string
        }
        Insert: {
          id?: string
          ulw_cm: number
          material: string
          optik: string
          schale: number
          hoehe_cm: number
          daemmung_mm: number
          luefterrahmen_variante: string
          lichtkuppel_preis?: number
          aufsatzkranz_preis?: number
          luefterrahmen_preis?: number
          zusatzkosten?: number
          total_preis?: number
          created_at?: string
        }
        Update: {
          id?: string
          ulw_cm?: number
          material?: string
          optik?: string
          schale?: number
          hoehe_cm?: number
          daemmung_mm?: number
          luefterrahmen_variante?: string
          lichtkuppel_preis?: number
          aufsatzkranz_preis?: number
          luefterrahmen_preis?: number
          zusatzkosten?: number
          total_preis?: number
          created_at?: string
        }
        Relationships: []
      }
      configurator_items: {
        Row: {
          article_number: string
          category: Database["public"]["Enums"]["configurator_category"]
          created_at: string
          description: string | null
          diameter_cm: number | null
          form: string | null
          height_cm: number | null
          id: string
          is_active: boolean | null
          length_cm: number | null
          material: string | null
          name: string
          price_unit: number | null
          purchase_price: number | null
          sale_price: number
          shells: number | null
          surface: string | null
          u_value: number | null
          updated_at: string
          wall_thickness_mm: number | null
          width_cm: number | null
        }
        Insert: {
          article_number: string
          category: Database["public"]["Enums"]["configurator_category"]
          created_at?: string
          description?: string | null
          diameter_cm?: number | null
          form?: string | null
          height_cm?: number | null
          id?: string
          is_active?: boolean | null
          length_cm?: number | null
          material?: string | null
          name: string
          price_unit?: number | null
          purchase_price?: number | null
          sale_price: number
          shells?: number | null
          surface?: string | null
          u_value?: number | null
          updated_at?: string
          wall_thickness_mm?: number | null
          width_cm?: number | null
        }
        Update: {
          article_number?: string
          category?: Database["public"]["Enums"]["configurator_category"]
          created_at?: string
          description?: string | null
          diameter_cm?: number | null
          form?: string | null
          height_cm?: number | null
          id?: string
          is_active?: boolean | null
          length_cm?: number | null
          material?: string | null
          name?: string
          price_unit?: number | null
          purchase_price?: number | null
          sale_price?: number
          shells?: number | null
          surface?: string | null
          u_value?: number | null
          updated_at?: string
          wall_thickness_mm?: number | null
          width_cm?: number | null
        }
        Relationships: []
      }
      configurator_quotes: {
        Row: {
          aufsatzkranz_item_id: string | null
          aufsatzkranz_price: number | null
          created_at: string
          durchsturzsicherung_item_id: string | null
          durchsturzsicherung_price: number | null
          form: string
          id: string
          lichtkuppel_item_id: string | null
          lichtkuppel_price: number | null
          luefterrahmen_item_id: string | null
          luefterrahmen_price: number | null
          quantity: number | null
          status: string | null
          subtotal: number | null
          updated_at: string
          user_id: string | null
          vormontage: boolean | null
        }
        Insert: {
          aufsatzkranz_item_id?: string | null
          aufsatzkranz_price?: number | null
          created_at?: string
          durchsturzsicherung_item_id?: string | null
          durchsturzsicherung_price?: number | null
          form: string
          id?: string
          lichtkuppel_item_id?: string | null
          lichtkuppel_price?: number | null
          luefterrahmen_item_id?: string | null
          luefterrahmen_price?: number | null
          quantity?: number | null
          status?: string | null
          subtotal?: number | null
          updated_at?: string
          user_id?: string | null
          vormontage?: boolean | null
        }
        Update: {
          aufsatzkranz_item_id?: string | null
          aufsatzkranz_price?: number | null
          created_at?: string
          durchsturzsicherung_item_id?: string | null
          durchsturzsicherung_price?: number | null
          form?: string
          id?: string
          lichtkuppel_item_id?: string | null
          lichtkuppel_price?: number | null
          luefterrahmen_item_id?: string | null
          luefterrahmen_price?: number | null
          quantity?: number | null
          status?: string | null
          subtotal?: number | null
          updated_at?: string
          user_id?: string | null
          vormontage?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "configurator_quotes_aufsatzkranz_item_id_fkey"
            columns: ["aufsatzkranz_item_id"]
            isOneToOne: false
            referencedRelation: "configurator_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "configurator_quotes_durchsturzsicherung_item_id_fkey"
            columns: ["durchsturzsicherung_item_id"]
            isOneToOne: false
            referencedRelation: "configurator_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "configurator_quotes_lichtkuppel_item_id_fkey"
            columns: ["lichtkuppel_item_id"]
            isOneToOne: false
            referencedRelation: "configurator_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "configurator_quotes_luefterrahmen_item_id_fkey"
            columns: ["luefterrahmen_item_id"]
            isOneToOne: false
            referencedRelation: "configurator_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json
          created_at: string
          customer_company: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          order_number: string
          shipping_address: Json
          shipping_cost: number
          status: string
          subtotal: number
          tax_amount: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address: Json
          created_at?: string
          customer_company?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number: string
          shipping_address: Json
          shipping_cost?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json
          created_at?: string
          customer_company?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          shipping_address?: Json
          shipping_cost?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          category_path: string | null
          created_at: string
          description: string | null
          gtin: string | null
          id: string
          images: string[] | null
          in_stock: boolean | null
          is_featured: boolean | null
          name: string
          parent_id: string | null
          price: number | null
          product_type: string | null
          short_description: string | null
          sku: string | null
          stock_quantity: number | null
          updated_at: string
          weight_kg: number | null
          woo_id: number | null
        }
        Insert: {
          category?: string | null
          category_path?: string | null
          created_at?: string
          description?: string | null
          gtin?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_featured?: boolean | null
          name: string
          parent_id?: string | null
          price?: number | null
          product_type?: string | null
          short_description?: string | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string
          weight_kg?: number | null
          woo_id?: number | null
        }
        Update: {
          category?: string | null
          category_path?: string | null
          created_at?: string
          description?: string | null
          gtin?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_featured?: boolean | null
          name?: string
          parent_id?: string | null
          price?: number | null
          product_type?: string | null
          short_description?: string | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string
          weight_kg?: number | null
          woo_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
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
      generate_order_number: { Args: never; Returns: string }
      get_round_config_price: {
        Args: {
          p_ulw_cm: number
          p_material: string
          p_optik: string
          p_schale: number
          p_hoehe_cm: number
          p_daemmung_mm: number
          p_luefterrahmen_variante: string
        }
        Returns: {
          lichtkuppel_preis: number
          aufsatzkranz_preis: number
          luefterrahmen_preis: number
          zusatzkosten: number
          total_preis: number
        }[]
      }
      get_round_luefterrahmen_variants: {
        Args: {
          p_ulw_cm: number
        }
        Returns: {
          luefterrahmen_variante: string
        }[]
      }
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
      configurator_category:
        | "lichtkuppel"
        | "aufsatzkranz"
        | "luefterrahmen"
        | "durchsturzsicherung"
        | "zubehoer"
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
      configurator_category: [
        "lichtkuppel",
        "aufsatzkranz",
        "luefterrahmen",
        "durchsturzsicherung",
        "zubehoer",
      ],
    },
  },
} as const
