-- Ejecutar en el SQL Editor de Supabase
-- Añade columnas de información económica y mantenimiento a la tabla proyectos
-- Usa IF NOT EXISTS para que sea seguro re-ejecutarlo

ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS web_price               numeric CHECK (web_price >= 0);
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS amount_paid             numeric CHECK (amount_paid >= 0);
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS payment_status          text    CHECK (payment_status IN ('pendiente','senal_pagada','parcialmente_pagado','completamente_pagado','cancelado'));
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS has_maintenance         boolean DEFAULT false;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS maintenance_monthly_fee numeric CHECK (maintenance_monthly_fee >= 0);
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS maintenance_status      text    CHECK (maintenance_status IN ('no_contratado','activo','pausado','cancelado'));
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS maintenance_start_date  date;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS maintenance_notes       text;
