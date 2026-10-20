import React, { useId } from "react";
import { interpolate } from "remotion";
import { FIG1_DEFS, FIG1_VIEWBOX, fig1Parts, type Fig1PartName } from "./fig1Parts";
import { POP } from "../lib/scene";

/**
 * Figure 1 of the paper ("One word, five pronunciations") as a native Remotion
 * component. All shapes come from fig1Parts.ts (generated from ref/paper-page1.svg
 * by scripts/extract_fig1.py). No AbsoluteFill, no background: embed it anywhere.
 *
 * The component has no clock. Every part is driven by a progress value from 0 to 1.
 * Pass eased values for `wordProgress`, `mapProgress`, `lineProgress` and
 * `labelProgress`, and a plain linear value for `dotProgress` (the dot applies POP itself).
 * At all ones the figure is the paper's figure.
 *
 * Differences from the paper: the white paper behind the figure (part `backing`) and the
 * land fill (part `land`, ivory, almost the colour of the scene) are left out, because
 * the scene paints its own ivory. Set `paper` to draw both.
 */

/** One value per variety, keyed 1 to 5 from the top label (Lebanese) to the bottom (Jordanian). */
export type PerVariety = Record<1 | 2 | 3 | 4 | 5, number>;
export const VARIETY_KEYS = [1, 2, 3, 4, 5] as const;
export const perVariety = (value: number | ((i: 1 | 2 | 3 | 4 | 5) => number)): PerVariety => {
  const g = (i: 1 | 2 | 3 | 4 | 5) => (typeof value === "function" ? value(i) : value);
  return { 1: g(1), 2: g(2), 3: g(3), 4: g(4), 5: g(5) };
};

export type Fig1FigureProps = {
  /** Rendered height in px; the width follows the aspect ratio of the figure. */
  height: number;
  /** The word: fades in while its coral and blue outlines settle from a wider offset. */
  wordProgress: number;
  /** The sea fades in, the coast, the river and the lakes draw. */
  mapProgress: number;
  /** Each dot pops with one soft ring. Linear 0 to 1. */
  dotProgress: PerVariety;
  /** Each leader line draws from its dot to its label. */
  lineProgress: PerVariety;
  /** Each label (and the separator under it) rises in. */
  labelProgress: PerVariety;
  /** Extra opacity of each label, 1 = full. A scene uses it to dim labels already read. */
  labelStrength: PerVariety;
  /** Figure units the coral and blue outlines start apart, in total, along their final offset. */
  wordSettle: number;
  /** Px a label rises while it fades in. */
  labelRise: number;
  /** Largest scale of a dot during its pop is about 1.1; this is the ring radius at its end, in dot radii. */
  ringGrowth: number;
  /** Opacity of the ring at its strongest. */
  ringOpacity: number;
  /** Stroke width of the ring, figure units. */
  ringStroke: number;
  /** Draw the white paper of the page and the land fill behind the figure. */
  paper: boolean;
};

export const fig1Defaults: Fig1FigureProps = {
  height: 940,
  wordProgress: 1,
  mapProgress: 1,
  dotProgress: perVariety(1),
  lineProgress: perVariety(1),
  labelProgress: perVariety(1),
  labelStrength: perVariety(1),
  wordSettle: 3,
  labelRise: 16,
  ringGrowth: 1.9,
  ringOpacity: 0.55,
  ringStroke: 0.5,
  paper: false,
};

/** Width over height of the figure. */
export const FIG1_ASPECT = FIG1_VIEWBOX.width / FIG1_VIEWBOX.height;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** `p` mapped from [a, b] to [0, 1], clamped. */
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

const Raw: React.FC<{ markup: string }> = ({ markup }) => <g dangerouslySetInnerHTML={{ __html: markup }} />;

/** Add a dash pattern to the first path of a markup string, so that `shown` of it is drawn. */
const drawn = (markup: string, length: number, shown: number): string =>
  shown >= 1
    ? markup
    : markup.replace("<path ", `<path stroke-dasharray="${length} ${length}" stroke-dashoffset="${length * (1 - shown)}" `);

const part = (name: Fig1PartName) => fig1Parts[name];

/** Box of the word in figure units. Exported so a scene can aim a camera at it. */
export const FIG1_WORD_BOX = fig1Parts.word.bbox;
/** Centre of the word in figure units. */
export const FIG1_WORD_CENTER = {
  x: FIG1_WORD_BOX.x + FIG1_WORD_BOX.width / 2,
  y: FIG1_WORD_BOX.y + FIG1_WORD_BOX.height / 2,
};

// ---- the parts

const Word: React.FC<{ p: number; settle: number }> = ({ p, settle }) => {
  const w = part("word");
  const g = w.groups!;
  const off = w.strokeOffset!;
  const len = Math.hypot(off.x, off.y) || 1;
  const spread = (1 - p) * settle; // total extra distance between the two outlines
  const dx = (off.x / len) * (spread / 2);
  const dy = (off.y / len) * (spread / 2);
  const settled = p >= 1;
  return (
    <g opacity={p}>
      {g.fill.map((i) => (
        <Raw key={`f${i}`} markup={w.items[i]} />
      ))}
      <g transform={settled ? undefined : `translate(${-dx} ${-dy})`}>
        {g.blue.map((i) => (
          <Raw key={`b${i}`} markup={w.items[i]} />
        ))}
      </g>
      <g transform={settled ? undefined : `translate(${dx} ${dy})`}>
        {g.coral.map((i) => (
          <Raw key={`c${i}`} markup={w.items[i]} />
        ))}
      </g>
    </g>
  );
};

