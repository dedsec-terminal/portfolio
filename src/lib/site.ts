export const siteConfig = {
  brandName: 'Dedsec Terminal',
  name: 'Swaraj Singh',
  title: 'Dedsec Terminal | Cybersecurity Portfolio of Swaraj Singh',
  description:
    'Dedsec Terminal is the cybersecurity portfolio of Swaraj Singh, documenting security operations, GRC, security research, and projects.',
  email: 'swarajsingh211@gmail.com',
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    'https://dedsec-terminal.vercel.app',
  discordId: '521225730491940864',
  links: {
    github: 'https://github.com/dedsec-terminal',
    linkedin: 'https://www.linkedin.com/in/swarajsingh211in/',
    x: 'https://x.com/dedsec_terminal',
    discord: 'dedsec_terminal',
  },
};
