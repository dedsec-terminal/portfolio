/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HeroShaderBackground from './HeroShaderBackground';

vi.mock('@paper-design/shaders-react', async () => {
  const ReactModule = await import('react');

  return {
    ShaderMount: ReactModule.forwardRef<
      HTMLDivElement,
      React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>
    >(function MockShaderMount(props, ref) {
      const htmlProps = { ...props };
      delete htmlProps.fragmentShader;
      delete htmlProps.uniforms;
      delete htmlProps.mipmaps;
      delete htmlProps.speed;
      delete htmlProps.minPixelRatio;
      delete htmlProps.maxPixelCount;
      delete htmlProps.webGlContextAttributes;

      return (
        <div
          ref={ref}
          {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}
        />
      );
    }),
  };
});

vi.mock('next/image', () => ({
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      fill?: boolean;
      preload?: boolean;
      sizes?: string;
    }
  ) => {
    const imageProps = { ...props };
    delete imageProps.fill;
    delete imageProps.preload;
    delete imageProps.sizes;

    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imageProps} alt={imageProps.alt ?? ''} />;
  },
}));

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

describe('HeroShaderBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReducedMotion(false);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      getExtension: vi.fn().mockReturnValue(null),
    } as unknown as WebGL2RenderingContext);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('always renders an accessible decorative fallback image', () => {
    render(<HeroShaderBackground />);

    const background = screen.getByTestId('hero-shader-background');
    const fallback = screen.getByTestId('hero-cloud-fallback');

    expect(background.getAttribute('aria-hidden')).toBe('true');
    expect(fallback.getAttribute('alt')).toBe('');
    expect(fallback.getAttribute('src')).toBe('/images/hero/cloud.jpg');
  });

  it('mounts the WebGL shader when motion and WebGL2 are available', async () => {
    render(<HeroShaderBackground />);

    await waitFor(() => {
      expect(screen.getByTestId('hero-cloud-shader')).toBeDefined();
    });
  });

  it('keeps the static fallback when reduced motion is requested', async () => {
    mockReducedMotion(true);
    render(<HeroShaderBackground />);

    expect(screen.queryByTestId('hero-cloud-shader')).toBeNull();
    expect(screen.getByTestId('hero-cloud-fallback')).toBeDefined();
  });

  it('keeps the static fallback when WebGL2 is unavailable', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    render(<HeroShaderBackground />);

    expect(screen.queryByTestId('hero-cloud-shader')).toBeNull();
    expect(screen.getByTestId('hero-cloud-fallback')).toBeDefined();
  });
});
