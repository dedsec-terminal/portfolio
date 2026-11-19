import type { Metadata } from 'next';
import ContentIndex from '@/components/content/ContentIndex';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Explore cybersecurity projects by Swaraj Singh, spanning threat intelligence platforms, Kubernetes runtime security, DevSecOps tooling, and GRC frameworks.',
  alternates: { canonical: '/projects' },
};

// Lead with demonstrated security work. Future, unranked entries stay newest-first below it.
const projectRanks = new Map(
  [
    'greyfield',
    'traceir',
    'kubesentinel',
    'vendor-assurance-desk',
    'ledgercast',
    'faultplane',
    'apex-capital-grc',
    'agentic-iac-vulnerability-detection',
    'policyforge',
    'ghostwire',
    'youtube-window-theater',
  ].map((slug, rank) => [slug, rank] as const)
);

export default function ProjectsPage() {
  const projects = getContent('projects').sort(
    (a, b) =>
      (projectRanks.get(a.slug) ?? projectRanks.size) -
      (projectRanks.get(b.slug) ?? projectRanks.size)
  );

  return <ContentIndex type="projects" items={projects} />;
}
