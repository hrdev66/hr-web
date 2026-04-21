'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const PasswordGate = dynamic(() => import('./PasswordGate'), { ssr: false });

interface Props {
  children: React.ReactNode;
}

export default function GateShell({ children }: Props) {
  const [mode, setMode] = useState<'auth' | 'command'>('auth');

  useEffect(() => {
    if (sessionStorage.getItem('hk_auth') === '1') {
      setMode('command');
    }
  }, []);

  const handleUnlock = () => {
    sessionStorage.setItem('hk_auth', '1');
    setMode('command');
  };

  return (
    <>
      {children}
      <PasswordGate mode={mode} onUnlock={handleUnlock} />
    </>
  );
}
