import path from 'path';
import { parseContent } from '@/lib/mdx';
import { projectSchema } from '@/lib/schemas';

type Project = {
  title: string;
  date: string;
  description: string;
  tags: string[];
  url?: string;
  github?: string;
  slug: string;
  content: string;
};

function getProjects(): Project[] {
  try {
    const dir = path.join(process.cwd(), 'src/content/professional/projects');
    return parseContent(dir, projectSchema)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 4);
  } catch {
    return [];
  }
}

export default function ProjectsGrid() {
  const projects = getProjects();

  return (
    <section aria-label="Projects" className="py-20 md:py-28 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Section header */}
        <div className="mb-10 flex items-baseline gap-3">
          <span className="font-mono text-xs text-subtle tracking-[0.2em] uppercase">
            Projects
          </span>
          <div className="flex-1 h-px bg-border/30 max-w-12" aria-hidden="true" />
        </div>

        {projects.length === 0 ? (
          <p className="text-sm text-subtle">No projects yet.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/20 border border-border/20 list-none m-0 p-0">
            {projects.map((project) => (
              <li
                key={project.slug}
                className="bg-background p-6 flex flex-col gap-3 hover:bg-surface/50 transition-colors duration-300"
              >
                {/* Title */}
                <h3 className="text-sm font-medium text-foreground leading-snug">
                  {project.url || project.github ? (
                    <a
                      href={project.url ?? project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent transition-colors duration-200"
                    >
                      {project.title}
                    </a>
                  ) : (
                    project.title
                  )}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted leading-relaxed">
                  {project.description}
                </p>

                {/* Tags + date */}
                <div className="mt-auto flex items-center justify-between gap-4 pt-3 border-t border-border/20">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] text-subtle tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <time
                    dateTime={project.date}
                    className="font-mono text-[10px] text-subtle tracking-wider shrink-0"
                  >
                    {project.date.slice(0, 7)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
