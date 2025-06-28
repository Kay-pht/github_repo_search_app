export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-700/50 ${className ?? ''}`.trim()}
      aria-hidden
    />
  );
}
