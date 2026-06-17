export function ProximamenteBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center shrink-0 bg-base-content/10 text-base-content/55 text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${className}`}
    >
      Próximamente
    </span>
  );
}

export function ProximamenteButton({
  children,
  className = "",
  variant = "secondary",
  icon = null,
}) {
  const base =
    "cursor-not-allowed opacity-65 pointer-events-none flex items-center justify-center gap-2 whitespace-nowrap";

  const variants = {
    secondary:
      "px-6 py-3 bg-secondary text-on-secondary rounded-full text-xs font-bold shadow-md",
    primary:
      "px-6 py-3 bg-primary text-primary-content rounded-full text-xs font-bold shadow-md",
    outline:
      "w-full py-3 border-2 border-primary text-primary rounded-full font-bold text-xs",
    outlineSecondary:
      "w-full py-3 bg-secondary text-on-secondary rounded-full font-bold text-xs shadow-sm",
    header:
      "px-4 py-2 text-secondary border border-secondary/30 rounded-full font-sans text-xs font-semibold bg-transparent shadow-none",
    link: "text-xs font-bold text-primary bg-transparent border-none p-0 rounded-none shadow-none justify-start",
  };

  return (
    <button type="button" disabled className={`${base} ${variants[variant]} ${className}`}>
      {icon}
      <span>{children}</span>
      <ProximamenteBadge />
    </button>
  );
}
