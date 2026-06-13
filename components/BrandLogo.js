import Image from "next/image";
import Link from "next/link";
import config from "@/config";

const { iconMark } = config.brand;

const sizes = {
  sm: {
    icon: "h-14 w-14",
    image: 56,
    text: "text-[1.75rem]",
    gap: "gap-3",
  },
  md: {
    icon: "h-16 w-16",
    image: 64,
    text: "text-[2.125rem] md:text-[2.375rem]",
    gap: "gap-3.5",
  },
  lg: {
    icon: "h-[5.25rem] w-[5.25rem]",
    image: 84,
    text: "text-[2.125rem] md:text-[2.375rem]",
    gap: "gap-4",
  },
};

export default function BrandLogo({
  href = "/",
  variant = "full",
  className = "",
  showLink = true,
  size = "md",
}) {
  const s = sizes[size] ?? sizes.md;

  const content = (
    <>
      <Image
        src={iconMark}
        alt=""
        width={s.image}
        height={s.image}
        className={`${s.icon} shrink-0 object-contain`}
        priority
      />

      {variant !== "icon" && (
        <span
          className={`font-display ${s.text} text-primary font-semibold tracking-tight leading-none`}
        >
          {config.appName}
        </span>
      )}
    </>
  );

  const wrapperClass = `inline-flex items-center ${s.gap} transition-opacity duration-200 hover:opacity-90 ${className}`;

  if (!showLink) {
    return <div className={wrapperClass}>{content}</div>;
  }

  return (
    <Link href={href} className={wrapperClass} aria-label={`${config.appName} inicio`}>
      {content}
    </Link>
  );
}
