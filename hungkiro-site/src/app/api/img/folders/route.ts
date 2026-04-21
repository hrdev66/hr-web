import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']);

function isImage(key: string) {
  const i = key.lastIndexOf('.');
  return i !== -1 && IMAGE_EXTS.has(key.slice(i).toLowerCase());
}

export async function GET() {
  const { env } = getRequestContext<CloudflareEnv>();
  const bucket = env.BUCKET;

  const listed = await bucket.list({ delimiter: '/' });
  const folders = await Promise.all(
    listed.delimitedPrefixes.map(async (prefix) => {
      const name = prefix.replace(/\/$/, '');
      const contents = await bucket.list({ prefix });
      const count = contents.objects.filter(o => isImage(o.key)).length;
      return { name, count };
    })
  );

  return NextResponse.json({ folders });
}

export async function POST(req: NextRequest) {
  const { env } = getRequestContext<CloudflareEnv>();
  const bucket = env.BUCKET;

  const { name } = await req.json() as { name: string };
  const safe = name.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
  if (!safe) return NextResponse.json({ error: 'Invalid name' }, { status: 400 });

  // R2 has no real folders — create a placeholder to make the prefix visible
  await bucket.put(`${safe}/.keep`, '', { httpMetadata: { contentType: 'text/plain' } });
  return NextResponse.json({ ok: true, name: safe });
}
