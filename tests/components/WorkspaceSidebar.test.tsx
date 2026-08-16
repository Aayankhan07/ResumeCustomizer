import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutDashboard, FileText, Target } from 'lucide-react';
import WorkspaceSidebar from '@/components/transform/workspace/WorkspaceSidebar';

/**
 * The sidebar renders two tab lists — a mobile row and a desktop rail — and
 * hides one with CSS. Two defects came out of that, both invisible to lint and
 * to every existing test:
 *
 *   1. Both lists carried role="tab", so assistive tech saw fourteen tabs and
 *      two tablists for seven panels, each claiming the same aria-controls.
 *   2. Arrow keys moved selection but left focus behind, because the handler
 *      queried [aria-selected="true"] before React had committed the change.
 */

const MENU = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'keywords', label: 'Keywords', icon: Target },
];

function setMatchMedia(isDesktop: boolean) {
  vi.stubGlobal(
    'matchMedia',
    (query: string) => ({
      matches: isDesktop,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    })
  );
}

function renderSidebar(overrides: Record<string, unknown> = {}) {
  const setActiveTab = vi.fn();
  const utils = render(
    <WorkspaceSidebar
      activeTab="overview"
      setActiveTab={setActiveTab}
      menuItems={MENU}
      currentScore={80}
      originalText="original resume"
      onDownloadClick={vi.fn()}
      onDocxClick={vi.fn()}
      isDownloading={false}
      isDownloadingDocx={false}
      {...overrides}
    />
  );
  return { ...utils, setActiveTab };
}

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    setTimeout(() => cb(0), 0);
    return 1;
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('WorkspaceSidebar', () => {
  describe('only the live breakpoint is exposed as tabs', () => {
    it('renders one tablist and one tab per item on desktop', () => {
      setMatchMedia(true);
      renderSidebar();

      expect(screen.getAllByRole('tablist')).toHaveLength(1);
      expect(screen.getAllByRole('tab')).toHaveLength(MENU.length);
    });

    it('renders one tablist and one tab per item on mobile', () => {
      setMatchMedia(false);
      renderSidebar();

      expect(screen.getAllByRole('tablist')).toHaveLength(1);
      expect(screen.getAllByRole('tab')).toHaveLength(MENU.length);
    });

    it('points the desktop tabs at the panels', () => {
      setMatchMedia(true);
      renderSidebar();

      const tab = screen.getByRole('tab', { name: /overview/i });
      expect(tab.getAttribute('aria-controls')).toBe('panel-overview');
      expect(tab.id).toBe('tab-desktop-overview');
    });
  });

  describe('roving tabindex', () => {
    it('keeps exactly one tab in the tab order', () => {
      setMatchMedia(true);
      renderSidebar();

      const focusable = screen.getAllByRole('tab').filter((t) => t.tabIndex === 0);
      expect(focusable).toHaveLength(1);
      expect(focusable[0].getAttribute('aria-selected')).toBe('true');
    });

    it('moves selection to the next tab on ArrowDown', async () => {
      setMatchMedia(true);
      const { setActiveTab } = renderSidebar();

      await userEvent.click(screen.getByRole('tab', { name: /overview/i }));
      setActiveTab.mockClear();

      await userEvent.keyboard('{ArrowDown}');
      expect(setActiveTab).toHaveBeenCalledWith('resume');
    });

    it('wraps from the last tab back to the first', async () => {
      setMatchMedia(true);
      const { setActiveTab } = renderSidebar({ activeTab: 'keywords' });

      await userEvent.click(screen.getByRole('tab', { name: /keywords/i }));
      setActiveTab.mockClear();

      await userEvent.keyboard('{ArrowDown}');
      expect(setActiveTab).toHaveBeenCalledWith('overview');
    });

    it('jumps to the first and last tab with Home and End', async () => {
      setMatchMedia(true);
      const { setActiveTab } = renderSidebar({ activeTab: 'resume' });

      await userEvent.click(screen.getByRole('tab', { name: /resume/i }));
      setActiveTab.mockClear();

      await userEvent.keyboard('{End}');
      expect(setActiveTab).toHaveBeenCalledWith('keywords');

      setActiveTab.mockClear();
      await userEvent.keyboard('{Home}');
      expect(setActiveTab).toHaveBeenCalledWith('overview');
    });

    it('ignores keys that are not part of the tabs pattern', async () => {
      setMatchMedia(true);
      const { setActiveTab } = renderSidebar();

      await userEvent.click(screen.getByRole('tab', { name: /overview/i }));
      setActiveTab.mockClear();

      await userEvent.keyboard('{PageDown}');
      expect(setActiveTab).not.toHaveBeenCalled();
    });
  });

  it('hides a tab that requires the original resume when there is none', () => {
    setMatchMedia(true);
    renderSidebar({
      originalText: '',
      menuItems: [...MENU, { id: 'compare', label: 'Compare', icon: FileText, hideIfNoOriginal: true }],
    });

    expect(screen.queryByRole('tab', { name: /compare/i })).toBeNull();
    expect(screen.getAllByRole('tab')).toHaveLength(MENU.length);
  });

  it('disables both export buttons while a download is in flight', () => {
    setMatchMedia(true);
    const { container } = renderSidebar({ isDownloading: true });

    const buttons = within(container).getAllByRole('button', { name: /generating|download/i });
    expect(buttons.every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
  });
});
