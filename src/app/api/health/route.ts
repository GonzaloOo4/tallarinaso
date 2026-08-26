import { jsonResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export function GET() {
  return jsonResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  });
}
