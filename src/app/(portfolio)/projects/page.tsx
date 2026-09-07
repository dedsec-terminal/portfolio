import type { Metadata } from 'next';
import ContentIndex from '@/components/content/ContentIndex';
import { getContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A catalogue of selected professional and personal work.',
  alternates: { canonical: '/projects' },
};
export default function ProjectsPage() { return <ContentIndex type="projects" items={getContent('projects')} />; }
