import GateShell     from '@/components/GateShell';
import ClientShell    from '@/components/ClientShell';
import FloatingRings  from '@/components/FloatingRings';
import TopBar         from '@/components/TopBar';
import NameBlock      from '@/components/NameBlock';
import StatusBar      from '@/components/StatusBar';
import styles         from './page.module.css';

export default function Home() {
  return (
    <GateShell>
      <ClientShell />
      <FloatingRings />

      <div className={styles.scanlines} />
      <div className={styles.vignette} />

      <div className={styles.sidebar}>
        <div className={styles.vline} />
        <span className={styles.sideLabel}>portfolio</span>
        <div className={styles.vline} />
      </div>

      <main className={styles.terminal}>
        <TopBar />
        <NameBlock />
        <StatusBar />
      </main>
    </GateShell>
  );
}
