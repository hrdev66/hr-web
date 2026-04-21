import ClientShell   from '@/components/ClientShell';
import ChatAuthGuard  from '@/components/ChatAuthGuard';
import ChatExitBtn    from '@/components/ChatExitBtn';
import ImgHost        from '@/components/ImgHost';
import styles         from './page.module.css';

export const metadata = { title: 'IMG HOST — Terminal Storage' };

export default function ImgPage() {
  return (
    <ChatAuthGuard>
      <ClientShell />

      <div className={styles.scanlines} />
      <div className={styles.vignette} />

      <div className={styles.terminal}>

        {/* topbar */}
        <div className={styles.topbar}>
          <div className={styles.topLeft}>
            <span className={styles.topPath}>~/hungkiro</span>/img&nbsp;·&nbsp;storage
          </div>
          <div className={styles.topRight}>
            <span className={styles.badge}>IMG HOST</span>
            <ChatExitBtn />
          </div>
        </div>

        {/* main */}
        <ImgHost />

      </div>
    </ChatAuthGuard>
  );
}
