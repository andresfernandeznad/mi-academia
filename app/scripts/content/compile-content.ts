import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';
import type { ContentIndex, Lesson, ModuleSummary, Phase } from '../../src/app/content/content.model.ts';
import { parseLesson, validateQuestions } from './validators.ts';

export interface CompiledContent {
  index: ContentIndex;
  lessons: Lesson[];
  errors: string[];
}

interface RoadmapModule {
  id: string;
  title: string;
  hours: number;
}

interface RoadmapPhase {
  id: string;
  title: string;
  modules: RoadmapModule[];
}

/**
 * Reads the content/ folder and returns the compiled index and lessons.
 * Every problem is collected (prefixed with its file) instead of stopping at the first one,
 * so a single run shows everything that needs fixing.
 */
export function compileContent(contentDir: string): CompiledContent {
  const errors: string[] = [];
  const lessons: Lesson[] = [];
  const questionOwners = new Map<string, string>();

  const readJson = (file: string): unknown => {
    try {
      return JSON.parse(readFileSync(join(contentDir, file), 'utf8'));
    } catch (error) {
      errors.push(`${file}: ${existsSync(join(contentDir, file)) ? (error as Error).message : 'file not found'}`);
      return undefined;
    }
  };

  const roadmap = readJson('roadmap.json') as { title?: string; phases?: RoadmapPhase[] } | undefined;
  if (!roadmap || typeof roadmap.title !== 'string' || !Array.isArray(roadmap.phases)) {
    if (roadmap) errors.push('roadmap.json: needs a title and a phases array');
    return { index: { title: '', phases: [] }, lessons, errors };
  }

  const compileModule = (entry: RoadmapModule): ModuleSummary => {
    const summary: ModuleSummary = { id: entry.id, title: entry.title, hours: entry.hours, available: false, lessons: [] };
    const moduleFile = `${entry.id}/module.json`;
    if (!existsSync(join(contentDir, moduleFile))) {
      return summary;
    }

    const meta = readJson(moduleFile) as { id?: string; description?: string; lessons?: unknown } | undefined;
    if (!meta) return summary;
    if (meta.id !== entry.id) {
      errors.push(`${moduleFile}: id "${String(meta.id)}" must match its folder "${entry.id}"`);
    }
    if (!Array.isArray(meta.lessons) || meta.lessons.length === 0) {
      errors.push(`${moduleFile}: lessons must be a non-empty array of file slugs`);
      return summary;
    }

    for (const slug of meta.lessons as string[]) {
      const lessonFile = `${entry.id}/lessons/${slug}.md`;
      const questionsFile = `${entry.id}/questions/${slug}.json`;

      if (!existsSync(join(contentDir, lessonFile))) {
        errors.push(`${lessonFile}: file not found (listed in ${moduleFile})`);
        continue;
      }
      const parsed = parseLesson(slug, readFileSync(join(contentDir, lessonFile), 'utf8'));
      errors.push(...parsed.errors.map((e) => `${lessonFile}: ${e}`));

      const rawQuestions = readJson(questionsFile);
      const checked = rawQuestions === undefined ? undefined : validateQuestions(rawQuestions);
      errors.push(...(checked?.errors ?? []).map((e) => `${questionsFile}: ${e}`));

      for (const question of checked?.questions ?? []) {
        const owner = questionOwners.get(question.id);
        if (owner) {
          errors.push(`${questionsFile}: question id ${question.id} duplicated (already used in ${owner})`);
        }
        questionOwners.set(question.id, questionsFile);
      }

      if (parsed.lesson && checked && checked.errors.length === 0) {
        const { markdown, ...meta } = parsed.lesson;
        const html = marked.parse(markdown, { async: false });
        lessons.push({ ...meta, html, moduleId: entry.id, questions: checked.questions });
        summary.lessons.push({ id: meta.id, title: meta.title, minutes: meta.minutes });
      }
    }

    return { ...summary, available: true, description: meta.description };
  };

  const phases: Phase[] = roadmap.phases.map((phase) => ({
    id: phase.id,
    title: phase.title,
    modules: phase.modules.map(compileModule),
  }));

  return { index: { title: roadmap.title, phases }, lessons, errors };
}
