export const siteConfig = {
  brandName: 'Dedsec Terminal',
  name: 'Swaraj Singh',
  title: 'Swaraj Singh',
  description:
    'Personal portfolio of Swaraj Singh, specializing in SOC, GRC, and Security Research.',
  email: 'swarajsingh211@gmail.com',
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    'https://dedsec-terminal.in',
  discordId: '521225730491940864',
  links: {
    github: 'https://github.com/dedsec-terminal',
    linkedin: 'https://www.linkedin.com/in/swarajsingh211in/',
    x: 'https://x.com/dedsec_terminal',
    discord: 'dedsec_terminal',
  },
};
