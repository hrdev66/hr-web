import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readdir } from 'fs/promises';
import path from 'path';

const UPLOADS = path.join(process.cwd(), 'public', 'uploads');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']);

export async function GET() {
  try {
    await mkdir(UPLOADS, { recursive: true });
    const entries = await readdir(UPLOADS, { withFileTypes: true });
    const folders = await Promise.all(
      entries.filter(e => e.isDirectory()).map(async e => {
        const files = await readdir(path.join(UPLOADS, e.name));
        const count = files.filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase())).length;
        return { name: e.name, count };
      })
    );
    return NextResponse.json({ folders });
  } catch {
    return NextResponse.json({ folders: [] });
  }
}

export async function POST(req: NextRequest) {
  const { name } = await req.json() as { name: string };
  const safe = name.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
  if (!safe) return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  await mkdir(path.join(UPLOADS, safe), { recursive: true });
  return NextResponse.json({ ok: true, name: safe });
}
