'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './HomeEnterBtn.module.css';

export default function HomeEnterBtn() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(sessionStorage.getItem('hk_auth') === '1');
  }, []);

  if (!visible) return null;

  return (
    <button
      className={styles.btn}
      onClick={() => router.push('/chat')}
    >
      <span className={styles.arrow}>→</span>
      <span className={styles.label}>enter chat</span>
    </button>
  );
}
