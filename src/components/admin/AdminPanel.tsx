import type { ReactNode } from "react";

type AdminPanelProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

export const AdminPanel = ({ title, description, actions, className, children }: AdminPanelProps) => {
  return (
    <section className={className ? `admin-panel ${className}` : "admin-panel"}>
      <div className="admin-panel-head">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="admin-panel-head-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
};
