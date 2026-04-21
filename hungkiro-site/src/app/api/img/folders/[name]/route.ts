import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']);

function isImage(key: string) {
  const i = key.lastIndexOf('.');
  return i !== -1 && IMAGE_EXTS.has(key.slice(i).toLowerCase());
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { env } = getRequestContext<CloudflareEnv>();
  const bucket = env.BUCKET;
  const r2Url = process.env.NEXT_PUBLIC_R2_URL ?? '';

  const { name } = await params;
  const folder = name.replace(/[^a-zA-Z0-9_-]/g, '');

  const listed = await bucket.list({ prefix: `${folder}/` });
  const images = listed.objects
    .filter(o => isImage(o.key))
    .map(o => {
      const filename = o.key.slice(o.key.lastIndexOf('/') + 1);
      return {
        name: filename,
        url: `${r2Url}/${o.key}`,
        size: o.size,
        created: o.uploaded.getTime(),
      };
    })
    .sort((a, b) => b.created - a.created);

  return NextResponse.json({ images });
}
