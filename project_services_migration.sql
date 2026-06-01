-- Ejecutar en el SQL Editor de Supabase
-- Crea la tabla de servicios adicionales por proyecto

CREATE TABLE IF NOT EXISTS project_services (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id     uuid        NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  type           text        NOT NULL CHECK (type IN ('google_business', 'google_ads')),
  enabled        boolean     NOT NULL DEFAULT false,
  status         text        CHECK (status IN ('activo', 'pausado', 'cancelado', 'pendiente')),
  -- Google Business
  price          numeric     CHECK (price >= 0),
  client_has_existing_profile boolean,
  profile_url    text,
  -- Google Ads
  monthly_budget numeric     CHECK (monthly_budget >= 0),
  monthly_fee    numeric     CHECK (monthly_fee >= 0),
  campaign_type  text        CHECK (campaign_type IN ('search', 'display', 'shopping', 'video', 'performance_max')),
  start_date     date,
  -- Shared
  notes          text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  -- Un registro por tipo y proyecto (evita duplicados)
  UNIQUE (project_id, type)
);

-- Habilitar Row Level Security (igual que el resto de tablas)
ALTER TABLE project_services ENABLE ROW LEVEL SECURITY;

-- Política: el usuario autenticado puede ver y modificar sus propios servicios
CREATE POLICY "Users can manage their own project services"
  ON project_services
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM proyectos WHERE user_id = auth.uid()
    )
  );
