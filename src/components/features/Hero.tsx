import Avatar from '@/components/ui/Avatar';
import { FileText, Mail } from 'lucide-react';
import { FaGithub, FaLinkedin, FaDiscord, FaXTwitter } from 'react-icons/fa6';
import MusicShell from '@/components/features/MusicShell';

/*
  Social links — using react-icons/fa6 for brand icons.
  Replace hrefs with real profile URLs before publishing.
*/
const socials = [
  { label: 'GitHub',   href: '#github',   icon: FaGithub },
  { label: 'LinkedIn', href: '#linkedin', icon: FaLinkedin },
  { label: 'Discord',  href: '#discord',  icon: FaDiscord },
  { label: 'X',        href: '#twitter',  icon: FaXTwitter },
];

const specialties = ['SOC', 'GRC', 'Security Research'];

export default function Hero() {
  return (
    /*
      Composition intent:
      - min-h-svh (minus 48px nav) fills the first viewport
      - Grid columns ~40/60 via 2fr/3fr — not 50/50
      - Left: avatar, sits in upper portion of its column
      - Right: identity at soft vertical center, generous space above
      - Bottom: minimal scroll affordance
    */
    <section
      aria-label="Introduction"
      className="relative min-h-[calc(100svh-3rem)] flex flex-col overflow-hidden"
    >
      {/* Content wrapper */}
      <div className="relative z-10 flex-1 flex flex-col w-full">
        {/* Composition grid */}
      <div
        className="
          flex-1
          grid grid-cols-1 md:grid-cols-[2fr_3fr]
          items-center
          max-w-7xl mx-auto w-full
          px-6 sm:px-8 md:px-12
          gap-12 md:gap-0
          py-16 md:py-0
        "
      >
        {/* ── Left: Avatar ────────────────────────────────────── */}
        <div
          className="flex justify-start items-center"
          style={{ alignSelf: 'center', paddingTop: 'clamp(0px, 6vh, 64px)' }}
        >
          {/* Avatar is smaller on mobile to leave breathing room */}
          <div className="sm:hidden">
            <Avatar src="/images/avatar/pfp.jpg" alt="Swaraj Singh" size={160} className="rounded-sm" />
          </div>
          <div className="hidden sm:block">
            <Avatar src="/images/avatar/pfp.jpg" alt="Swaraj Singh" size={280} className="rounded-sm" />
          </div>
        </div>

        {/* ── Right: Identity ──────────────────────────────────── */}
        <div className="flex flex-col gap-5 md:gap-6 md:pl-10">

          {/* Name + descriptor */}
          <div>
            <h1
              className="
                text-[2.5rem] leading-none font-medium text-foreground
                sm:text-5xl
                lg:text-[3.75rem]
              "
              style={{ letterSpacing: '-0.03em' }}
            >
              Swaraj Singh
            </h1>
            <p className="mt-3 text-base text-muted font-light tracking-widest">
              cybersecurity enthusiast
            </p>
          </div>

          {/* Specialty tags */}
          <div
            className="flex items-center gap-2 text-xs font-mono text-subtle tracking-widest uppercase"
            aria-label="Areas of focus"
          >
            {specialties.map((tag, i) => (
              <span key={tag} className="flex items-center gap-2">
                {i > 0 && (
                  <span className="text-border/50" aria-hidden="true">·</span>
                )}
                {tag}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div className="w-6 h-px bg-border/60" aria-hidden="true" />

            {/* Social links */}
            <nav aria-label="Social profiles">
              <ul className="flex flex-wrap gap-x-5 gap-y-2 list-none m-0 p-0">
                {socials.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={`${label} profile`}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="
                        inline-flex items-center gap-1.5
                        text-sm text-muted
                        hover:text-foreground
                        transition-colors duration-200
                      "
                    >
                      <Icon
                        size={13}
                        aria-hidden="true"
                        className="opacity-70"
                      />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

          {/* Contact email */}
          <p className="text-xs text-muted/80 font-light flex items-center gap-1.5 pt-0.5">
            Feel free to contact me:{' '}
            <a
              href="mailto:swarajsingh211@gmail.com"
              className="inline-flex items-center gap-1 text-muted/80 hover:text-foreground transition-colors duration-200 underline underline-offset-4 decoration-border/40 hover:decoration-foreground/60"
              aria-label="Send email to Swaraj Singh"
            >
              <Mail size={12} aria-hidden="true" className="opacity-70" />
              Mail
            </a>
          </p>

          {/* Resume — understated text link */}
          <a
            href="/resume"
            className="
              inline-flex items-center gap-1.5
              text-[11px] font-mono text-subtle/70
              hover:text-subtle
              transition-colors duration-200
              self-start tracking-[0.12em] uppercase
            "
          >
            <FileText size={10} strokeWidth={1.5} aria-hidden="true" />
            View Resume
          </a>
        </div>
      </div>

      {/* ── Music and Scroll affordance ───────────────────────── */}
      <div className="relative z-10 flex flex-col items-start justify-end pb-8 gap-6 w-full max-w-7xl mx-auto px-6 sm:px-8 md:px-12">
        <div className="w-full flex justify-start md:grid md:grid-cols-[2fr_3fr] md:gap-0">
          <div className="hidden md:block"></div>
          <div className="md:pl-10">
            <MusicShell />
          </div>
        </div>
        
        <div
          aria-hidden="true"
          className="scroll-affordance flex justify-center w-full mt-4"
        >
          <div
            className="w-px bg-border/50"
            style={{
              height: '28px',
              animation: 'scrollPulse 1400ms ease-in-out infinite alternate',
            }}
          />
        </div>
      </div>
      
      </div>

      <style>{`
        @keyframes scrollPulse {
          from { opacity: 0.15; transform: scaleY(0.6); }
          to   { opacity: 0.6;  transform: scaleY(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .scroll-affordance div {
            animation: none !important;
            opacity: 0.25 !important;
          }
        }
      `}</style>
    </section>
  );
}
