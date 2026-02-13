import { calculateShades, calculateTints } from "@edelstone/tints-and-shades";

export function generatePalette(baseHex, stepPercent) {
  const input = baseHex.replace("#", "");
  const maxSteps = Math.floor(95 / stepPercent);
  const stepRatios = Array.from({ length: maxSteps }, (_, index) =>
    Number((((index + 1) * stepPercent) / 100).toFixed(4))
  );

  const shades = calculateShades(input, stepRatios).map((color) => ({
    role: "shade",
    step: color.percent,
    hex: `#${color.hex.toLowerCase()}`,
    label: `shade-${color.percent}`
  }));
  const tints = calculateTints(input, stepRatios).map((color) => ({
    role: "tint",
    step: color.percent,
    hex: `#${color.hex.toLowerCase()}`,
    label: `tint-${color.percent}`
  }));

  return [
    ...shades,
    {
      role: "base",
      step: 0,
      hex: baseHex,
      label: "base"
    },
    ...tints
  ];
}
