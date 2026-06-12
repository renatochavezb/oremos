export default function PrayerPrivacyBadge({ className = "", size = "sm" }) {
  const sizeClasses =
    size === "md"
      ? "px-3 py-1 text-[11px]"
      : "px-2.5 py-0.5 text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded uppercase font-bold bg-secondary text-on-secondary border border-secondary shadow-sm ${sizeClasses} ${className}`}
    >
      <span className="material-symbols-outlined text-xs">lock</span>
      Petición Privada
    </span>
  );
}
