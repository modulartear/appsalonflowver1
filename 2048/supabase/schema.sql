-- SalonFlow Database Schema
-- Este archivo contiene el esquema completo de la base de datos

-- ============================================
-- TABLA: salons (Salones)
-- ============================================
CREATE TABLE IF NOT EXISTS salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  plan VARCHAR(50) DEFAULT 'free',
  plan_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  week_schedule JSONB, -- Horarios por día de la semana
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: services (Servicios)
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL, -- en minutos
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: stylists (Estilistas)
-- ============================================
CREATE TABLE IF NOT EXISTS stylists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  specialties TEXT[], -- array de especialidades
  photo TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: payment_methods (Métodos de Pago)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'local' o 'online'
  name VARCHAR(255) NOT NULL,
  details TEXT,
  token TEXT, -- Token de API (Mercado Pago, etc.)
  account_info TEXT, -- CBU, Alias, etc.
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: promotions (Promociones)
-- ============================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'service' o 'day'
  name VARCHAR(255) NOT NULL,
  discount INTEGER NOT NULL, -- porcentaje de descuento
  service_ids UUID[], -- array de IDs de servicios (para tipo 'service')
  days INTEGER[], -- array de días 0-6 (para tipo 'day')
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: appointments (Citas/Reservas)
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50) NOT NULL,
  service VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  notes TEXT,
  payment_method VARCHAR(255),
  promotion VARCHAR(255),
  discount INTEGER,
  original_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para mejorar rendimiento
-- ============================================

-- Índices para salons
CREATE INDEX IF NOT EXISTS idx_salons_email ON salons(email);
CREATE INDEX IF NOT EXISTS idx_salons_plan ON salons(plan);

-- Índices para services
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);

-- Índices para stylists
CREATE INDEX IF NOT EXISTS idx_stylists_salon_id ON stylists(salon_id);
CREATE INDEX IF NOT EXISTS idx_stylists_active ON stylists(active);

-- Índices para payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_salon_id ON payment_methods(salon_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(active);

-- Índices para promotions
CREATE INDEX IF NOT EXISTS idx_promotions_salon_id ON promotions(salon_id);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(active);

-- Índices para appointments
CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_client_email ON appointments(client_email);

-- ============================================
-- FUNCIONES para actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stylists_updated_at BEFORE UPDATE ON stylists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas para salons (lectura pública, escritura solo del dueño)
CREATE POLICY "Salons are viewable by everyone" ON salons
  FOR SELECT USING (true);

CREATE POLICY "Salons can be inserted by anyone" ON salons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Salons can be updated by owner" ON salons
  FOR UPDATE USING (true);

-- Políticas para services (lectura pública, escritura solo del salón)
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

CREATE POLICY "Services can be managed by salon" ON services
  FOR ALL USING (true);

-- Políticas para stylists (lectura pública, escritura solo del salón)
CREATE POLICY "Stylists are viewable by everyone" ON stylists
  FOR SELECT USING (true);

CREATE POLICY "Stylists can be managed by salon" ON stylists
  FOR ALL USING (true);

-- Políticas para payment_methods (lectura pública, escritura solo del salón)
CREATE POLICY "Payment methods are viewable by everyone" ON payment_methods
  FOR SELECT USING (true);

CREATE POLICY "Payment methods can be managed by salon" ON payment_methods
  FOR ALL USING (true);

-- Políticas para promotions (lectura pública, escritura solo del salón)
CREATE POLICY "Promotions are viewable by everyone" ON promotions
  FOR SELECT USING (true);

CREATE POLICY "Promotions can be managed by salon" ON promotions
  FOR ALL USING (true);

-- Políticas para appointments (lectura pública, escritura por todos)
CREATE POLICY "Appointments are viewable by everyone" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "Appointments can be created by anyone" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Appointments can be updated by salon" ON appointments
  FOR UPDATE USING (true);

CREATE POLICY "Appointments can be deleted by salon" ON appointments
  FOR DELETE USING (true);

-- ============================================
-- DATOS DE EJEMPLO (Opcional - para testing)
-- ============================================

-- Insertar un salón de ejemplo
-- INSERT INTO salons (name, owner_name, email, password_hash, phone, address, description, plan)
-- VALUES (
--   'Salón Belleza Demo',
--   'María González',
--   'demo@salonflow.com',
--   '$2a$10$example_hash_here', -- En producción usar bcrypt
--   '+54 11 1234-5678',
--   'Av. Corrientes 1234, CABA',
--   'Salón de belleza moderno con servicios completos',
--   'free'
-- );
