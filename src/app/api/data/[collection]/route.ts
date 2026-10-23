import { jsonDb } from '@/lib/json-db';
import { jsonResponse } from '@/lib/utils';

// Solo lectura: el contenido se edita en los archivos de data/, nunca desde la red.
type Context = { params: Promise<{ collection: string }> };

const failure = (error: unknown) => {
  const message = error instanceof Error ? error.message : '';
  if (message === 'Invalid collection name') return jsonResponse({ error: 'Colección inválida' }, { status: 400 });
  if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return jsonResponse({ error: 'Colección no encontrada' }, { status: 404 });
  return jsonResponse({ error: 'Error inesperado' }, { status: 500 });
};

export async function GET(request: Request, { params }: Context) {
  try {
    const { collection } = await params;
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return jsonResponse(await jsonDb.getAll(collection));
    const record = await jsonDb.getById(collection, id);
    return record ? jsonResponse(record) : jsonResponse({ error: 'Registro no encontrado' }, { status: 404 });
  } catch (error) {
    return failure(error);
  }
}
