import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

const UPLOADS = path.join(process.cwd(), 'public', 'uploads');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const folder = name.replace(/[^a-zA-Z0-9_-]/g, '');
  const folderPath = path.join(UPLOADS, folder);

  try {
    const files = await readdir(folderPath);
    const images = await Promise.all(
      files
        .filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
        .map(async f => {
          const s = await stat(path.join(folderPath, f));
          return {
            name: f,
            url: `/uploads/${folder}/${f}`,
            size: s.size,
            created: s.birthtimeMs,
          };
        })
    );
    images.sort((a, b) => b.created - a.created);
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
