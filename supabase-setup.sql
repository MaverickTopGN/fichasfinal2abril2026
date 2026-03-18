-- Tabla de recibos
CREATE TABLE recibos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_archivo TEXT NOT NULL,
  ruta_archivo TEXT NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  operador TEXT NOT NULL CHECK (operador IN ('NT', 'JOSUE', 'LS')),
  fecha DATE NOT NULL,
  notas TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_recibos_fecha ON recibos(fecha);
CREATE INDEX idx_recibos_operador ON recibos(operador);

-- RLS (permisivo para MVP sin auth)
ALTER TABLE recibos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON recibos FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket para PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('recibos-pdf', 'recibos-pdf', true);
CREATE POLICY "Allow public upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recibos-pdf');
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id = 'recibos-pdf');
CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE USING (bucket_id = 'recibos-pdf');
