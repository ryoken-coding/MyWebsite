/**
 * Project data shared by every language.
 *
 * Translated copy lives in src/i18n/<locale>.ts under `project.<slug>.*`.
 * Add a project here, then add the matching keys to each locale file (the
 * build's i18n check will tell you if any language is missing them).
 */

export type ProjectStatus = 'inProgress' | 'planning' | 'notSpecified' | 'pendingConfirmation';

export interface Project {
  slug: string;
  /** Translation key for the project's name / short title. */
  titleKey: string;
  status: ProjectStatus;
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
    // No status was confirmed for this project; do not imply one.
    status: 'notSpecified',
    tech: ['HTML', 'CSS', 'JavaScript', 'PHP', 'SQL'],
    repo: '',
    demo: '',
    images: [],
  },
  {
    slug: 'hardware-store',
    titleKey: 'project.shop.title',
    // No status was confirmed for this project; do not imply one.
    status: 'notSpecified',
    // No technology list was confirmed for this project — leave empty rather than guess.
    tech: [],
    repo: '',
    demo: '',
    images: [],
  },
  {
    slug: 'unity-rpg',
    titleKey: 'project.unity.title',
    status: 'inProgress',
    tech: ['Unity'],
    repo: '',
    demo: '',
    images: [],
  },
  {
    slug: 'cpp-rpg',
    titleKey: 'project.cpp.title',
    // Predicted to be finished by the author, but not confirmed yet.
    // Switch to 'completed' only after the author confirms it.
    status: 'pendingConfirmation',
    tech: ['C++'],
    repo: '',
    demo: '',
    images: [],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
