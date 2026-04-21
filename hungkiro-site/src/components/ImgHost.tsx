'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './ImgHost.module.css';

interface Folder { name: string; count: number; }
interface ImgFile { name: string; url: string; size: number; }

interface ConfirmDialog {
  label: string;
  file: string;
  detail: string;
  confirmText: string;
  resolve: (yes: boolean) => void;
}

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function ImgHost() {
  const [folders, setFolders]     = useState<Folder[]>([]);
  const [active, setActive]       = useState<string | null>(null);
  const [images, setImages]       = useState<ImgFile[]>([]);
  const [newName, setNewName]     = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const [copied, setCopied]       = useState<string | null>(null);
  const [origin, setOrigin]       = useState('');
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [progress, setProgress]   = useState<Record<string, number>>({});
  const [dialog, setDialog]       = useState<ConfirmDialog | null>(null);
  const [preview, setPreview]     = useState<{ url: string; name: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPreview(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ── data fetching ── */
  const loadFolders = useCallback(async () => {
    const r = await fetch('/api/img/folders');
    const { folders } = await r.json() as { folders: Folder[] };
    setFolders(folders);
  }, []);

  const loadImages = useCallback(async (folder: string) => {
    const r = await fetch(`/api/img/folders/${folder}`);
    const { images } = await r.json() as { images: ImgFile[] };
    setImages(images);
  }, []);

  useEffect(() => { loadFolders(); }, [loadFolders]);
  useEffect(() => { if (active) loadImages(active); }, [active, loadImages]);

  /* ── generic confirm ── */
  const confirm = useCallback((opts: Omit<ConfirmDialog, 'resolve'>): Promise<boolean> => {
    return new Promise(resolve => setDialog({ ...opts, resolve }));
  }, []);

  const answerDialog = useCallback((yes: boolean) => {
    dialog?.resolve(yes);
    setDialog(null);
  }, [dialog]);

  /* ── create folder ── */
  const createFolder = async () => {
    const name = newName.trim();
    if (!name) return;
    await fetch('/api/img/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setNewName('');
    loadFolders();
  };

  /* ── upload files ── */
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    if (!active) return;
    setUploading(true);
    const arr = Array.from(files);
    for (const file of arr) {
      const key = file.name;
      setProgress(p => ({ ...p, [key]: 0 }));

      const upload = async (overwrite: boolean) => {
        const fd = new FormData();
        fd.append('folder', active);
        fd.append('file', file);
        if (overwrite) fd.append('overwrite', 'true');
        return fetch('/api/img/upload', { method: 'POST', body: fd });
      };

      const res = await upload(false);
      if (res.status === 409) {
        const { name } = await res.json() as { name: string };
        const yes = await confirm({
          label: '// conflict detected',
          file: name,
          detail: 'file already exists · overwrite?',
          confirmText: '↵ overwrite',
        });
        if (yes) await upload(true);
      }

      setProgress(p => { const n = { ...p }; delete n[key]; return n; });
    }
    setUploading(false);
    loadImages(active);
    loadFolders();
  }, [active, loadImages, loadFolders, confirm]);

  /* ── delete image ── */
  const deleteImg = useCallback(async (name: string) => {
    if (!active) return;
    const yes = await confirm({
      label: '// confirm delete',
      file: name,
      detail: 'this action cannot be undone',
      confirmText: '× delete',
    });
    if (!yes) return;
    setDeleting(name);
    await fetch('/api/img/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: active, name }),
    });
    setDeleting(null);
    loadImages(active);
    loadFolders();
  }, [active, loadImages, loadFolders, confirm]);

  /* ── copy URL ── */
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const fullUrl = (url: string) => `${origin}${url}`;
  const mdUrl   = (url: string, name: string) => `![${name}](${origin}${url})`;

  return (
    <div className={styles.host}>

      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTitle}>// folders</div>
        <div className={styles.divider} />

        <div className={styles.folderList}>
          {folders.length === 0 && (
            <div className={styles.empty}>no folders yet</div>
          )}
          {folders.map(f => (
            <div
              key={f.name}
              className={`${styles.folderRow} ${active === f.name ? styles.folderActive : ''}`}
              onClick={() => setActive(f.name)}
            >
              <span className={styles.folderArrow}>{active === f.name ? '▾' : '▸'}</span>
              <span className={styles.folderName}>{f.name}/</span>
              <span className={styles.folderCount}>{f.count}</span>
            </div>
          ))}
        </div>

        <div className={styles.divider} />

        {/* new folder */}
        <div className={styles.newFolderRow}>
          <span className={styles.plus}>+</span>
          <input
            className={styles.newFolderInput}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createFolder()}
            placeholder="new folder..."
            spellCheck={false}
          />
          <button className={styles.newFolderBtn} onClick={createFolder}>↵</button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className={styles.main}>
        {!active ? (
          <div className={styles.noFolder}>
            <span className={styles.noFolderIcon}>▸</span>
            <span>// select a folder</span>
          </div>
        ) : (
          <>
            {/* header */}
            <div className={styles.mainHeader}>
              <span className={styles.mainTitle}>// {active}/</span>
              <span className={styles.mainCount}>{images.length} images</span>
              <button
                className={styles.folderLinkBtn}
                onClick={() => copy(`${origin}/uploads/${active}/`, `folder-${active}`)}
              >
                {copied === `folder-${active}` ? '✓ copied' : '⎘ folder url'}
              </button>
            </div>

            {/* upload zone */}
            <div
              className={`${styles.dropZone} ${dragOver ? styles.dropOver : ''} ${uploading ? styles.dropUploading : ''}`}
              onClick={() => !uploading && fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault(); setDragOver(false);
                if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
              }}
            >
              {uploading
                ? `// uploading ${Object.keys(progress).length} file(s)...`
                : '// drag & drop · or click to upload  (jpg png gif webp svg avif · max 20 MB)'}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => e.target.files && uploadFiles(e.target.files)}
              />
            </div>

            {/* image grid */}
            {images.length === 0 ? (
              <div className={styles.noImages}>// no images in this folder</div>
            ) : (
              <div className={styles.grid}>
                {images.map(img => (
                  <div key={img.name} className={styles.card}>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.name}
                      className={styles.thumb}
                      loading="lazy"
                      onClick={() => setPreview({ url: fullUrl(img.url), name: img.name })}
                    />

                    <div className={styles.cardInfo}>
                      <div className={styles.cardName}>{img.name}</div>
                      <div className={styles.cardSize}>{fmtSize(img.size)}</div>
                      <div className={styles.cardUrl} title={fullUrl(img.url)}>
                        {fullUrl(img.url)}
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.actBtn}
                        onClick={() => copy(fullUrl(img.url), `url-${img.name}`)}
                      >
                        {copied === `url-${img.name}` ? '✓ copied' : '⎘ url'}
                      </button>
                      <button
                        className={styles.actBtn}
                        onClick={() => copy(mdUrl(img.url, img.name), `md-${img.name}`)}
                      >
                        {copied === `md-${img.name}` ? '✓ copied' : '⎘ md'}
                      </button>
                      <button
                        className={`${styles.actBtn} ${styles.actDel}`}
                        onClick={() => deleteImg(img.name)}
                        disabled={deleting === img.name}
                      >
                        {deleting === img.name ? '...' : '×'}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ═══ LIGHTBOX ═══ */}
      {preview && (
        <div className={styles.lightboxOverlay} onClick={() => setPreview(null)}>
          <div className={styles.lightboxInner} onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.url} alt={preview.name} className={styles.lightboxImg} />
            <div className={styles.lightboxBar}>
              <span className={styles.lightboxName}>{preview.name}</span>
              <button className={styles.lightboxClose} onClick={() => setPreview(null)}>× close</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONFIRM DIALOG ═══ */}
      {dialog && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <div className={styles.confirmLabel}>{dialog.label}</div>
            <div className={styles.confirmFile}>{dialog.file}</div>
            <div className={styles.confirmDetail}>{dialog.detail}</div>
            <div className={styles.confirmActions}>
              <button className={styles.confirmYes} onClick={() => answerDialog(true)}>
                {dialog.confirmText}
              </button>
              <button className={styles.confirmNo} onClick={() => answerDialog(false)}>
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
