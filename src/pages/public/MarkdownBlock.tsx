const escapeHtml = (input: string): string =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderInline = (line: string): string => {
  let html = escapeHtml(line);
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return html;
};

const markdownToHtml = (markdown: string): string => {
  const lines = markdown.split("\n");
  const chunks: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (inList) {
        chunks.push("</ul>");
        inList = false;
      }
      continue;
    }

    if (line.startsWith("### ")) {
      if (inList) {
        chunks.push("</ul>");
        inList = false;
      }
      chunks.push(`<h3>${renderInline(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith("## ")) {
      if (inList) {
        chunks.push("</ul>");
        inList = false;
      }
      chunks.push(`<h2>${renderInline(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("# ")) {
      if (inList) {
        chunks.push("</ul>");
        inList = false;
      }
      chunks.push(`<h1>${renderInline(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        chunks.push("<ul>");
        inList = true;
      }
      chunks.push(`<li>${renderInline(line.slice(2))}</li>`);
      continue;
    }

    if (inList) {
      chunks.push("</ul>");
      inList = false;
    }
    chunks.push(`<p>${renderInline(line)}</p>`);
  }

  if (inList) {
    chunks.push("</ul>");
  }

  return chunks.join("");
};

export const MarkdownBlock = ({ markdown }: { markdown: string }) => (
  <div className="markdown-block" dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }} />
);
