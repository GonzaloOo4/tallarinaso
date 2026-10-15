import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Cliente con la clave secreta: ignora RLS. Solo se usa en el servidor y
// siempre después de validar la sesión del panel (requireAdmin).
export const createAdminClient = () => {
  const url = process.env.SUPABASE_URL ?? process.env.TallarinasoSUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Faltan SUPABASE_URL o SUPABASE_SECRET_KEY.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
};
