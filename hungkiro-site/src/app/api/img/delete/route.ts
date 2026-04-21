import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

const UPLOADS = path.join(process.cwd(), 'public', 'uploads');

export async function DELETE(req: NextRequest) {
  const { folder, name } = await req.json() as { folder: string; name: string };

  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
  const safeName   = path.basename(name);               // strip any path traversal

  if (!safeFolder || !safeName) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  try {
    await unlink(path.join(UPLOADS, safeFolder, safeName));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
