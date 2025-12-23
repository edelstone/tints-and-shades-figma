# [<img src="assets/icon.png" width="28px" alt="" />](https://www.figma.com/community/plugin/1580658889126377365) &nbsp;[Tint & Shade Generator - Figma plugin](https://www.figma.com/community/plugin/1580658889126377365)

![Screenshot of the Figma plugin in action](assets/plugin-hero.png)

## Overview

Generate a full set of tints and shades from a base color directly inside Figma. This plugin is the companion to the web version of the [Tint & Shade Generator](https://github.com/edelstone/tints-and-shades), bringing the same, meticulous [color-generation logic](https://github.com/edelstone/tints-and-shades?tab=readme-ov-file#calculation-method) to your design workflow.

## Installation

Grab the plugin directly [from the Figma Community](https://www.figma.com/community/plugin/1580658889126377365).

## Features

- Enter one or multiple hex colors (`#hex`, `hex`, or 3-digit shorthand).
- Generate palette frames with base color, tints, and shades.
- Choose step counts (5, 10, or 20).
- Organized Figma layer structure for easy handoff and editing.
- Create local Figma color styles with token-friendly naming.
- Add related palettes (complementary, split complementary, analogous, triadic).
- Toggle `#` prefix and dark background output.

## Output structure

- Hex values are normalized to lowercase.
- Step values use a 100-based scale (100, 200, 300, …).

### Layers panel

```text
Tints & Shades
  └─ e96443
        ├─ Base
        │    ├─ Swatch
        │    └─ e96443
        ├─ Tints
        │    ├─ 100
        │    │    ├─ Swatch
        │    │    └─ eb7456
        │    ├─ 200
        │    └─ …
        └─ Shades
             ├─ 100
             │    ├─ Swatch
             │    └─ d25a3c
             ├─ 200
             └─ …
```

### Styles panel

```text
Tints & Shades
  └─ e96443
        ├─ Base
        ├─ Tints
        │    ├─ 100
        │    ├─ 200
        │    └─ …
        └─ Shades
             ├─ 100
             ├─ 200
             └─ …
```

## Local development

*Prerequisites: Node.js 16+ and a Figma account.*

1. Download or clone the repo.
1. Navigate to the project in your terminal.
1. Run `npm install`.
1. Run `npm run watch` (rebuilds plugin files on change) or `npm run build` (one-time production build).
1. In Figma: *Plugins → Development → Import plugin from manifest…*.
1. Select the repo's `manifest.json`.
1. Run via *Plugins → Development → Tint & Shade Generator*.

## Feedback and contributing

If you notice a bug or want to request a feature, please [file an issue on GitHub](https://github.com/edelstone/tints-and-shades-figma/issues/new) or [email me](mailto:contact@maketintsandshades.com) the details.

If you’d like to contribute, comment on an [open issue](https://github.com/edelstone/tints-and-shades-figma/issues) or open a new one describing your approach. Once aligned, submit a PR.

## Support this project

- [Buy Me a Coffee](https://www.buymeacoffee.com/edelstone)
- [Cash App](https://cash.app/$edelstone)
- [Paypal](https://www.paypal.me/edelstone)
- [Venmo](https://venmo.com/michaeledelstone)

## License

MIT, use freely in commercial and personal projects.
