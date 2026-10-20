/**
 * Project data shared by every language.
 *
 * Translated copy lives in src/i18n/<locale>.ts under `project.<slug>.*`.
 * Add a project here, then add the matching keys to each locale file (the
 * build's i18n check will tell you if any language is missing them).
 */

export interface Project {
  slug: string;
  /** Translation key for the project's name / short title. */
  titleKey: string;
  /** Number of translated feature strings used by the detail page. */
  featureCount: number;
  /** Technologies explicitly confirmed for this project. Empty = not provided yet. */
  tech: string[];
  /** Leave empty until a real repository, demo or screenshots exist. */
  repo: string;
  demo: string;
  images: string[];
}

export const projects: Project[] = [
  {
    slug: 'blog',
    titleKey: 'project.blog.title',
    featureCount: 2,
    tech: ['HTML', 'CSS', 'JavaScript', 'PHP', 'SQL'],
    repo: '',
    demo: '',
    images: [],
  },
  {
    slug: 'hardware-store',
    titleKey: 'project.shop.title',
    featureCount: 3,
    // No technology list was confirmed for this project — leave empty rather than guess.
    tech: [],
    repo: '',
    demo: '',
    images: [],
  },
  {
    slug: 'unity-rpg',
    titleKey: 'project.unity.title',
    featureCount: 3,
    tech: ['Unity'],
    repo: '',
    demo: '',
    images: [],
  },
  {
    slug: 'cpp-rpg',
    titleKey: 'project.cpp.title',
    featureCount: 1,
    tech: ['C++'],
    repo: '',
    demo: '',
    images: [],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
