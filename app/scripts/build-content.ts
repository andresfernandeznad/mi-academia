// Validates ../content and writes the compiled JSON the app serves under /content.
// Runs before `ng serve` / `ng build`; any content error fails the build.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileContent } from './content/compile-content.ts';

const contentDir = resolve(import.meta.dirname, '../../content');
const outDir = resolve(import.meta.dirname, '../generated/content');

const { index, lessons, questions, errors } = compileContent(contentDir);

if (errors.length > 0) {
  console.error(`Content has ${errors.length} error(s) in ${contentDir}:`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'index.json'), JSON.stringify(index));
writeFileSync(join(outDir, 'questions.json'), JSON.stringify(questions));
for (const lesson of lessons) {
  const moduleDir = join(outDir, lesson.moduleId);
  mkdirSync(moduleDir, { recursive: true });
  writeFileSync(join(moduleDir, `${lesson.id}.json`), JSON.stringify(lesson));
}

console.log(`Content OK: ${lessons.length} lesson(s) written to ${outDir}`);
