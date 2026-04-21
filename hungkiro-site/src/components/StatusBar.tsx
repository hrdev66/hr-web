import styles from './StatusBar.module.css';

export default function StatusBar() {
  return (
    <div className={styles.statusbar}>
      <div className={styles.left}>
        <span className={styles.mode}>INSERT</span>
        &nbsp;·&nbsp;UTF-8&nbsp;·&nbsp;LF
      </div>
      <div className={styles.badge}>HÙNG KIRO</div>
      <div className={styles.right}>
        Ln 3, Col 9&nbsp;·&nbsp;© 2026
      </div>
    </div>
  );
}
