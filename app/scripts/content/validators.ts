import { parse as parseYaml } from 'yaml';
import type { Lesson, Question, QuestionType } from '../../src/app/content/content.model.ts';

export type ParsedLesson = Omit<Lesson, 'moduleId' | 'questions'>;

const REQUIRED_SECTIONS = ['## Por qué importa', '## Idea central', '## Error típico', '## Fuentes'];
const QUESTION_TYPES: QuestionType[] = ['quiz', 'find-the-bug', 'design-decision'];
const MIN_QUESTIONS = 3;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

/** Parses `lessons/<slug>.md`: YAML frontmatter plus a Markdown body with the mandatory sections. */
export function parseLesson(slug: string, source: string): { lesson?: ParsedLesson; errors: string[] } {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(source.replace(/\r\n/g, '\n'));
  if (!match) {
    return { errors: ['missing YAML frontmatter delimited by ---'] };
  }

  let meta: unknown;
  try {
    meta = parseYaml(match[1]);
  } catch (error) {
    return { errors: [`invalid frontmatter YAML: ${(error as Error).message}`] };
  }
  if (!isRecord(meta)) {
    return { errors: ['frontmatter must be a YAML object'] };
  }

  const errors: string[] = [];
  const { id, title, minutes, sources } = meta;
  const markdown = match[2].trim();

  if (!isNonEmptyString(id) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    errors.push('id must be a kebab-case string');
  } else if (!new RegExp(`^\\d{2}-${id}$`).test(slug)) {
    errors.push(`file name must be NN-${id}.md (got ${slug}.md)`);
  }
  if (!isNonEmptyString(title)) {
    errors.push('title is required');
  }
  if (typeof minutes !== 'number' || !Number.isInteger(minutes) || minutes < 5 || minutes > 10) {
    errors.push('minutes must be an integer between 5 and 10');
  }
  if (!Array.isArray(sources) || sources.length < 1 || sources.length > 3) {
    errors.push('sources must list between 1 and 3 URLs');
  } else {
    for (const source of sources) {
      if (typeof source !== 'string' || !source.startsWith('https://')) {
        errors.push(`source must be an https URL: ${String(source)}`);
      }
    }
  }
  for (const section of REQUIRED_SECTIONS) {
    if (!new RegExp(`^${section}\\s*$`, 'm').test(markdown)) {
      errors.push(`missing section "${section}"`);
    }
  }

  if (errors.length > 0) {
    return { errors };
  }
  return {
    lesson: { id: id as string, title: title as string, minutes: minutes as number, sources: sources as string[], markdown },
    errors,
  };
}

/** Validates the parsed content of `questions/<slug>.json`. */
export function validateQuestions(data: unknown): { questions: Question[]; errors: string[] } {
  if (!Array.isArray(data)) {
    return { questions: [], errors: ['questions file must contain a JSON array'] };
  }

  const errors: string[] = [];
  if (data.length < MIN_QUESTIONS) {
    errors.push(`a lesson needs at least ${MIN_QUESTIONS} questions (got ${data.length})`);
  }

  data.forEach((item, position) => {
    const label = isRecord(item) && isNonEmptyString(item['id']) ? item['id'] : `#${position + 1}`;
    const fail = (message: string) => errors.push(`question ${label}: ${message}`);

    if (!isRecord(item)) {
      fail('must be an object');
      return;
    }
    const { id, type, prompt, code, options, answer, explanation } = item;

    if (!isNonEmptyString(id)) fail('id is required');
    if (!isNonEmptyString(prompt)) fail('prompt is required');
    if (!isNonEmptyString(explanation)) fail('explanation is required');
    if (code !== undefined && !isNonEmptyString(code)) fail('code must be a non-empty string');
    if (!QUESTION_TYPES.includes(type as QuestionType)) {
      fail(`type must be one of ${QUESTION_TYPES.join(', ')}`);
      return;
    }

    if (type === 'find-the-bug') {
      const lines = isNonEmptyString(code) ? code.split('\n').length : 0;
      if (lines === 0) fail('find-the-bug needs code');
      if (!Number.isInteger(answer) || (answer as number) < 1 || (answer as number) > lines) {
        fail(`answer must be a line number between 1 and ${lines}`);
      }
      return;
    }

    if (!Array.isArray(options) || options.length < 2 || !options.every(isNonEmptyString)) {
      fail('options must have at least 2 non-empty strings');
      return;
    }
    if (!Number.isInteger(answer) || (answer as number) < 0 || (answer as number) >= options.length) {
      fail(`answer must be an option index between 0 and ${options.length - 1}`);
    }
  });

  return { questions: errors.length === 0 ? (data as Question[]) : [], errors };
}
