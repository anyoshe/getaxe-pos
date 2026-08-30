interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}