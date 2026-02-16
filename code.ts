/// <reference types="@figma/plugin-typings" />
import { generatePalette } from "./palette.mjs";
import {
  expandRelatedHexes,
  hexToRgb01,
  normalizeHexInput,
  type PaletteType
} from "./color-api";

// --- UI setup --------------------------------------------------------------

figma.showUI(__html__, {
  width: 320,
  height: 365,
  title: "Tint & Shade Generator"
});

type UiSettings = {
  createStyles?: boolean;
  darkBackground?: boolean;
  includeHashtag?: boolean;
  includePalette?: boolean;
  paletteType?: PaletteType;
  stepCount?: number;
};

const SETTINGS_KEY = "tints-and-shades-settings";

const postSettingsToUi = async () => {
  const settings = await figma.clientStorage.getAsync(SETTINGS_KEY);
  figma.ui.postMessage({ type: "settings", settings });
};

// Receive messages from UI
figma.ui.onmessage = async (msg: {
  type: string;
  hex?: string;
  stepPercent?: number;
  stepCount?: number;
  createStyles?: boolean;
  darkBackground?: boolean;
  includeHashtag?: boolean;
  includePalette?: boolean;
  paletteType?: string;
  settings?: UiSettings;
}) => {
  if (msg.type === "get-settings") {
    await postSettingsToUi();
    return;
  }

  if (msg.type === "set-settings") {
    await figma.clientStorage.setAsync(SETTINGS_KEY, msg.settings || {});
    return;
  }

  if (msg.type !== "generate") return;

  const rawInput: string = (msg.hex || "").trim();
  const stepCount: number = msg.stepCount || 10;
  const stepPercent: number = 100 / stepCount;
  const createStyles: boolean = !!msg.createStyles;
  const darkBackground: boolean = !!msg.darkBackground;
  const includeHashtag: boolean = !!msg.includeHashtag;
  const includePalette: boolean = !!msg.includePalette;
  const paletteType: PaletteType = normalizePaletteType(msg.paletteType);
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
    const normalized = normalizeHexInput(token);
    if (!normalized) {
      figma.notify(`Invalid hex color: "${token}". Use 3- or 6-digit hex.`);
      return;
    }
    hexList.push(normalized);
  }

  if (hexList.length === 0) {
    figma.notify("Please enter at least one valid hex color.");
    return;
  }

  const expandedHexList = includePalette
    ? expandRelatedHexes(hexList, paletteType)
    : hexList;

  // Load font once for all labels
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" });

  // Parent frame to stack multiple palettes vertically
  const parent = figma.createFrame();
  parent.name = getCanvasTitle(includePalette, paletteType);
  parent.layoutMode = "VERTICAL";
  parent.primaryAxisSizingMode = "AUTO";
  parent.counterAxisSizingMode = "AUTO";
  parent.paddingLeft = parent.paddingRight = 0;
  parent.paddingTop = parent.paddingBottom = 0;

  for (const hex of expandedHexList) {
    const palette = generatePalette(hex, stepPercent);

    const swatchSize = 64;
    const rowGap = 8;

    // Outer frame: base column + palette rows
    const frame = figma.createFrame();
    frame.name = formatHexLabel(hex, includeHashtag); // frame under Tints & Shades
    frame.layoutMode = "HORIZONTAL";
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "AUTO";
    frame.itemSpacing = 8;
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
      baseStyle.name = `Tints & Shades/${formatHexLabel(
        hex,
        includeHashtag
      )}/Base`; // styles parent
      baseStyle.paints = baseRect.fills;
    }

    const baseLabel = figma.createText();
    baseLabel.name = formatHexLabel(hex, includeHashtag);
    baseLabel.fontName = { family: "Roboto", style: "Regular" };
    baseLabel.characters = formatHexLabel(hex, includeHashtag);
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
      label.name = formatHexLabel(swatch.hex, includeHashtag);
      label.fontName = { family: "Roboto", style: "Regular" };
      label.characters = formatHexLabel(swatch.hex, includeHashtag);
      label.fontSize = 10;
      label.textAlignHorizontal = "CENTER";
      label.textAutoResize = "WIDTH_AND_HEIGHT";
      label.fills = [{ type: "SOLID", color: labelColor }];

      stepFrame.appendChild(rect);
      stepFrame.appendChild(label);
      shadesRow.appendChild(stepFrame);

      if (createStyles) {
        const style = figma.createPaintStyle();
        style.name = `Tints & Shades/${formatHexLabel(
          hex,
          includeHashtag
        )}/Shades/${stepName}`;
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
      label.name = formatHexLabel(swatch.hex, includeHashtag);
      label.fontName = { family: "Roboto", style: "Regular" };
      label.characters = formatHexLabel(swatch.hex, includeHashtag);
      label.fontSize = 10;
      label.textAlignHorizontal = "CENTER";
      label.textAutoResize = "WIDTH_AND_HEIGHT";
      label.fills = [{ type: "SOLID", color: labelColor }];

      stepFrame.appendChild(rect);
      stepFrame.appendChild(label);
      tintsRow.appendChild(stepFrame);

      if (createStyles) {
        const style = figma.createPaintStyle();
        style.name = `Tints & Shades/${formatHexLabel(
          hex,
          includeHashtag
        )}/Tints/${stepName}`;
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
  }

  figma.currentPage.appendChild(parent);
  figma.viewport.scrollAndZoomIntoView([parent]);
};


// --- Formatting + UI option helpers ---------------------------------------

function normalizePaletteType(value?: string): PaletteType {
  if (value === "split-complementary") return "split-complementary";
  if (value === "analogous") return "analogous";
  if (value === "triadic") return "triadic";
  return "complementary";
}

function formatStepLabel(step: number): string {
  const scaledStep = Math.round(step * 10);
  return scaledStep.toString();
}

function formatHexLabel(hex: string, includeHashtag: boolean): string {
  const normalized = hex.toLowerCase();
  return includeHashtag ? normalized : normalized.replace("#", "");
}

function formatPaletteTypeLabel(paletteType: PaletteType): string {
  switch (paletteType) {
    case "split-complementary":
      return "Split Complementary";
    case "analogous":
      return "Analogous";
    case "triadic":
      return "Triadic";
    default:
      return "Complementary";
  }
}

function getCanvasTitle(includePalette: boolean, paletteType: PaletteType): string {
  if (!includePalette) return "Tints & Shades";
  return `Tints & Shades + ${formatPaletteTypeLabel(paletteType)}`;
}
