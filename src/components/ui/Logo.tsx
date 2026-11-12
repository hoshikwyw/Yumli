interface LogoProps {
  /** Hide the word "Yumli" where space is tight; the egg alone still says who we are. */
  nameClassName?: string;
  className?: string;
}

/**
 * The Yumli logo: the pixel egg and the name. The egg is the same file as the
 * browser-tab icon (drawn by scripts/generate-icons.mjs), so the two can never
 * drift apart. Decorative: the link around it carries the accessible name.
 */
export default function Logo({ nameClassName = '', className = '' }: LogoProps) {
  return (
    <span aria-hidden="true" className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src="/favicon.svg" alt="" width={36} height={36} className="w-9 h-9 shrink-0" />
      <span className={`font-pixel text-sm sm:text-base tracking-wide ${nameClassName}`}>Yumli</span>
    </span>
  );
}
