'use client';

import { useRouter } from 'next/navigation';
import styles from './ChatExitBtn.module.css';

export default function ChatExitBtn() {
  const router = useRouter();

  return (
    <button
      className={styles.btn}
      onClick={() => router.push('/')}
      title="Exit to home"
    >
      <span className={styles.icon}>×</span>
      <span className={styles.label}>exit</span>
    </button>
  );
}
