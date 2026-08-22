import { validateAllContent } from '../src/lib/content';

try {
  const content = validateAllContent();
  const published = content.filter((item) => item.published);
  console.log(`Content validation passed: ${content.length} files checked, ${published.length} published.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
