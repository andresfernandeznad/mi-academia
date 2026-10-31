import { ContentIndex, Lesson } from './content.model';

export const indexFixture: ContentIndex = {
  title: 'Roadmap de prueba',
  phases: [
    {
      id: 'arranque',
      title: '0. Arranque',
      modules: [
        {
          id: 'curso-0-java',
          title: 'Java esencial',
          hours: 15,
          available: true,
          description: 'Repaso de Java moderno.',
          lessons: [
            { id: 'java-hoy', title: 'Java hoy', minutes: 8, questionIds: ['java-hoy-1', 'java-hoy-2'] },
            { id: 'tipos', title: 'Tipos y texto', minutes: 7, questionIds: ['tipos-1', 'tipos-2'] },
          ],
        },
      ],
    },
    {
      id: 'fundamentos',
      title: '1. Fundamentos',
      modules: [{ id: 'http-apis', title: 'HTTP y APIs a fondo', hours: 15, available: false, lessons: [] }],
    },
  ],
};

export const lessonFixture: Lesson = {
  id: 'java-hoy',
  moduleId: 'curso-0-java',
  title: 'Java hoy',
  minutes: 8,
  sources: ['https://dev.java/learn/'],
  html: '<h2>Por qué importa</h2><p>Texto de la lección.</p><pre><code class="language-java">int a = 1;</code></pre>',
  questions: [
    { id: 'java-hoy-1', type: 'quiz', prompt: '¿JShell?', options: ['REPL', 'IDE'], answer: 0, explanation: '.' },
    { id: 'java-hoy-2', type: 'find-the-bug', prompt: '¿Línea?', code: 'a\nb', answer: 2, explanation: '.' },
  ],
};
