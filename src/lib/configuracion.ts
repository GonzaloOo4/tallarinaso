import 'server-only';
import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export const CONFIG_TAG = 'configuracion';
export const RESPETAR_REDUCIR_ANIMACIONES = 'respetar_reducir_animaciones';

/** Lee el ajuste sin caché (para el panel). Si falla, se asume false: animaciones siempre visibles. */
export const readRespetarReducirAnimaciones = async () => {
  try {
    const { data } = await createAdminClient()
      .from('configuracion')
      .select('valor')
      .eq('clave', RESPETAR_REDUCIR_ANIMACIONES)
      .maybeSingle<{ valor: unknown }>();
    return data?.valor === true;
  } catch {
    return false;
  }
};

/** Versión con caché para el sitio público; el panel la invalida al guardar. */
export const getRespetarReducirAnimaciones = unstable_cache(
  readRespetarReducirAnimaciones,
  [CONFIG_TAG, RESPETAR_REDUCIR_ANIMACIONES],
  { revalidate: 30, tags: [CONFIG_TAG] },
);
