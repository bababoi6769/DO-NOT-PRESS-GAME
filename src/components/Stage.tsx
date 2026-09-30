import type { MouseEvent as ReactMouseEvent, RefObject } from "react";
import type { BtnState, Ghost } from "../chaos/types";

interface Props {
  btn: BtnState;
  frozen: boolean;
  autoPress: boolean;
  denyNonce: number;
  ghosts: Ghost[];
  tilt: boolean;
  stageRef: RefObject<HTMLDivElement | null>;
  btnElRef: RefObject<HTMLButtonElement | null>;
  onPress: () => void;
  onRightClick: (e: ReactMouseEvent) => void;
}

export function Stage({
  btn,
  frozen,
  autoPress,
  denyNonce,
  ghosts,
  tilt,
  stageRef,
  btnElRef,
  onPress,
  onRightClick,
}: Props) {
  const wrapperStyle = {
    transform: `translate(calc(-50% + ${btn.dx}px), calc(-50% + ${btn.dy}px)) scale(${btn.scale}) rotate(${btn.rotate}deg)`,
    opacity: btn.visible ? 1 : 0,
  };

  return (
    <section className="flex flex-1 flex-col px-5 pt-6 sm:px-8">
      <div
        ref={stageRef}
        className={`relative mx-auto flex min-h-[260px] w-full max-w-5xl flex-1 items-center justify-center border border-[var(--line)] sm:min-h-[340px] ${tilt ? "fx-tilt" : ""}`}
      >
        <span className="stage-corner c-tl" />
        <span className="stage-corner c-tr" />
        <span className="stage-corner c-bl" />
        <span className="stage-corner c-br" />

        {/* chamber meta */}
        <span className="pointer-events-none absolute left-4 top-3 text-[10px] tracking-[0.22em] text-[var(--ink-soft)]">
          CHAMBER 01
        </span>
        <span className="pointer-events-none absolute right-4 top-3 text-[10px] tracking-[0.22em] text-[var(--ink-soft)]">
          {frozen ? (
            <span className="rare font-semibold">STATUS: NOT RESPONDING</span>
          ) : (
            "STATUS: NOMINAL"
          )}
        </span>
        <span className="pointer-events-none absolute bottom-3 left-4 text-[10px] tracking-[0.22em] text-[var(--ink-soft)]">
          DO-NOT-PRESS UNIT
        </span>
        <span className="pointer-events-none absolute bottom-3 right-4 text-[10px] tracking-[0.22em] text-[var(--ink-soft)]">
          FIG. 1
        </span>

        {/* ghost decoys */}
        {ghosts.map((g) => (
          <span
            key={g.id}
            className="ghost-btn"
            style={{
              transform: `translate(calc(-50% + ${g.dx + btn.dx}px), calc(-50% + ${
                g.dy + btn.dy
              }px)) rotate(${g.rot}deg)`,
            }}
          >
            {btn.label}
          </span>
        ))}

        {/* the button */}
        <div className="btn-wrapper" style={wrapperStyle}>
          {/* key-change remount restarts the deny animation */}
          <button
            key={denyNonce}
            ref={btnElRef}
            type="button"
            className={`chaos-btn ${denyNonce > 0 ? "fx-deny" : ""} ${autoPress ? "auto" : ""}`}
            onClick={onPress}
            onContextMenu={onRightClick}
            disabled={frozen}
            aria-busy={frozen}
          >
            {btn.label}
          </button>
        </div>
      </div>
    </section>
  );
}
