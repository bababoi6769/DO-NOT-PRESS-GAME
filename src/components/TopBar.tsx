import { BookOpenText, Volume2, VolumeX } from "lucide-react";

interface Props {
  discoveredCount: number;
  totalEvents: number;
  soundOn: boolean;
  onLogoClick: () => void;
  onToggleSound: () => void;
  onOpenGuide: () => void;
}

export function TopBar({
  discoveredCount,
  totalEvents,
  soundOn,
  onLogoClick,
  onToggleSound,
  onOpenGuide,
}: Props) {
  return (
    <header className="border-b border-[var(--line)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        {/* wordmark — a red square. that's the whole logo. */}
        <button
          onClick={onLogoClick}
          className="group flex cursor-pointer items-center gap-3 text-left"
          aria-label="Chaos Button"
        >
          <span className="block h-3 w-3 bg-[var(--red)] transition-transform duration-150 group-hover:rotate-90" />
          <span className="font-display text-[15px] font-black tracking-[0.18em]">
            CHAOS BUTTON
          </span>
          <span className="hidden text-[11px] tracking-[0.06em] text-[var(--ink-soft)] sm:inline">
            — an interactive experiment in poor decisions
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGuide}
            className="flex cursor-pointer items-center gap-2 border border-[var(--line)] bg-transparent px-3 py-1.5 text-[11px] tracking-[0.1em] transition-colors hover:border-[var(--ink)]"
          >
            <BookOpenText size={13} strokeWidth={2} />
            <span>
              GUIDE {String(discoveredCount).padStart(2, "0")}/{totalEvents}
            </span>
          </button>
          <button
            onClick={onToggleSound}
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center border border-[var(--line)] transition-colors hover:border-[var(--ink)]"
            aria-label={soundOn ? "mute sounds" : "enable sounds"}
          >
            {soundOn ? (
              <Volume2 size={13} strokeWidth={2} />
            ) : (
              <VolumeX size={13} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
