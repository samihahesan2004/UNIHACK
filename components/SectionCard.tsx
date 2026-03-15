import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: ReactNode;
};

export default function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm leading-7 text-slate-600">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {children}
    </section>
  );
}