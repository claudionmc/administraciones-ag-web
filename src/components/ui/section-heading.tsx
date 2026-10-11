import type { ReactNode } from "react";
export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <div className="max-w-3xl"><p className="eyebrow text-primary-action">{eyebrow}</p><h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight text-primary sm:text-4xl">{title}</h2>{children && <div className="mt-5 max-w-2xl leading-7 text-text-muted">{children}</div>}</div>;
}
