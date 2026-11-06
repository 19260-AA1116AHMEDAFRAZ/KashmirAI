import { Spark } from './Icon';

// "KashmirAI" wordmark: "Kashmir" in deep green, "AI" in green. Always Latin script.
export function Logo({ size = 20 }: { size?: number }) {
  return (
    <span className="latin font-extrabold text-deep" style={{ fontSize: size }}>
      Kashmir<span className="text-green">AI</span>
    </span>
  );
}

// White badge with the spark and wordmark, over the hero photos.
export function LogoBadge() {
  return (
    <div className="absolute start-5 top-4 flex items-center gap-2.5 rounded-2xl bg-white py-1.5 ps-1.5 pe-3.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-deep">
        <Spark size={22} />
      </span>
      <Logo size={20} />
    </div>
  );
}

// Small dark label over a photo, giving the photographer credit.
export function PhotoCredit({ text, className = 'bottom-2.5' }: { text: string; className?: string }) {
  return (
    <span className={`latin absolute end-3 rounded-full bg-[rgba(27,38,33,0.7)] px-2 py-0.5 text-[11px] font-semibold text-white ${className}`}>{text}</span>
  );
}
