import { type ReactNode } from "react";
import { MarkdownBlock } from "./MarkdownBlock";

type DetailArticleProps = {
  typeLabel: string;
  title: string;
  meta?: ReactNode;
  markdown?: string;
  fallbackText?: string;
  actions?: ReactNode;
};

export const DetailArticle = ({
  typeLabel,
  title,
  meta,
  markdown,
  fallbackText,
  actions
}: DetailArticleProps) => {
  return (
    <article className="library-detail">
      <header>
        <p className="library-detail-type">{typeLabel}</p>
        <h2>{title}</h2>
      </header>
      {meta ? <div className="library-detail-meta">{meta}</div> : null}
      <div className="library-detail-body">
        {markdown ? <MarkdownBlock markdown={markdown} /> : fallbackText ? <p>{fallbackText}</p> : null}
      </div>
      {actions ? <div className="library-detail-actions">{actions}</div> : null}
    </article>
  );
};
