import path from 'path';
import { parseContent } from '@/lib/mdx';
import { blogSchema } from '@/lib/schemas';

type BlogPost = {
  title: string;
  date: string;
  description: string;
  tags: string[];
  slug: string;
  content: string;
};

function getBlogPosts(): BlogPost[] {
  try {
    const dir = path.join(process.cwd(), 'src/content/professional/blog');
    return parseContent(dir, blogSchema)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default function BlogTeaser() {
  const posts = getBlogPosts();

  return (
    <section aria-label="Writing" className="py-16 md:py-20 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Section header */}
        <div className="mb-8 flex items-baseline gap-3">
          <span className="font-mono text-xs text-subtle tracking-[0.2em] uppercase">
            Writing
          </span>
          <div className="flex-1 h-px bg-border/30 max-w-12" aria-hidden="true" />
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-subtle">No posts yet.</p>
        ) : (
          <ul className="flex flex-col gap-6 list-none m-0 p-0">
            {posts.map((post) => (
              <li key={post.slug}>
                <article>
                  <a
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-1.5"
                  >
                    {/* Title */}
                    <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors duration-200 leading-snug">
                      {post.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-muted leading-relaxed">
                      {post.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-1">
                      <time
                        dateTime={post.date}
                        className="font-mono text-[10px] text-subtle tracking-wider"
                      >
                        {post.date}
                      </time>
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] text-subtle tracking-wider"
                        >
                          · {tag}
                        </span>
                      ))}
                    </div>
                  </a>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
