import Link from "next/link";
import Image from "next/image";
import config from "@/config";

const { iconMark, wordmarkGold } = config.brand;

const iconSizes = {
  sm: { icon: "h-14 w-14", image: 56 },
  md: { icon: "h-16 w-16", image: 64 },
  lg: { icon: "h-[5.25rem] w-[5.25rem]", image: 84 },
};

const textSizes = {
  sm: "text-[1.75rem]",
  md: "text-[2.125rem] md:text-[2.375rem]",
  lg: "text-[2.125rem] md:text-[2.375rem]",
};

function Wordmark({ size = "md" }) {
  const textSize = textSizes[size] ?? textSizes.md;

  return (
    <span
      className={`font-display ${textSize} font-semibold tracking-tight leading-none whitespace-nowrap`}
      aria-hidden="true"
    >
      <span className="text-primary">oremos</span>
      <span style={{ color: wordmarkGold }}>ya</span>
    </span>
  );
}

export default function BrandLogo({
  href = "/",
  variant = "full",
  className = "",
  showLink = true,
  size = "md",
}) {
  const iconSize = iconSizes[size] ?? iconSizes.md;

  const content =
    variant === "icon" ? (
      <Image
        src={iconMark}
        alt={config.appName}
        width={iconSize.image}
        height={iconSize.image}
        className={`${iconSize.icon} shrink-0 object-contain`}
        priority
      />
    ) : (
      <Wordmark size={size} />
    );

  const wrapperClass = `inline-flex items-center transition-opacity duration-200 hover:opacity-90 ${className}`;

  if (!showLink) {
    return (
      <div className={wrapperClass} aria-label={config.appName}>
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={wrapperClass} aria-label={`${config.appName} inicio`}>
      {content}
    </Link>
  );
}
