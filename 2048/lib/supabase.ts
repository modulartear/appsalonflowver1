import { createClient } from '@supabase/supabase-js';

// Verificar que las variables de entorno estén configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Por favor configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local'
  );
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de base de datos (generados automáticamente desde el esquema)
export interface Database {
  public: {
    Tables: {
      salons: {
        Row: {
          id: string;
          name: string;
          owner_name: string;
          email: string;
          password_hash: string;
          phone: string;
          address: string;
          description: string | null;
          plan: string;
          plan_start_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['salons']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['salons']['Insert']>;
      };
      services: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          duration: number;
          price: number;
          description: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
      };
      stylists: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          specialties: string[];
          photo: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['stylists']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['stylists']['Insert']>;
      };
      payment_methods: {
        Row: {
          id: string;
          salon_id: string;
          type: string;
          name: string;
          details: string | null;
          token: string | null;
          account_info: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payment_methods']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payment_methods']['Insert']>;
      };
      promotions: {
        Row: {
          id: string;
          salon_id: string;
          type: string;
          name: string;
          discount: number;
          service_ids: string[] | null;
          days: number[] | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['promotions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['promotions']['Insert']>;
      };
      appointments: {
        Row: {
          id: string;
          salon_id: string;
          client_name: string;
          client_email: string;
          client_phone: string;
          service: string;
          date: string;
          time: string;
          status: string;
          notes: string | null;
          payment_method: string | null;
          promotion: string | null;
          discount: number | null;
          original_price: number | null;
          final_price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>;
      };
    };
  };
}
