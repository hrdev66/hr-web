import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif']);
const MAX_SIZE = 20 * 1024 * 1024;

function extname(filename: string) {
  const i = filename.lastIndexOf('.');
  return i === -1 ? '' : filename.slice(i);
}

function basename(filename: string, ext: string) {
  const name = filename.slice(0, filename.length - ext.length);
  return name.replace(/[/\\:*?"<>|]/g, '').trim() || 'image';
}

export async function POST(req: NextRequest) {
  const { env } = getRequestContext<CloudflareEnv>();
  const bucket = env.BUCKET;
  const r2Url = process.env.NEXT_PUBLIC_R2_URL ?? '';

  const form = await req.formData();
  const folder = (form.get('folder') as string | null)?.replace(/[^a-zA-Z0-9_-]/g, '');
  const file = form.get('file') as File | null;
  const overwrite = form.get('overwrite') === 'true';

  if (!folder || !file)
    return NextResponse.json({ error: 'Missing folder or file' }, { status: 400 });
  if (!ALLOWED.has(file.type))
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: 'File too large (max 20 MB)' }, { status: 400 });

  const ext = extname(file.name);
  const base = basename(file.name, ext);
  const fileName = `${base}${ext}`;
  const key = `${folder}/${fileName}`;

  if (!overwrite) {
    const existing = await bucket.head(key);
    if (existing) {
      return NextResponse.json({ conflict: true, name: fileName }, { status: 409 });
    }
  }

  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return NextResponse.json({ ok: true, name: fileName, url: `${r2Url}/${key}` });
}
