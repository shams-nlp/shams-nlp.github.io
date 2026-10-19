// Colour and type tokens. Source: shams-nlp.github.io/index.html (:root), which
// samples Ben's poster draft. Change a value here and every scene follows.
export const C = {
  ivory: "#FCF9F1",
  ink: "#201C3C",
  flame: "#E84226",
  ember: "#E06945",
  coral: "#E56B6F",
  sky: "#4D8AC8",
  violet: "#876BAD",
  lilac: "#A894C4",
  magenta: "#B961A2",
  peach: "#FBE4D5",
  paleBlue: "#DBE2E5",
  wine: "#9D1E46",
  muted: "#4F4F4E",
  rule: "#C9C4CF",
  frameBlue: "#3D38A3",
} as const;

export const F = {
  head: "'Inter Tight', 'Helvetica Neue', Arial, sans-serif",
  body: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
  serif: "'Tinos', 'Times New Roman', serif",
  arabic: "'IBM Plex Sans Arabic', 'Noto Naskh Arabic', 'Geeza Pro', serif",
} as const;

// Variety colours, as in Table 1 of the project page.
export const VARIETIES = ["Leb", "Jor", "Syr", "P-Urb", "P-Rur"] as const;
export type Variety = (typeof VARIETIES)[number];
export const VAR_COLOR: Record<Variety, string> = {
  Leb: C.coral,
  Jor: C.magenta,
  Syr: C.sky,
  "P-Urb": C.lilac,
  "P-Rur": C.violet,
};
export const VAR_NAME: Record<Variety, string> = {
  Leb: "Lebanese",
  Jor: "Jordanian",
  Syr: "Syrian",
  "P-Urb": "Pal./Urban",
  "P-Rur": "Pal./Rural",
};
