'use client';

export default function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div className={`border-b border-[var(--border-default)] flex gap-6 overflow-x-auto scrollbar-none whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0 ${className}`}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`pb-3 text-sm font-medium transition-all duration-150 relative -mb-[1.5px] shrink-0 ${
              isActive
                ? 'text-[var(--text-primary)] border-b-2 border-[var(--accent)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-b-2 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}