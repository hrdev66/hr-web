'use client';

import { useEffect, useState } from 'react';
import styles from './TopBar.module.css';

export default function TopBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const n   = new Date();
      const pad = (v: number) => String(v).padStart(2, '0');
      setTime(`${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.path}>~/hungkiro</span>
        /portfolio&nbsp;·&nbsp;main
      </div>
      <div className={styles.right}>
        <span className={styles.clock}>{time}</span>
        <div className={styles.dots}>
          <div className={styles.dot} />
          <div className={`${styles.dot} ${styles.dotMid}`} />
          <div className={`${styles.dot} ${styles.dotDim}`} />
        </div>
      </div>
    </div>
  );
}
