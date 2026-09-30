import { useChaos } from "./hooks/useChaos";
import { TopBar } from "./components/TopBar";
import { Stage } from "./components/Stage";
import { Console } from "./components/Console";
import { OverlayHost, Toasts } from "./components/Overlays";
import { ACHIEVEMENTS } from "./chaos/data";

export default function App() {
  const c = useChaos();

  const rootClasses = [
    "flex min-h-svh flex-col overflow-x-hidden bg-[var(--paper)] text-[var(--ink)] sm:h-svh sm:overflow-hidden",
    c.fx.invert ? "fx-invert" : "",
    c.fx.mirror ? "fx-mirror" : "",
    c.fx.hideCursor ? "fx-nocursor" : "",
    c.fx.frozen ? "fx-frozen" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const trophyNames = c.unlocked
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.name ?? "")
    .filter(Boolean);

  return (
    <div className={rootClasses}>
      {/* the wordmark is the visual identity; this gives assistive tech a real heading */}
      <h1 className="sr-only">Chaos Button — an interactive experiment in poor decision making</h1>

      <TopBar
        discoveredCount={c.discoveredCount}
        totalEvents={c.totalEvents}
        soundOn={c.soundOn}
        onLogoClick={c.logoClick}
        onToggleSound={c.toggleSound}
        onOpenGuide={() => c.setGuideOpen(true)}
      />

      {/* remounting this wrapper restarts the shake animation cleanly */}
      <div
        key={c.shakeNonce}
        className={`flex min-h-0 flex-1 flex-col ${c.shakeNonce > 0 ? "fx-shake" : ""}`}
      >
        <main
          className={`flex min-h-0 flex-1 flex-col ${c.flipped ? "flex-col-reverse justify-end" : ""}`}
        >
          <Stage
            btn={c.btn}
            frozen={c.frozen}
            autoPress={c.autoPress}
            denyNonce={c.denyNonce}
            ghosts={c.ghosts}
            tilt={c.fx.tilt}
            stageRef={c.stageRef}
            btnElRef={c.btnElRef}
            onPress={c.press}
            onRightClick={c.rightClick}
          />
          <Console
            counterLabel={c.counterLabel}
            counterDisplay={c.counterDisplay}
            counterMuted={c.counterMuted}
            line={c.line}
            history={c.history}
            trophies={trophyNames}
            pad3={c.pad3}
          />
        </main>
      </div>

      <Toasts toasts={c.toasts} />
      <OverlayHost
        overlay={c.overlay}
        guideOpen={c.guideOpen}
        discovered={c.discovered}
        unlocked={c.unlocked}
        onCloseGuide={() => c.setGuideOpen(false)}
        onReset={c.resetAll}
      />
    </div>
  );
}
