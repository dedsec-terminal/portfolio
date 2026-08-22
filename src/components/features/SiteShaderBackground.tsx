'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ShaderMount } from '@paper-design/shaders-react';
import {
  ShaderFitOptions,
  waterFragmentShader,
  type PaperShaderElement,
} from '@paper-design/shaders';

const CLOUD_IMAGE = '/images/background/clouds.webp';
const PULSE_DURATION_MS = 1400;
const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, [role="button"], [data-shader-ignore]';
const SITE_INTERACTION_STRENGTH = 0.52;

const cloudFragmentShader = waterFragmentShader
  .replace(
    'uniform float u_waves;',
    `uniform float u_waves;

uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_pointerStrength;
uniform vec2 u_pulseOrigin;
uniform float u_pulseProgress;
uniform float u_pulseStrength;`
  )
  .replace(
    'vec2 imageUV = v_imageUV;',
    `vec2 imageUV = v_imageUV;

  vec2 surfaceUV = gl_FragCoord.xy / max(u_resolution, vec2(1.));
  vec2 surfaceAspect = vec2(u_resolution.x / max(u_resolution.y, 1.), 1.);

  vec2 pointerDelta = (surfaceUV - u_pointer) * surfaceAspect;
  float pointerDistance = length(pointerDelta);
  vec2 pointerDirection = pointerDelta / max(pointerDistance, .0001);
  float pointerEnvelope = exp(-pointerDistance * pointerDistance * 22.);
  float pointerWave = sin(pointerDistance * 48. - u_time * 7.);
  pointerWave *= pointerEnvelope * u_pointerStrength * .008;

  vec2 pulseDelta = (surfaceUV - u_pulseOrigin) * surfaceAspect;
  float pulseDistance = length(pulseDelta);
  vec2 pulseDirection = pulseDelta / max(pulseDistance, .0001);
  float pulseRadius = u_pulseProgress * length(surfaceAspect) * 1.1;
  float pulseRing = exp(-pow((pulseDistance - pulseRadius) * 30., 2.));
  float pulseWave = cos((pulseDistance - pulseRadius) * 60.);
  pulseWave *= pulseRing * u_pulseStrength * .018;

  vec2 interactionOffset =
    (pointerDirection * pointerWave + pulseDirection * pulseWave) /
    surfaceAspect;
  interactionOffset.y *= -1.;
  imageUV += interactionOffset;`
  );

const baseUniforms = {
  u_image: CLOUD_IMAGE,
  u_colorBack: [0, 0, 0, 1],
  u_colorHighlight: [0.945, 0.929, 0.902, 1],
  u_highlights: 0.14,
  u_layering: 0.2,
  u_waves: 0.5,
  u_edges: 0.8,
  u_caustic: 0.03,
  u_size: 1.4,
  u_fit: ShaderFitOptions.cover,
  u_rotation: 0,
  u_scale: 1.08,
  u_offsetX: 0,
  u_offsetY: 0,
  u_originX: 0.5,
  u_originY: 0.5,
  u_worldWidth: 0,
  u_worldHeight: 0,
  u_pointer: [0.5, 0.5],
  u_pointerStrength: 0,
  u_pulseOrigin: [0.5, 0.5],
  u_pulseProgress: 0,
  u_pulseStrength: 0,
};

type InteractionState = {
  currentPointerStrength: number;
  targetPointerStrength: number;
  pulseStartedAt: number | null;
  pulseOrigin: [number, number];
  pulseScale: number;
  rafId: number | null;
  lastFrameAt: number;
};

type RenderProfile = {
  maxPixelCount: number;
  offsetX: number;
  offsetY: number;
  scale: number;
};

const desktopProfile: RenderProfile = {
  maxPixelCount: 2_073_600,
  offsetX: 0,
  offsetY: -0.025,
  scale: 1.08,
};

function getRenderProfile(): RenderProfile {
  if (window.innerHeight > window.innerWidth) {
    return {
      maxPixelCount: 1_048_576,
      offsetX: -0.055,
      offsetY: 0,
      scale: 1.04,
    };
  }

  return desktopProfile;
}

function supportsWebGL2() {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return context !== null;
  } catch {
    return false;
  }
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  if (
    target instanceof HTMLCanvasElement &&
    document.body.style.cursor === 'pointer'
  ) {
    return true;
  }

  return target.closest(INTERACTIVE_SELECTOR) !== null;
}

function interactionStrengthAt(clientX: number, clientY: number) {
  const hero = document.querySelector<HTMLElement>('[data-shader-zone="hero"]');
  const bounds = hero?.getBoundingClientRect();

  if (
    bounds &&
    clientX >= bounds.left &&
    clientX <= bounds.right &&
    clientY >= bounds.top &&
    clientY <= bounds.bottom
  ) {
    return 1;
  }

  return SITE_INTERACTION_STRENGTH;
}

