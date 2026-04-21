'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PasswordGate.module.css';

const PASSWORD = 'hungkiro!1';

type Mode   = 'auth' | 'command';
type Status = 'idle' | 'error' | 'success' | 'cmdError';

interface Props {
  mode: Mode;
  onUnlock: () => void;
}

export default function PasswordGate({ mode, onUnlock }: Props) {
  const router = useRouter();
  const [input, setInput]       = useState('');
  const [status, setStatus]     = useState<Status>('idle');
  const [attempts, setAttempts] = useState(0);
  const [cmdErr, setCmdErr]     = useState('');
  const [blink, setBlink]       = useState(true);
  const timerRef                = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* cursor blink */
  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(id);
  }, []);

  /* reset input when switching modes */
  useEffect(() => { setInput(''); setStatus('idle'); }, [mode]);

  const submitAuth = useCallback((raw: string) => {
    if (raw === PASSWORD) {
      setStatus('success');
      timerRef.current = setTimeout(() => { onUnlock(); setInput(''); }, 1200);
    } else {
      setAttempts(a => a + 1);
      setStatus('error');
      timerRef.current = setTimeout(() => { setStatus('idle'); setInput(''); }, 1000);
    }
  }, [onUnlock]);

  const submitCmd = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (cmd === 'chatai') {
      router.push('/chat');
    } else if (cmd === 'img') {
      router.push('/img');
    } else {
      setCmdErr(raw.trim());
      setStatus('cmdError');
      timerRef.current = setTimeout(() => { setStatus('idle'); setCmdErr(''); setInput(''); }, 1000);
    }
  }, [router]);

  useEffect(() => { return () => clearTimeout(timerRef.current); }, []);

  /* global keydown */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (status !== 'idle') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        mode === 'auth' ? submitAuth(input) : submitCmd(input);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setInput(p => p.slice(0, -1));
      } else if (e.key.length === 1 && input.length < 24) {
        e.preventDefault();
        setInput(p => p + e.key);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [input, status, mode, submitAuth, submitCmd]);

  /* display */
  const display = mode === 'auth' ? '█'.repeat(input.length) : input;

  /* label text */
  const label = (() => {
    if (mode === 'auth') {
      if (status === 'error')   return '✗ ACCESS DENIED — invalid passphrase';
      if (status === 'success') return '✓ IDENTITY VERIFIED — loading...';
      if (attempts > 0)         return `// attempt ${attempts} failed · try again`;
      return '// authentication required';
    }
    /* command mode */
    if (status === 'cmdError') return `// unknown command: ${cmdErr}`;
    return '// authenticated  ·  chatai  |  img';
  })();

  const labelCls = [
    styles.label,
    status === 'error'    ? styles.labelError   : '',
    status === 'success'  ? styles.labelSuccess  : '',
    status === 'cmdError' ? styles.labelCmdError : '',
  ].filter(Boolean).join(' ');

  const panelCls = [
    styles.panel,
    status === 'error' || status === 'cmdError' ? styles.shaking : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={panelCls}>
      <div className={labelCls}>{label}</div>

      <div className={styles.row}>
        <span className={styles.prompt}>
          [<span className={styles.user}>hungkiro</span>@terminal&nbsp;~]$
        </span>
        <span className={styles.field}>
          {display}
          <span className={`${styles.cur} ${blink && status === 'idle' ? styles.curOn : ''}`} />
        </span>
        <span className={styles.hint}>↵ enter</span>
      </div>

      {status === 'success' && <div className={styles.progressBar} />}
    </div>
  );
}
