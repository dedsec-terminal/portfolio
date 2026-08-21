import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}

/**
 * Avatar component.
 * Supports a real image via `src`. When no src is supplied,
 * renders a minimal dark placeholder — intentionally understated,
 * not designed to look like finished artwork.
 * Replace with actual PFP by placing image at public/images/avatar.webp
 * and passing src="/images/avatar.webp".
 */
export default function Avatar({
  src,
  alt,
  size = 200,
  className = '',
}: AvatarProps) {
  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
  };

  if (src) {
    return (
      <div
        className={`relative overflow-hidden border border-border/60 ${className}`}
        style={containerStyle}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover object-top"
          priority
        />
      </div>
    );
  }

  /* Minimal fallback — not intended as finished design */
  return (
    <div
      className={`border border-border/40 bg-surface flex items-center justify-center ${className}`}
      style={containerStyle}
      role="img"
      aria-label={alt}
    >
      <span
        className="font-mono text-subtle text-xs tracking-widest select-none"
        aria-hidden="true"
      >
        PFP
      </span>
    </div>
  );
}
