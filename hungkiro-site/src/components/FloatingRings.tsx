import styles from './FloatingRings.module.css';

export default function FloatingRings() {
  return (
    <div className={styles.scene}>
      <div className={`${styles.ring} ${styles.r1}`} />
      <div className={`${styles.ring} ${styles.r2}`} />
      <div className={`${styles.ring} ${styles.r3}`} />
      <div className={`${styles.ring} ${styles.r4}`} />
      {/* Dot orbiting ring 1 */}
      <div className={styles.orbit1}>
        <div className={styles.orbitDot} />
      </div>
      <div className={styles.orbit2}>
        <div className={`${styles.orbitDot} ${styles.orbitDot2}`} />
      </div>
    </div>
  );
}
