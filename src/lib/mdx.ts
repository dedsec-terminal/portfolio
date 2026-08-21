import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { z } from 'zod';

export function getMdxFiles(dir: string) {
  try {
    return fs
      .readdirSync(dir)
      .filter(
        (file) => path.extname(file) === '.mdx' || path.extname(file) === '.md'
      );
  } catch {
    return [];
  }
}

export function readMdxFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  return matter(rawContent);
}

export function parseContent<T extends z.ZodTypeAny>(
  dir: string,
  schema: T
): Array<z.infer<T> & { slug: string; content: string }> {
  const mdxFiles = getMdxFiles(dir);

  return mdxFiles.map((file) => {
    const filePath = path.join(dir, file);
    const { data, content } = readMdxFile(filePath);
    const slug = path.basename(file, path.extname(file));

    const parsedData = schema.parse(data);

    return Object.assign({}, parsedData, { slug, content }) as z.infer<T> & {
      slug: string;
      content: string;
    };
  });
}
