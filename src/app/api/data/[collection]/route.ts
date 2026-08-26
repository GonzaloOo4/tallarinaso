import { jsonDb } from '@/lib/json-db';
import { jsonResponse } from '@/lib/utils';

type Context = { params: Promise<{ collection: string }> };

const failure = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  const status = message === 'Record not found' ? 404 : message === 'Invalid collection name' ? 400 : 500;
  return jsonResponse({ error: message }, { status });
};

export async function GET(request: Request, { params }: Context) {
  try {
    const { collection } = await params;
    const id = new URL(request.url).searchParams.get('id');
    const records = id ? await jsonDb.getById(collection, id) : await jsonDb.getAll(collection);
    return jsonResponse(records);
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const { collection } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    return jsonResponse(await jsonDb.create(collection, body as never), { status: 201 });
  } catch (error) {
    return failure(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const { collection } = await params;
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return jsonResponse({ error: 'Query parameter id is required' }, { status: 400 });
    return jsonResponse(await jsonDb.update(collection, id, (await request.json()) as never));
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const { collection } = await params;
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return jsonResponse({ error: 'Query parameter id is required' }, { status: 400 });
    const removed = await jsonDb.remove(collection, id);
    return removed ? jsonResponse({ success: true }) : jsonResponse({ error: 'Record not found' }, { status: 404 });
  } catch (error) {
    return failure(error);
  }
}
