import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalysisRow from '@/components/dashboard/AnalysisRow';

/**
 * The row used to be a `<div onClick>` navigating to the detail page: not
 * focusable, not activatable by keyboard, announced as nothing. It is the
 * primary dashboard-to-detail path, so it was mouse-only.
 *
 * It cannot become a <button> because it contains a <select> and its own
 * buttons, so the title is a real link with a stretched overlay.
 */

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const ITEM = {
  id: 'txn-1',
  label: null,
  detected_job_title: 'Senior Frontend Engineer',
  detected_company: 'Northwind Labs',
  match_score: 88,
  status: 'Applied',
  application_deadline: null,
  created_at: new Date().toISOString(),
};

function renderRow(overrides: Record<string, unknown> = {}) {
  const onDelete = vi.fn().mockResolvedValue(undefined);
  const onUpdateStatus = vi.fn().mockResolvedValue(undefined);
  const utils = render(
    <AnalysisRow item={{ ...ITEM, ...overrides }} onDelete={onDelete} onUpdateStatus={onUpdateStatus} />
  );
  return { ...utils, onDelete, onUpdateStatus };
}

afterEach(cleanup);

describe('AnalysisRow', () => {
  it('exposes the detail page as a real link', () => {
    renderRow();
    const link = screen.getByRole('link', { name: /senior frontend engineer/i });
    expect(link.getAttribute('href')).toBe('/transform/txn-1');
  });

  it('stretches the link across the row so the whole row is clickable', () => {
    // The affordance the old div+onClick provided, kept without nesting
    // interactive elements inside a button.
    renderRow();
    const link = screen.getByRole('link', { name: /senior frontend engineer/i });
    expect(link.className).toContain('after:absolute');
    expect(link.className).toContain('after:inset-0');
  });

  it('puts the link, status control and menu in the tab order', async () => {
    renderRow();
    await userEvent.tab();
    expect(document.activeElement?.tagName).toBe('A');

    await userEvent.tab();
    expect(document.activeElement?.tagName).toBe('SELECT');

    await userEvent.tab();
    expect(document.activeElement?.getAttribute('aria-label')).toMatch(/more options/i);
  });

  it('labels the overflow menu for screen readers', () => {
    renderRow();
    expect(screen.getByRole('button', { name: /more options/i })).toBeTruthy();
  });

  it('reports a status change', async () => {
    const { onUpdateStatus } = renderRow();
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Interviewing');
    expect(onUpdateStatus).toHaveBeenCalledWith('txn-1', 'Interviewing');
  });

  it('requires confirmation before deleting', async () => {
    const { onDelete } = renderRow();

    await userEvent.click(screen.getByRole('button', { name: /more options/i }));
    await userEvent.click(screen.getByRole('button', { name: /delete analysis/i }));

    // First click opens the confirmation, it must not delete outright.
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText(/are you sure/i)).toBeTruthy();
  });

  it('deletes once the confirmation is accepted', async () => {
    const { onDelete } = renderRow();

    await userEvent.click(screen.getByRole('button', { name: /more options/i }));
    await userEvent.click(screen.getByRole('button', { name: /delete analysis/i }));

    const confirm = screen.getByText(/are you sure/i).closest('div') as HTMLElement;
    await userEvent.click(within(confirm).getByRole('button', { name: /^delete$/i }));

    expect(onDelete).toHaveBeenCalledWith('txn-1');
  });

  it('abandons the delete when cancelled', async () => {
    const { onDelete } = renderRow();

    await userEvent.click(screen.getByRole('button', { name: /more options/i }));
    await userEvent.click(screen.getByRole('button', { name: /delete analysis/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByText(/are you sure/i)).toBeNull();
  });

  it('falls back to the label when no job title was detected', () => {
    renderRow({ detected_job_title: null, label: 'My saved resume' });
    expect(screen.getByRole('link', { name: /my saved resume/i })).toBeTruthy();
  });
});
