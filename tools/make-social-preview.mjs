/* ————————————————————————————————————————————————
   Regenerates public/social-preview.png — the 1200x630 Open Graph card.

   This is a one-off design tool, not part of the build, so its dependencies
   are deliberately NOT in package.json (they would add ~30 MB of sharp
   binaries to every `npm ci` for a file that changes almost never).

   To run it, from the repository root:

     npm i --no-save sharp text-to-svg @fontsource/archivo @fontsource/ibm-plex-mono
     node tools/make-social-preview.mjs
     npx sharp-cli -i tools/social-preview.svg -o public/social-preview.png resize 1200 630

   or simply: node tools/make-social-preview.mjs && node -e "require('sharp')('tools/social-preview.svg').resize(1200,630).png().toFile('public/social-preview.png')"

   The card is drawn from real outlines of the same two typefaces the game
   ships, so it stays visually identical to the running app. opentype.js cannot
   read woff2, hence the static woff files from the @fontsource packages above
   rather than the ones vendored in src/assets/fonts.
———————————————————————————————————————————————— */
import { writeFileSync } from "node:fs";
import TextToSVG from "text-to-svg";

const ARCHIVO = "node_modules/@fontsource/archivo/files/archivo-latin-900-normal.woff";
const PLEX400 = "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff";
const PLEX600 = "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff";

const heavy = TextToSVG.loadSync(ARCHIVO);
const mono = TextToSVG.loadSync(PLEX400);
const monoBold = TextToSVG.loadSync(PLEX600);

const PAPER = "#f2efe7";
const INK = "#181511";
const SOFTC = "#6b6558";
const LINE = "rgba(24,21,17,0.16)";
const RED = "#d92c1d";
const CREAM = "#fdf9ef";

const W = 1200;
const H = 630;
const parts = [];

/** text as vector outlines — no font needed at render time.
 *  y is a BASELINE. letterSpacing is in em, as opentype.js expects. */
const text = (font, str, { x, y, size, em = 0, fill = INK, anchor = "left" }) => {
  const width = font.getMetrics(str, { fontSize: size, letterSpacing: em }).width;
  const px = anchor === "right" ? x - width : anchor === "center" ? x - width / 2 : x;
  const d = font.getD(str, { x: px, y, fontSize: size, letterSpacing: em });
  parts.push(`<path d="${d}" fill="${fill}"/>`);
  return width;
};

const measure = (font, str, size, em = 0) =>
  font.getMetrics(str, { fontSize: size, letterSpacing: em }).width;

const rect = (x, y, w, h, fill, r = 0, stroke = null, sw = 0) =>
  parts.push(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill ?? "none"}"` +
      (stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : "") +
      `/>`,
  );

const hline = (x1, x2, y) =>
  parts.push(`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${LINE}" stroke-width="1"/>`);

/* ————— canvas ————— */
rect(0, 0, W, H, PAPER);

/* instrument frame + crop marks, as on the chamber */
const F = 34;
rect(F, F, W - F * 2, H - F * 2, null, 0, INK, 2);
const C = 18;
[
  [F, F, 1, 1],
  [W - F, F, -1, 1],
  [F, H - F, 1, -1],
  [W - F, H - F, -1, -1],
].forEach(([cx, cy, sx, sy]) =>
  parts.push(
    `<path d="M ${cx} ${cy + sy * C} L ${cx} ${cy} L ${cx + sx * C} ${cy}" fill="none" stroke="${INK}" stroke-width="2"/>`,
  ),
);

const L = 66;
const R = W - 66;

/* ————— header ————— */
rect(L, 76, 15, 15, RED);
text(heavy, "CHAOS BUTTON", { x: L + 15 + 16, y: 92, size: 30, em: 0.16 });

const guide = "GUIDE 00/28";
const guideW = measure(mono, guide, 15, 0.1);
rect(R - guideW - 30, 66, guideW + 30, 36, null, 0, LINE, 1);
text(mono, guide, { x: R - 15, y: 90, size: 15, em: 0.1, fill: SOFTC, anchor: "right" });

hline(L, R, 124);

/* ————— the button ————— */
const LABEL = "DO NOT PRESS";
const SIZE = 68;
const EM = 0.075;
const bw = measure(heavy, LABEL, SIZE, EM) + 200;
const bh = 184;
const bx = (W - bw) / 2;
const by = 190;

rect(bx + 16, by + 16, bw, bh, INK, 18); // hard offset shadow — the app's only shadow motif
rect(bx, by, bw, bh, RED, 18, INK, 4);
text(heavy, LABEL, {
  x: W / 2,
  y: by + bh / 2 + SIZE * 0.35,
  size: SIZE,
  em: EM,
  fill: CREAM,
  anchor: "center",
});

/* ————— console line ————— */
text(mono, "001", { x: L, y: 430, size: 21, fill: SOFTC });
text(mono, "you were told not to.", { x: L + 52, y: 430, size: 21 });

/* ————— trophy chips ————— */
const chips = ["CURIOSITY", "REPEAT OFFENDER", "NIHILIST"];
let cx = L;
chips.forEach((label) => {
  const w = measure(mono, label, 13, 0.14) + 48;
  rect(cx, 452, w, 34, null, 0, INK, 2);
  rect(cx + 13, 465, 8, 8, RED);
  text(mono, label, { x: cx + 31, y: 475, size: 13, em: 0.14 });
  cx += w + 12;
});

/* ————— footer ————— */
hline(L, R, 520);
text(mono, "an interactive experiment in poor decision making", {
  x: L,
  y: 560,
  size: 15,
  em: 0.08,
  fill: SOFTC,
});
text(monoBold, "NOTHING IS SENT ANYWHERE", {
  x: R,
  y: 560,
  size: 15,
  em: 0.12,
  anchor: "right",
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join("")}</svg>`;
writeFileSync("social-preview.svg", svg);
console.log("svg written:", svg.length, "bytes");
