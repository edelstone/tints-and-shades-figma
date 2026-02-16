import {
  getAnalogousHexes,
  getComplementaryHex,
  getSplitComplementaryHexes,
  getTriadicHexes,
  hexToRgb,
  normalizeHex
} from "@edelstone/tints-and-shades";

export type PaletteType =
  | "complementary"
  | "split-complementary"
  | "analogous"
  | "triadic";

export function normalizeHexInput(value: string): string | null {
  const normalized = normalizeHex(value);
  return normalized ? `#${normalized}` : null;
}

function getRelatedHexes(baseHex: string, paletteType: PaletteType): string[] {
  switch (paletteType) {
    case "split-complementary":
      return getSplitComplementaryHexes(baseHex).map((hex) => `#${hex}`);
    case "analogous":
      return getAnalogousHexes(baseHex).map((hex) => `#${hex}`);
    case "triadic":
      return getTriadicHexes(baseHex).map((hex) => `#${hex}`);
    default:
      return [`#${getComplementaryHex(baseHex)}`];
  }
}

export function expandRelatedHexes(
  hexes: string[],
  paletteType: PaletteType
): string[] {
  const expanded = new Set<string>();
  for (const hex of hexes) {
    const normalized = normalizeHexInput(hex);
    if (!normalized) continue;
    expanded.add(normalized);
    for (const relatedHex of getRelatedHexes(normalized, paletteType)) {
      expanded.add(relatedHex);
    }
  }
  return [...expanded];
}

export function hexToRgb01(hex: string): RGB {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    throw new TypeError(`Invalid hex color: "${hex}"`);
  }
  const rgb = hexToRgb(normalized);
  return {
    r: rgb.red / 255,
    g: rgb.green / 255,
    b: rgb.blue / 255
  };
}
