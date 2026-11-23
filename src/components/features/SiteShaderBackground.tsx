'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const SiteCloudShader = dynamic(() => import('./SiteCloudShader'), { ssr: false });

export default function SiteShaderBackground() {
  const pathname = usePathname();
  const backdropRef = useRef<HTMLDivElement>(null);
  const [shaderReady, setShaderReady] = useState(false);

  useEffect(() => {
    if (pathname !== '/' || shaderReady) return;

    let cancelStart: (() => void) | undefined;
    const scheduleStart = () => {
      if (typeof window.requestIdleCallback === 'function') {
        const id = window.requestIdleCallback(() => setShaderReady(true), { timeout: 2000 });
        cancelStart = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(() => setShaderReady(true), 100);
        cancelStart = () => window.clearTimeout(id);
      }
    };

    if (document.readyState === 'complete') {
      scheduleStart();
    } else {
      window.addEventListener('load', scheduleStart, { once: true });
    }

    return () => {
      window.removeEventListener('load', scheduleStart);
      cancelStart?.();
    };
  }, [pathname, shaderReady]);

  return (
    <div
      ref={backdropRef}
      aria-hidden="true"
      data-testid="site-shader-background"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
    >
      <Image
        data-testid="site-cloud-fallback"
        src="/images/background/clouds-fallback.webp"
        alt=""
        fill
        sizes="100vw"
        fetchPriority="low"
        className="object-cover object-[56%_48%] md:object-[50%_44%]"
      />

      {pathname === '/' && shaderReady ? <SiteCloudShader backdropRef={backdropRef} /> : null}

      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}
