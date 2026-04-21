import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import path from 'path';

const UPLOADS = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif']);
const MAX_SIZE = 20 * 1024 * 1024;

async function exists(p: string) {
  try { await access(p); return true; } catch { return false; }
}

export async function POST(req: NextRequest) {
  const form      = await req.formData();
  const folder    = (form.get('folder') as string | null)?.replace(/[^a-zA-Z0-9_-]/g, '');
  const file      = form.get('file') as File | null;
  const overwrite = form.get('overwrite') === 'true';

  if (!folder || !file)
    return NextResponse.json({ error: 'Missing folder or file' }, { status: 400 });
  if (!ALLOWED.has(file.type))
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: 'File too large (max 20 MB)' }, { status: 400 });

  const ext      = path.extname(file.name);
  const base     = path.basename(file.name, ext).replace(/[/\\:*?"<>|]/g, '').trim() || 'image';
  const fileName = `${base}${ext}`;
  const dir      = path.join(UPLOADS, folder);

  await mkdir(dir, { recursive: true });

  /* conflict check */
  if (!overwrite && await exists(path.join(dir, fileName))) {
    return NextResponse.json({ conflict: true, name: fileName }, { status: 409 });
  }

  await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ ok: true, name: fileName, url: `/uploads/${folder}/${fileName}` });
}
