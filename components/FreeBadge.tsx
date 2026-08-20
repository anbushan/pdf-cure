/** Small "FREE" pill — used wherever pricing shows up during the MVP release, since every tool (and the whole site) is free right now. */
export default function FreeBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`eyebrow inline-flex items-center rounded-full bg-teal-light px-2 py-1 text-teal-dark ${className}`}>
      Free
    </span>
  );
}
