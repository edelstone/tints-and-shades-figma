/// <reference types="@figma/plugin-typings" />

// --- UI setup --------------------------------------------------------------

figma.showUI(__html__, {
  width: 320,
  height: 240,
  title: "Tint and Shade Generator"
});

// Receive messages from UI
figma.ui.onmessage = async (msg: {
  type: string;
  hex?: string;
  stepPercent?: number;
  stepCount?: number;
  createStyles?: boolean;
  darkBackground?: boolean;
}) => {
  if (msg.type !== "generate") return;

  const rawInput: string = (msg.hex || "").trim();
  const stepCount: number = msg.stepCount || 10;
  const stepPercent: number = 100 / stepCount;
  const createStyles: boolean = !!msg.createStyles;
  const darkBackground: boolean = !!msg.darkBackground;
  const labelColor = darkBackground
    ? { r: 230 / 255, g: 230 / 255, b: 230 / 255 } // #e6e6e6
    : { r: 0, g: 0, b: 0 };
  const DARK_BG = { r: 26 / 255, g: 26 / 255, b: 26 / 255 }; // #1a1a1a

  if (!rawInput) {
    figma.notify("Please enter at least one hex color.");
    return;
  }

  // Allow multiple colors: split on spaces and commas
  const rawTokens = rawInput.split(/[\s,]+/);

  const hexList: string[] = [];
  for (const token of rawTokens) {
    if (!token) continue;
    const normalized = normalizeHex(token);
    if (!isValidHex(normalized)) {
      figma.notify(`Invalid hex color: "${token}". Use 3- or 6-digit hex.`);
      return;
    }
    hexList.push(normalized);
  }

  if (hexList.length === 0) {
    figma.notify("Please enter at least one valid hex color.");
    return;
  }

  // Load font once for all labels
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" });

  // Parent frame to stack multiple palettes vertically
  const parent = figma.createFrame();
  parent.name = "Tints & Shades";
  parent.layoutMode = "VERTICAL";
  parent.primaryAxisSizingMode = "AUTO";
  parent.counterAxisSizingMode = "AUTO";
  parent.paddingLeft = parent.paddingRight = 0;
  parent.paddingTop = parent.paddingBottom = 0;

  const createdFrames: SceneNode[] = [];

  for (const hex of hexList) {
    const palette = generatePalette(hex, stepPercent);

    const swatchSize = 64;
    const rowGap = 8;

    // Outer frame: base column + palette rows
    const frame = figma.createFrame();
    frame.name = `${hex.toLowerCase().replace("#", "")}`; // frame under Tints & Shades
    frame.layoutMode = "HORIZONTAL";
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "AUTO";
    frame.itemSpacing = 16;
    frame.paddingLeft = frame.paddingRight = 16;
    frame.paddingTop = frame.paddingBottom = 16;

    if (darkBackground) {
      frame.fills = [{ type: "SOLID", color: DARK_BG }];
    } else {
      frame.fills = [];
    }

    // Left: base color block with label under it
    const baseWrapper = figma.createFrame();
    baseWrapper.name = "Base";
    baseWrapper.layoutMode = "VERTICAL";
    baseWrapper.primaryAxisSizingMode = "AUTO";
    baseWrapper.counterAxisSizingMode = "AUTO";
    baseWrapper.itemSpacing = 4;
    baseWrapper.counterAxisAlignItems = "CENTER";
    baseWrapper.fills = [];

    const baseRect = figma.createRectangle();
    baseRect.name = "Swatch";
    baseRect.resize(swatchSize * 2, swatchSize * 2);
    baseRect.fills = [{ type: "SOLID", color: hexToRgb01(hex) }];

    if (createStyles) {
      const baseStyle = figma.createPaintStyle();
      baseStyle.name = `Tints & Shades/${hex.toLowerCase().replace("#", "")}/Base`; // styles parent
      baseStyle.paints = baseRect.fills;
    }

    const baseLabel = figma.createText();
    baseLabel.name = hex.toLowerCase().replace("#", "");
    baseLabel.fontName = { family: "Roboto", style: "Regular" };
    baseLabel.characters = hex.toLowerCase();
    baseLabel.fontSize = 10;
    baseLabel.textAlignHorizontal = "CENTER";
    baseLabel.textAutoResize = "WIDTH_AND_HEIGHT";
    baseLabel.fills = [{ type: "SOLID", color: labelColor }];

    baseWrapper.appendChild(baseRect);
    baseWrapper.appendChild(baseLabel);
    frame.appendChild(baseWrapper);

    // Right: vertical stack of shades + tints rows
    const paletteFrame = figma.createFrame();
    paletteFrame.name = "Palette";
    paletteFrame.layoutMode = "VERTICAL";
    paletteFrame.primaryAxisSizingMode = "AUTO";
    paletteFrame.counterAxisSizingMode = "AUTO";
    paletteFrame.itemSpacing = rowGap;
    paletteFrame.fills = [];
    frame.appendChild(paletteFrame);

    // Shades row
    const shadesRow = figma.createFrame();
    shadesRow.name = "Shades";
    shadesRow.layoutMode = "HORIZONTAL";
    shadesRow.primaryAxisSizingMode = "AUTO";
    shadesRow.counterAxisSizingMode = "AUTO";
    shadesRow.itemSpacing = 8;
    shadesRow.fills = [];
    paletteFrame.appendChild(shadesRow);

    // Tints row
    const tintsRow = figma.createFrame();
    tintsRow.name = "Tints";
    tintsRow.layoutMode = "HORIZONTAL";
    tintsRow.primaryAxisSizingMode = "AUTO";
    tintsRow.counterAxisSizingMode = "AUTO";
    tintsRow.itemSpacing = 8;
    tintsRow.fills = [];
    paletteFrame.appendChild(tintsRow);

    // Shades: lightest → darkest (step 10 → step 90)
    const shades = palette
      .filter((p) => p.role === "shade")
      .sort((a, b) => a.step - b.step);

    for (const swatch of shades) {
      const stepName = formatStepLabel(swatch.step);
      const stepFrame = figma.createFrame();
      stepFrame.name = stepName;
      stepFrame.layoutMode = "VERTICAL";
      stepFrame.primaryAxisSizingMode = "AUTO";
      stepFrame.counterAxisSizingMode = "AUTO";
      stepFrame.itemSpacing = 4;
      stepFrame.counterAxisAlignItems = "CENTER";
      stepFrame.fills = [];

      const rect = figma.createRectangle();
      rect.resize(swatchSize, swatchSize);
      rect.name = "Swatch";
      rect.fills = [{ type: "SOLID", color: hexToRgb01(swatch.hex) }];

      const label = figma.createText();
      label.name = swatch.hex.toLowerCase().replace("#", "");
      label.fontName = { family: "Roboto", style: "Regular" };
      label.characters = swatch.hex.toLowerCase();
      label.fontSize = 10;
      label.textAlignHorizontal = "CENTER";
      label.textAutoResize = "WIDTH_AND_HEIGHT";
      label.fills = [{ type: "SOLID", color: labelColor }];

      stepFrame.appendChild(rect);
      stepFrame.appendChild(label);
      shadesRow.appendChild(stepFrame);

      if (createStyles) {
        const style = figma.createPaintStyle();
        style.name = `Tints & Shades/${hex
          .toLowerCase()
          .replace("#", "")}/Shades/${stepName}`;
        style.paints = rect.fills;
      }
    }

    // Tints: darkest tint (10%) → lightest tint (90%)
    const tints = palette
      .filter((p) => p.role === "tint")
      .sort((a, b) => a.step - b.step);

    for (const swatch of tints) {
      const stepName = formatStepLabel(swatch.step);
      const stepFrame = figma.createFrame();
      stepFrame.name = stepName;
      stepFrame.layoutMode = "VERTICAL";
      stepFrame.primaryAxisSizingMode = "AUTO";
      stepFrame.counterAxisSizingMode = "AUTO";
      stepFrame.itemSpacing = 4;
      stepFrame.counterAxisAlignItems = "CENTER";
      stepFrame.fills = [];

      const rect = figma.createRectangle();
      rect.resize(swatchSize, swatchSize);
      rect.name = "Swatch";
      rect.fills = [{ type: "SOLID", color: hexToRgb01(swatch.hex) }];

      const label = figma.createText();
      label.name = swatch.hex.toLowerCase();
      label.fontName = { family: "Roboto", style: "Regular" };
      label.characters = swatch.hex.toLowerCase();
      label.fontSize = 10;
      label.textAlignHorizontal = "CENTER";
      label.textAutoResize = "WIDTH_AND_HEIGHT";
      label.fills = [{ type: "SOLID", color: labelColor }];

      stepFrame.appendChild(rect);
      stepFrame.appendChild(label);
      tintsRow.appendChild(stepFrame);

      if (createStyles) {
        const style = figma.createPaintStyle();
        style.name = `Tints & Shades/${hex
          .toLowerCase()
          .replace("#", "")}/Tints/${stepName}`;
        style.paints = rect.fills;
      }
    }

    // Now that rows are laid out, match baseRect height to two rows + gap
    const rowsHeight = paletteFrame.height;
    const labelHeight = baseLabel.height;
    const spacing = baseWrapper.itemSpacing;
    const newBaseRectHeight = rowsHeight - labelHeight - spacing;
    if (newBaseRectHeight > 0) {
      baseRect.resize(baseRect.width, newBaseRectHeight);
    }

    parent.appendChild(frame);
    createdFrames.push(frame);
  }

  figma.currentPage.appendChild(parent);
  figma.viewport.scrollAndZoomIntoView([parent]);
};


