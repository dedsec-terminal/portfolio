/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SiteShaderBackground from './SiteShaderBackground';

const { setUniformsMock } = vi.hoisted(() => ({
  setUniformsMock: vi.fn(),
}));

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

      const assignRef = (node: HTMLDivElement | null) => {
        if (node) {
          Object.assign(node, {
            paperShaderMount: { setUniforms: setUniformsMock },
          });
        }

        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      };

      return <div ref={assignRef} {...htmlProps} />;
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

const viewportRect = {
  bottom: 800,
  height: 800,
  left: 0,
  right: 1000,
  top: 0,
  width: 1000,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

describe('SiteShaderBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReducedMotion(false);
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      getExtension: vi.fn().mockReturnValue(null),
    } as unknown as WebGL2RenderingContext);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('always renders an accessible decorative fallback image', () => {
    render(<SiteShaderBackground />);

    const background = screen.getByTestId('site-shader-background');
    const fallback = screen.getByTestId('site-cloud-fallback');

    expect(background.getAttribute('aria-hidden')).toBe('true');
    expect(background.className).toContain('fixed');
    expect(fallback.getAttribute('alt')).toBe('');
    expect(fallback.getAttribute('src')).toBe('/images/background/clouds.webp');
  });

  it('mounts the WebGL shader when motion and WebGL2 are available', async () => {
    render(<SiteShaderBackground />);

    await waitFor(() => {
      expect(screen.getByTestId('site-cloud-shader')).toBeDefined();
    });
  });

  it('uses full interaction in the hero and softer interaction elsewhere', async () => {
    const { container } = render(
      <>
        <section data-shader-zone="hero" />
        <SiteShaderBackground />
      </>
    );
    const hero = container.querySelector<HTMLElement>(
      '[data-shader-zone="hero"]'
    );
    const background = screen.getByTestId('site-shader-background');

    vi.spyOn(background, 'getBoundingClientRect').mockReturnValue(viewportRect);
    vi.spyOn(hero!, 'getBoundingClientRect').mockReturnValue({
      ...viewportRect,
      bottom: 400,
      height: 400,
      right: 500,
      width: 500,
    });

    await waitFor(() => {
      expect(screen.getByTestId('site-cloud-shader')).toBeDefined();
    });

    background.dispatchEvent(
      new MouseEvent('pointerdown', {
        bubbles: true,
        clientX: 250,
        clientY: 200,
      })
    );
    expect(setUniformsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ u_pulseStrength: 1 })
    );

    setUniformsMock.mockClear();
    background.dispatchEvent(
      new MouseEvent('pointerdown', {
        bubbles: true,
        clientX: 800,
        clientY: 200,
      })
    );
    expect(setUniformsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ u_pulseStrength: 0.52 })
    );
  });

  it('keeps the static fallback when reduced motion is requested', async () => {
    mockReducedMotion(true);
    render(<SiteShaderBackground />);

    expect(screen.queryByTestId('site-cloud-shader')).toBeNull();
    expect(screen.getByTestId('site-cloud-fallback')).toBeDefined();
  });

  it('keeps the static fallback when WebGL2 is unavailable', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    render(<SiteShaderBackground />);

    expect(screen.queryByTestId('site-cloud-shader')).toBeNull();
    expect(screen.getByTestId('site-cloud-fallback')).toBeDefined();
  });
});
