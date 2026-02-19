export const SectionHeading = ({
  title,
  subtitle,
  description
}: {
  title: string;
  subtitle: string;
  description?: string;
}) => (
  <header className="page-heading">
    <p>{subtitle}</p>
    <h1>{title}</h1>
    {description ? <small>{description}</small> : null}
  </header>
);
