export default function CodeScreenIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Illustration of a computer screen displaying code"
    >
      <rect x="12" y="14" width="76" height="52" rx="4" />
      <line x1="50" y1="66" x2="50" y2="78" />
      <line x1="34" y1="86" x2="66" y2="86" />

      <line x1="20" y1="24" x2="42" y2="24" stroke="#34d399" />
      <line x1="20" y1="32" x2="72" y2="32" />
      <line x1="26" y1="40" x2="58" y2="40" />
      <line x1="26" y1="48" x2="46" y2="48" stroke="#34d399" />
      <line x1="20" y1="56" x2="66" y2="56" />
    </svg>
  );
}
