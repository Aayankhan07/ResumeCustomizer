/**
 * Single source of truth for PDF templates and page budgets.
 *
 * constants.js previously exported TEMPLATE_PRESETS listing
 * classic/modern/minimalist while pdfGenerator implemented
 * classic/modern/tech/executive, and PAGE_BUDGET_OPTIONS listed
 * standard/1-page/2-page while the generator only understood 'standard' and
 * 'fit'. Neither constant was imported anywhere, so they were contradictory
 * dead code waiting to be wired up to the wrong thing.
 *
 * Deriving the union types from the registry means adding an entry without
 * implementing it fails `tsc` rather than silently falling back to classic.
 */

export const TEMPLATES = [
  {
    id: 'classic',
    label: 'Classic Serif',
    description: 'Traditional & elegant',
    font: 'times',
    headerFont: 'times',
    centered: true,
  },
  {
    id: 'modern',
    label: 'Modern Minimalist',
    description: 'Clean, left-aligned',
    font: 'helvetica',
    headerFont: 'helvetica',
    centered: false,
  },
  {
    id: 'tech',
    label: 'Clean Tech',
    description: 'Mono, structured',
    font: 'helvetica',
    headerFont: 'courier',
    centered: false,
  },
  {
    id: 'executive',
    label: 'Executive Elegant',
    description: 'Luxury serif, centered',
    font: 'times',
    headerFont: 'times',
    centered: true,
  },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]['id'];

export const PAGE_BUDGETS = [
  {
    id: 'standard',
    label: 'Standard Spacing',
    description: 'Generous spacing for multi-page layouts',
  },
  {
    id: 'fit',
    label: 'Auto-Fit (1 Page)',
    description: 'Font sizes & margins compressed to fit 1 page',
  },
] as const;

export type PageBudgetId = (typeof PAGE_BUDGETS)[number]['id'];

export const DEFAULT_TEMPLATE: TemplateId = 'classic';
export const DEFAULT_PAGE_BUDGET: PageBudgetId = 'standard';

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function isValidTemplate(id: string): id is TemplateId {
  return TEMPLATES.some((t) => t.id === id);
}
