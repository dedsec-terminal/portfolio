'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';

const SiteCloudShader = dynamic(() => import('./SiteCloudShader'), { ssr: false });

export default function SiteShaderBackground() {
  const pathname = usePathname();
  const backdropRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={backdropRef}
      aria-hidden="true"
      data-testid="site-shader-background"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
    >
      <Image
        data-testid="site-cloud-fallback"
        src="/images/background/clouds.webp"
        alt=""
        fill
        sizes="100vw"
        fetchPriority="low"
        className="object-cover object-[56%_48%] md:object-[50%_44%]"
      />

      {pathname === '/' ? <SiteCloudShader backdropRef={backdropRef} /> : null}

      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}
