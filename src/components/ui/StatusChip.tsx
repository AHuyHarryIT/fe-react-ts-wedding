import type { ReactNode } from 'react';

type StatusChipTone = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'slate';

interface StatusChipProps {
  tone?: StatusChipTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<StatusChipTone, string> = {
  blue: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/12 dark:text-sky-200',
  green:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/12 dark:text-emerald-200',
  orange:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/12 dark:text-amber-200',
  red: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/12 dark:text-rose-200',
  purple:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/12 dark:text-violet-200',
  slate:
    'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
};

export function StatusChip({
  tone = 'slate',
  icon,
  children,
  className = '',
}: StatusChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-[0.03em] ${TONE_CLASSES[tone]} ${className}`.trim()}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}