export default function SiteShaderBackground() {
  const backdropRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<PaperShaderElement>(null);
  const interactionRef = useRef<InteractionState>({
    currentPointerStrength: 0,
    targetPointerStrength: 0,
    pulseStartedAt: null,
    pulseOrigin: [0.5, 0.5],
    pulseScale: SITE_INTERACTION_STRENGTH,
    rafId: null,
    lastFrameAt: 0,
  });
  const [shaderEnabled, setShaderEnabled] = useState(false);
  const [shaderReady, setShaderReady] = useState(false);
  const [renderProfile, setRenderProfile] =
    useState<RenderProfile>(desktopProfile);

  const shaderUniforms = useMemo(
    () => ({
      ...baseUniforms,
      u_scale: renderProfile.scale,
      u_offsetX: renderProfile.offsetX,
      u_offsetY: renderProfile.offsetY,
    }),
    [renderProfile]
  );

  const updateShaderUniforms = useCallback(
    (uniforms: Record<string, number | number[]>) => {
      shaderRef.current?.paperShaderMount?.setUniforms(uniforms);
    },
    []
  );

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncCapability = () => {
      setShaderReady(false);
      setShaderEnabled(!reducedMotion.matches && supportsWebGL2());
    };

    const syncRenderProfile = () => setRenderProfile(getRenderProfile());

    syncCapability();
    syncRenderProfile();
    reducedMotion.addEventListener('change', syncCapability);
    window.addEventListener('resize', syncRenderProfile, { passive: true });

    return () => {
      reducedMotion.removeEventListener('change', syncCapability);
      window.removeEventListener('resize', syncRenderProfile);
    };
  }, []);

  useEffect(() => {
    if (!shaderEnabled || !shaderRef.current) return;

    const shaderElement = shaderRef.current;
    let canvas: HTMLCanvasElement | null = null;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setShaderReady(false);
      setShaderEnabled(false);
    };

    const detectCanvas = () => {
      const nextCanvas = shaderElement.querySelector('canvas');
      if (!nextCanvas || nextCanvas === canvas) return;

      canvas?.removeEventListener('webglcontextlost', handleContextLost);
      canvas = nextCanvas;
      canvas.addEventListener('webglcontextlost', handleContextLost);
      setShaderReady(true);
    };

    const observer = new MutationObserver(detectCanvas);
    observer.observe(shaderElement, { childList: true });
    detectCanvas();

    return () => {
      observer.disconnect();
      canvas?.removeEventListener('webglcontextlost', handleContextLost);
    };
  }, [shaderEnabled]);

  useEffect(() => {
    if (!shaderEnabled) return;

    const interaction = interactionRef.current;

    const renderInteraction = (now: number) => {
      const elapsed = interaction.lastFrameAt
        ? Math.min(50, now - interaction.lastFrameAt)
        : 16;
      interaction.lastFrameAt = now;

      const smoothing = 1 - Math.exp(-elapsed / 110);
      interaction.currentPointerStrength +=
        (interaction.targetPointerStrength -
          interaction.currentPointerStrength) *
        smoothing;

      let pulseProgress = 0;
      let pulseStrength = 0;
      if (interaction.pulseStartedAt !== null) {
        pulseProgress = Math.min(
          1,
          (now - interaction.pulseStartedAt) / PULSE_DURATION_MS
        );
        pulseStrength = (1 - pulseProgress) * interaction.pulseScale;
        if (pulseProgress >= 1) interaction.pulseStartedAt = null;
      }

      updateShaderUniforms({
        u_pointerStrength: interaction.currentPointerStrength,
        u_pulseOrigin: interaction.pulseOrigin,
        u_pulseProgress: pulseProgress,
        u_pulseStrength: pulseStrength,
      });

      const pointerIsSettled =
        Math.abs(
          interaction.targetPointerStrength - interaction.currentPointerStrength
        ) < 0.002;

      if (!pointerIsSettled || interaction.pulseStartedAt !== null) {
        interaction.rafId = requestAnimationFrame(renderInteraction);
      } else {
        interaction.currentPointerStrength = interaction.targetPointerStrength;
        interaction.rafId = null;
        interaction.lastFrameAt = 0;
      }
    };

    const requestInteractionFrame = () => {
      if (interaction.rafId === null) {
        interaction.rafId = requestAnimationFrame(renderInteraction);
      }
    };

    const getPoint = (event: PointerEvent): [number, number] | null => {
      const bounds = backdropRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        return null;
      }

      return [
        (event.clientX - bounds.left) / bounds.width,
        1 - (event.clientY - bounds.top) / bounds.height,
      ];
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;

      const point = getPoint(event);
      const shouldInteract =
        point !== null && !isInteractiveTarget(event.target);
      interaction.targetPointerStrength = shouldInteract
        ? interactionStrengthAt(event.clientX, event.clientY)
        : 0;

      if (point) updateShaderUniforms({ u_pointer: point });
      requestInteractionFrame();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const point = getPoint(event);
      if (!point || isInteractiveTarget(event.target)) return;

      interaction.pulseOrigin = point;
      interaction.pulseStartedAt = performance.now();
      interaction.pulseScale = interactionStrengthAt(
        event.clientX,
        event.clientY
      );
      updateShaderUniforms({
        u_pulseOrigin: point,
        u_pulseProgress: 0,
        u_pulseStrength: interaction.pulseScale,
      });
      requestInteractionFrame();
    };

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    window.addEventListener('pointerdown', handlePointerDown, {
      passive: true,
    });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (interaction.rafId !== null) cancelAnimationFrame(interaction.rafId);
      interaction.rafId = null;
      interaction.lastFrameAt = 0;
    };
  }, [shaderEnabled, updateShaderUniforms]);

  return (
    <div
      ref={backdropRef}
      aria-hidden="true"
      data-testid="site-shader-background"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
    >
      <Image
        data-testid="site-cloud-fallback"
        src={CLOUD_IMAGE}
        alt=""
        fill
        sizes="100vw"
        preload
        className="object-cover object-[56%_48%] md:object-[50%_44%]"
      />

      {shaderEnabled ? (
        <ShaderMount
          ref={shaderRef}
          data-testid="site-cloud-shader"
          fragmentShader={cloudFragmentShader}
          uniforms={shaderUniforms}
          mipmaps={['u_image']}
          speed={0.14}
          minPixelRatio={1}
          maxPixelCount={renderProfile.maxPixelCount}
          webGlContextAttributes={{
            alpha: false,
            antialias: false,
            powerPreference: 'high-performance',
          }}
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
            shaderReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : null}

      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}