// --- Color math (mirrors maketintsandshades.com) --------------------------
// Calculation method matches the site’s docs:
// Tints: new = current + ((255 - current) * tintFactor)
// Shades: new = current * shadeFactor

type Role = "tint" | "shade" | "base";

interface Swatch {
  role: Role;
  step: number;   // 0–100
  hex: string;
  label: string;  // e.g. "shade-10", "base", "tint-40"
}

function normalizeHex(hex: string): string {
  const cleaned = hex.trim().replace(/^#/, "");
  if (cleaned.length === 3) {
    return (
      "#" +
      cleaned
        .split("")
        .map((ch) => ch + ch)
        .join("")
        .toLowerCase()
    );
  }
  return "#" + cleaned.toLowerCase();
}

function isValidHex(hex: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(hex);
}

function hexToRgb255(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return { r, g, b };
}

function componentToHex(c: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(c)));
  const s = clamped.toString(16);
  return s.length === 1 ? "0" + s : s;
}

function rgb255ToHex(r: number, g: number, b: number): string {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb01(hex: string): RGB {
  const { r, g, b } = hexToRgb255(hex);
  return { r: r / 255, g: g / 255, b: b / 255 };
}

function formatStepLabel(step: number): string {
  const scaledStep = Math.round(step * 10);
  return scaledStep.toString();
}

function generatePalette(baseHex: string, stepPercent: number): Swatch[] {
  const { r, g, b } = hexToRgb255(baseHex);
  const maxSteps = Math.floor(95 / stepPercent);

  const swatches: Swatch[] = [];

  // shades: multiply by shadeFactor = 1 - step
  for (let i = 1; i <= maxSteps; i++) {
    const shadeFactor = 1 - (stepPercent * i) / 100;
    const nr = r * shadeFactor;
    const ng = g * shadeFactor;
    const nb = b * shadeFactor;
    const hex = rgb255ToHex(nr, ng, nb);
    const step = stepPercent * i;
    swatches.push({
      role: "shade",
      step,
      hex,
      label: `shade-${step}`
    });
  }

  // base
  swatches.push({
    role: "base",
    step: 0,
    hex: baseHex,
    label: "base"
  });

  // tints: current + (255 - current) * tintFactor
  for (let i = 1; i <= maxSteps; i++) {
    const tintFactor = (stepPercent * i) / 100;
    const nr = r + (255 - r) * tintFactor;
    const ng = g + (255 - g) * tintFactor;
    const nb = b + (255 - b) * tintFactor;
    const hex = rgb255ToHex(nr, ng, nb);
    const step = stepPercent * i;
    swatches.push({
      role: "tint",
      step,
      hex,
      label: `tint-${step}`
    });
  }

  return swatches;
}
