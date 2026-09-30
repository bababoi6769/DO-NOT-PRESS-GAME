/* tiny synthesized feedback — no audio files, all oscillators.
   volume is kept deliberately low; sounds are rare and short. */

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function ac(): AudioContext | null {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur = 0.05, type: OscillatorType = "square", vol = 0.035, when = 0) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + when;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  /* physical click of the button */
  press() {
    tone(210, 0.05, "square", 0.038);
    tone(96, 0.09, "triangle", 0.045, 0.008);
  },
  /* refusal */
  deny() {
    tone(130, 0.07, "sawtooth", 0.045);
    tone(98, 0.08, "sawtooth", 0.035, 0.07);
  },
  /* trophy unlock — soft two-tone */
  unlock() {
    tone(523.25, 0.07, "square", 0.036);
    tone(783.99, 0.1, "square", 0.032, 0.085);
  },
  /* heavy low thud for rare events */
  rare() {
    tone(74, 0.34, "sine", 0.075);
    tone(148, 0.12, "triangle", 0.03, 0.02);
  },
  /* single typewriter blip */
  blip() {
    tone(1100 + Math.random() * 500, 0.014, "square", 0.007);
  },
  /* notification ding */
  note() {
    tone(880, 0.045, "square", 0.022);
  },
  /* error buzz */
  warn() {
    tone(160, 0.09, "sawtooth", 0.034);
  },
  /* konami-style arpeggio */
  konami() {
    const seq = [392, 440, 494, 523, 587, 659, 784, 880];
    seq.forEach((f, i) => tone(f, 0.06, "square", 0.03, i * 0.055));
  },
};
