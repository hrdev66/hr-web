import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function DELETE(req: NextRequest) {
  const { env } = getRequestContext<CloudflareEnv>();
  const bucket = env.BUCKET;

  const { folder, name } = await req.json() as { folder: string; name: string };

  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
  const safeName = name.split('/').pop() ?? '';

  if (!safeFolder || !safeName) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  const key = `${safeFolder}/${safeName}`;
  const existing = await bucket.head(key);
  if (!existing) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  await bucket.delete(key);
  return NextResponse.json({ ok: true });
}
