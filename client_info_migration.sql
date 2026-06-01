-- Ejecutar en el SQL Editor de Supabase
-- Añade columnas de información detallada del cliente a la tabla proyectos
-- Usa IF NOT EXISTS (Postgres 9.6+) para que sea seguro re-ejecutarlo

ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS client_contact_name text;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS client_company      text;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS client_email        text;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS client_phone        text;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS client_whatsapp     text;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS client_address      text;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS client_sector       text;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS client_tax_id       text;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS client_notes        text;
