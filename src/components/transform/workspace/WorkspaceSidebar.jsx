'use client';

import { Download } from 'lucide-react';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ScoreRing from '../../ui/ScoreRing';
import useMediaQuery, { DESKTOP_QUERY } from '../../../hooks/useMediaQuery';

// Download state is owned by TransformOutput rather than here, so the
// sidebar and the in-tab export bar share one source of truth and cannot
// show contradictory states.
export default function WorkspaceSidebar({
  activeTab,
  setActiveTab,
  menuItems,
  currentScore,
  originalText,
  onDownloadClick,
  onDocxClick,
  isDownloading,
  isDownloadingDocx,
}) {
  const visibleItems = menuItems.filter((item) => !item.hideIfNoOriginal || originalText);

  // The mobile row and the desktop rail are both always in the DOM, hidden only
  // by CSS. Left as-is they expose two tablists and two sets of role="tab" to
  // assistive tech — fourteen tabs for seven panels, both claiming the same
  // aria-controls — and the keyboard handler below could focus a button inside
  // the display:none list. Tracking the breakpoint lets only the live list be
  // rendered as tabs.
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  // Arrow / Home / End navigation between tabs, as the ARIA tabs pattern
  // requires. Previously all seven tabs sat in the tab order with no
  // keyboard relationship between them.
  const handleTabKeyDown = (e) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(e.key)) return;

    e.preventDefault();
    const currentIndex = visibleItems.findIndex((item) => item.id === activeTab);
    let nextIndex = currentIndex;

    if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = visibleItems.length - 1;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
      nextIndex = (currentIndex + 1) % visibleItems.length;
    else nextIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;

    const nextTab = visibleItems[nextIndex];
    if (!nextTab) return;

    setActiveTab(nextTab.id);

    // Move focus with selection so the roving tabindex stays coherent.
    // Targeted by id rather than by [aria-selected="true"]: the query ran
    // before React had committed the new selection, so it matched the tab
    // being moved away from and focus stayed put while selection advanced.
    // currentTarget is also cleared once dispatch finishes, so the list node
    // is captured here rather than read inside the callback.
    const listNode = e.currentTarget;
    const nextId = isDesktop ? `tab-desktop-${nextTab.id}` : `tab-${nextTab.id}`;
    requestAnimationFrame(() => {
      // getElementById-style lookup via an attribute selector rather than
      // `#${CSS.escape(id)}`: CSS.escape is absent in older Safari and in
      // non-DOM test environments, where it threw a TypeError on every arrow
      // keypress. Tab ids are built from known slugs, so no escaping is
      // needed — only a selector that cannot throw.
      listNode?.querySelector(`[id="${nextId}"]`)?.focus();
    });
  };


  return (
    <aside className="w-full lg:w-64 shrink-0 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col justify-between select-none shadow-[var(--shadow-sm)]">
      <div className="flex flex-col gap-6">
        
        {/* ATS Score Box */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col items-center gap-1 mb-4">
          <ScoreRing score={currentScore} />
        </div>

        {/* Mobile Tab Navigation (Scrollable Row).
            The fade on the right edge signals that more tabs exist —
            scrollbar-none previously hid the only cue, so roughly four of
            seven tabs were invisible with nothing indicating them. */}
        <div className="lg:hidden relative" aria-hidden={isDesktop || undefined}>
          <div
            role={isDesktop ? undefined : 'tablist'}
            aria-label={isDesktop ? undefined : 'Result sections'}
            aria-orientation="horizontal"
            onKeyDown={handleTabKeyDown}
            className="flex overflow-x-auto pb-1 gap-1.5 scrollbar-none snap-x"
          >
            {visibleItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  role={isDesktop ? undefined : 'tab'}
                  id={`tab-${item.id}`}
                  aria-selected={isDesktop ? undefined : isActive}
                  aria-controls={isDesktop ? undefined : `panel-${item.id}`}
                  // Roving tabindex: one stop for the whole set, arrows move
                  // between tabs, per the ARIA tabs pattern. The hidden list is
                  // removed from the tab order entirely.
                  tabIndex={!isDesktop && isActive ? 0 : -1}
                  onClick={() => setActiveTab(item.id)}
                  className={`snap-center flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--text-primary)] text-[var(--bg-base)] font-bold shadow-sm'
                      : 'bg-transparent border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <IconComponent size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-[var(--bg-base)] to-transparent"
          />
        </div>

        {/* Desktop Vertical Menu */}
        <nav
          role={isDesktop ? 'tablist' : undefined}
          aria-label={isDesktop ? 'Result sections' : undefined}
          aria-hidden={isDesktop ? undefined : true}
          aria-orientation="vertical"
          onKeyDown={handleTabKeyDown}
          className="hidden lg:flex flex-col gap-1"
        >
          {visibleItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                role={isDesktop ? 'tab' : undefined}
                id={`tab-desktop-${item.id}`}
                aria-selected={isDesktop ? isActive : undefined}
                aria-controls={isDesktop ? `panel-${item.id}` : undefined}
                tabIndex={isDesktop && isActive ? 0 : -1}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] text-sm font-normal tracking-tight transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-medium shadow-[inset_2px_0_0_var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <IconComponent
                  size={15}
                  className={`transition-colors ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

      </div>

      {/* Bottom Sidebar Action Buttons */}
      <div className="hidden lg:flex flex-col gap-2 pt-6 border-t border-[var(--border-default)] mt-6">
        <button
          onClick={onDownloadClick}
          disabled={isDownloading || isDownloadingDocx}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-[var(--text-secondary)] bg-transparent border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-45 disabled:cursor-not-allowed rounded-[var(--radius-sm)] transition-all cursor-pointer"
        >
          {isDownloading ? (
            <>
              <LoadingSpinner size="sm" strokeWidth={2.5} className="text-[var(--text-secondary)]" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download size={13} />
              Download PDF
            </>
          )}
        </button>
        <button
          onClick={onDocxClick}
          disabled={isDownloading || isDownloadingDocx}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-[var(--text-secondary)] bg-transparent border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-45 disabled:cursor-not-allowed rounded-[var(--radius-sm)] transition-all cursor-pointer"
        >
          {isDownloadingDocx ? (
            <>
              <LoadingSpinner size="sm" strokeWidth={2.5} className="text-[var(--text-secondary)]" />
              Generating DOCX...
            </>
          ) : (
            <>
              <Download size={13} />
              Download DOCX
            </>
          )}
        </button>
      </div>
    </aside>
  );
}