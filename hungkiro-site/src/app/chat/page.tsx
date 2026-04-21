import ClientShell    from '@/components/ClientShell';
import ChatAuthGuard  from '@/components/ChatAuthGuard';
import ChatInterface  from '@/components/ChatInterface';
import ChatExitBtn    from '@/components/ChatExitBtn';
import styles         from './page.module.css';

export const metadata = { title: 'KIRO — Terminal Chat' };

export default function ChatPage() {
  return (
    <ChatAuthGuard>
      <ClientShell />

      {/* scanlines */}
      <div className={styles.scanlines} />
      <div className={styles.vignette} />

      {/* terminal frame */}
      <div className={styles.terminal}>

        {/* ── top bar ── */}
        <div className={styles.topbar}>
          <div className={styles.topLeft}>
            <span className={styles.topPath}>~/hungkiro</span>/chat&nbsp;·&nbsp;active
          </div>
          <div className={styles.topRight}>
            <span className={styles.badge}>KIRO AI</span>
            <span className={styles.topClock} id="chatClock" />
            <ChatExitBtn />
          </div>
        </div>

        {/* ── chat area ── */}
        <ChatInterface />

      </div>
    </ChatAuthGuard>
  );
}
