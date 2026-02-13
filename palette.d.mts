export type Role = "tint" | "shade" | "base";

export interface Swatch {
  role: Role;
  step: number;
  hex: string;
  label: string;
}

export declare function generatePalette(
  baseHex: string,
  stepPercent: number
): Swatch[];