const Sea: React.FC<{ p: number }> = ({ p }) => {
  const sea = part("sea");
  const coast = part("coast");
  const fade = seg(p, 0, 0.6);
  const draw = seg(p, 0.1, 1);
  return (
    <>
      <g opacity={fade}>
        <Raw markup={sea.items.join("")} />
      </g>
      <g opacity={p > 0 ? 1 : 0}>
        {coast.items.map((m, i) => {
          const len = coast.lengths[i];
          if (len == null) return <g key={i} opacity={fade}><Raw markup={m} /></g>; // lake fill
          return <Raw key={i} markup={drawn(m, len, draw)} />;
        })}
      </g>
    </>
  );
};

const Separators: React.FC<{ progress: number[] }> = ({ progress }) => {
  const s = part("separators");
  // 12 items: three per separator (end tick, dotted run, end tick), top to bottom.
  return (
    <>
      {s.items.map((m, i) => {
        const p = progress[Math.floor(i / 3)] ?? 1;
        return p <= 0 ? null : (
          <g key={i} opacity={p}>
            <Raw markup={m} />
          </g>
        );
      })}
    </>
  );
};

const Line: React.FC<{ k: 1 | 2 | 3 | 4 | 5; p: number; maskId: string }> = ({ k, p, maskId }) => {
  const l = part(`line${k}` as Fig1PartName);
  if (p <= 0) return null;
  const [dashes, bullet] = l.items;
  const total = l.pathLength ?? 1;
  const done = p >= 1;
  const bulletP = seg(p, 0.85, 1);
  return (
    <>
      {done ? null : (
        <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={FIG1_VIEWBOX.width} height={FIG1_VIEWBOX.height}>
          <path
            d={l.trace}
            fill="none"
            stroke="#fff"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${total} ${total}`}
            strokeDashoffset={total * (1 - p)}
          />
        </mask>
      )}
      <g mask={done ? undefined : `url(#${maskId})`}>
        <Raw markup={dashes} />
      </g>
      <g opacity={bulletP}>
        <Raw markup={bullet} />
      </g>
    </>
  );
};

const Dot: React.FC<{ k: 1 | 2 | 3 | 4 | 5; p: number; ringGrowth: number; ringOpacity: number; ringStroke: number }> = ({
  k, p, ringGrowth, ringOpacity, ringStroke,
}) => {
  const d = part(`dot${k}` as Fig1PartName);
  if (p <= 0) return null;
  const { x, y } = d.center!;
  const r = d.radius!;
  const s = interpolate(p, [0, 1], [0, 1], { easing: POP });
  const ring = seg(p, 0.15, 1);
  return (
    <>
      {ring > 0 && ring < 1 ? (
        <circle
          cx={x}
          cy={y}
          r={r * (1 + (ringGrowth - 1) * ring)}
          fill="none"
          stroke={d.color}
          strokeWidth={ringStroke}
          opacity={ringOpacity * (1 - ring)}
        />
      ) : null}
      <g
        opacity={seg(p, 0, 0.25)}
        transform={p >= 1 ? undefined : `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}
      >
        <Raw markup={d.items.join("")} />
      </g>
    </>
  );
};

const Label: React.FC<{ k: 1 | 2 | 3 | 4 | 5; p: number; strength: number; rise: number }> = ({ k, p, strength, rise }) => {
  const l = part(`label${k}` as Fig1PartName);
  if (p <= 0) return null;
  return (
    <g opacity={p * strength} transform={p >= 1 ? undefined : `translate(0 ${(1 - p) * rise})`}>
      <Raw markup={l.items.join("")} />
    </g>
  );
};

export const Fig1Figure: React.FC<Partial<Fig1FigureProps>> = (input) => {
  const props: Fig1FigureProps = { ...fig1Defaults, ...input };
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { height } = props;
  const width = height * FIG1_ASPECT;
  const unit = height / FIG1_VIEWBOX.height; // px per figure unit
  const rise = props.labelRise / unit;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${FIG1_VIEWBOX.x} ${FIG1_VIEWBOX.y} ${FIG1_VIEWBOX.width} ${FIG1_VIEWBOX.height}`}
      width={width}
      height={height}
      style={{ display: "block", overflow: "visible", background: "transparent" }}
    >
      <defs dangerouslySetInnerHTML={{ __html: FIG1_DEFS }} />
      {props.paper ? <Raw markup={part("backing").items.join("")} /> : null}
      {props.paper ? <Raw markup={part("land").items.join("")} /> : null}
      <Sea p={props.mapProgress} />
      <Separators progress={[props.labelProgress[1], props.labelProgress[2], props.labelProgress[3], props.labelProgress[4]]} />
      {VARIETY_KEYS.map((k) => (
        <Line key={`l${k}`} k={k} p={props.lineProgress[k]} maskId={`${uid}-reveal${k}`} />
      ))}
      {VARIETY_KEYS.map((k) => (
        <Dot key={`d${k}`} k={k} p={props.dotProgress[k]} ringGrowth={props.ringGrowth} ringOpacity={props.ringOpacity} ringStroke={props.ringStroke} />
      ))}
      {VARIETY_KEYS.map((k) => (
        <Label key={`t${k}`} k={k} p={props.labelProgress[k]} strength={props.labelStrength[k]} rise={rise} />
      ))}
      <Word p={props.wordProgress} settle={props.wordSettle} />
    </svg>
  );
};
