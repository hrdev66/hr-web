'use client';

import { useEffect, useRef } from 'react';
import styles from './NameBlock.module.css';

export default function NameBlock() {
  const innerRef = useRef<HTMLDivElement>(null);
  const tgt = useRef({ rx: 0, ry: 0 });
  const cur = useRef({ rx: 0, ry: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      tgt.current.rx = -(e.clientY - cy) / cy * 11;
      tgt.current.ry =  (e.clientX - cx) / cx * 11;
    };
    window.addEventListener('mousemove', onMove);

    const tick = () => {
      cur.current.rx = lerp(cur.current.rx, tgt.current.rx, 0.06);
      cur.current.ry = lerp(cur.current.ry, tgt.current.ry, 0.06);
      if (innerRef.current) {
        innerRef.current.style.transform =
          `perspective(900px) rotateX(${cur.current.rx}deg) rotateY(${cur.current.ry}deg)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className={styles.center}>
      <div ref={innerRef} className={styles.inner}>

        <p className={`${styles.comment} ${styles.c1}`}>
          {'// identity.render()'}
        </p>
        <p className={`${styles.comment} ${styles.c2}`}>
          {'/* author: hungkiro · version: 1.0.0 */'}
        </p>

        <div className={styles.nameWrap}>
          {/* Chromatic aberration ghost layers */}
          <div className={`${styles.nameText} ${styles.nameHung} ${styles.caRed}`}  aria-hidden>HÙNG</div>
          <div className={`${styles.nameText} ${styles.nameHung} ${styles.caBlue}`} aria-hidden>HÙNG</div>
          {/* Real text + reveal mask */}
          <div className={`${styles.nameText} ${styles.nameHung}`}>
            HÙNG
            <div className={styles.mask} />
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.nameWrap}>
          <div className={`${styles.nameText} ${styles.nameKiro} ${styles.caRed}`}  aria-hidden>KIRO</div>
          <div className={`${styles.nameText} ${styles.nameKiro} ${styles.caBlue}`} aria-hidden>KIRO</div>
          <div className={`${styles.nameText} ${styles.nameKiro}`}>
            KIRO
            <div className={styles.mask} />
            <span className={styles.blockCur} />
          </div>
        </div>

        <p className={`${styles.comment} ${styles.c3}`}>
          {'// design · code · create'}
        </p>
        <p className={`${styles.comment} ${styles.c4}`}>
          {'// return <Excellence />'}
        </p>

      </div>
    </div>
  );
}
