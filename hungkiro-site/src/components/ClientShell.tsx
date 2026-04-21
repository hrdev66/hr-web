'use client';

import dynamic from 'next/dynamic';

const MatrixRain   = dynamic(() => import('./MatrixRain'),   { ssr: false });
const Cursor       = dynamic(() => import('./Cursor'),       { ssr: false });
const ParticleField = dynamic(() => import('./ParticleField'), { ssr: false });
const Spotlight    = dynamic(() => import('./Spotlight'),    { ssr: false });

export default function ClientShell() {
  return (
    <>
      <MatrixRain />
      <ParticleField />
      <Spotlight />
      <Cursor />
    </>
  );
}
