import type { ReactNode } from "react";

type TabItem<T extends string> = {
  id: T;
  label: string;
  rightSlot?: ReactNode;
};

type AdminSectionTabsProps<T extends string> = {
  label: string;
  value: T;
  tabs: TabItem<T>[];
  onChange: (next: T) => void;
};

export const AdminSectionTabs = <T extends string>({
  label,
  value,
  tabs,
  onChange
}: AdminSectionTabsProps<T>) => {
  return (
    <div className="admin-subtabs" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={value === tab.id ? "is-active" : ""}
          onClick={() => onChange(tab.id)}
        >
          <span>{tab.label}</span>
          {tab.rightSlot ? <span>{tab.rightSlot}</span> : null}
        </button>
      ))}
    </div>
  );
};
