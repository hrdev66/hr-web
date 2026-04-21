'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatAuthGuard({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const [ready, setReady] = useState(false);

  /* auth check */
  useEffect(() => {
    if (sessionStorage.getItem('hk_auth') !== '1') {
      router.replace('/');
    } else {
      setReady(true);
    }
  }, [router]);

  /* live clock injected into #chatClock span */
  useEffect(() => {
    if (!ready) return;
    const tick = () => {
      const el = document.getElementById('chatClock');
      if (!el) return;
      const d = new Date();
      const p = (v: number) => String(v).padStart(2, '0');
      el.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [ready]);

  if (!ready) return null;
  return <>{children}</>;
}
