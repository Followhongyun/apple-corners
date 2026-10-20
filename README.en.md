<div align="center">

# Apple Corners

[简体中文](README.md) · **English**

### Apple-inspired corners. Your original design.

A lightweight **Codex Skill** that replaces existing corners with G3-continuous curves.<br>
From a single card to an entire website: keep your dimensions, radius parameters, content, and layout.

**G3 geometry** · **No third-party runtime dependencies** · **Optional shadow adaptation**

[Quick start](#quick-start) · [Usage](#usage) · [Supported shapes](#supported-shapes) · [Implementation notes (Chinese)](references/implementation.md)

</div>

![Apple Corners preview: cards, buttons, an input, and pill tags with borders and shadows](assets/preview.png)

<p align="center"><sub>A page migration example: native CSS corners → G3 contours and adapted shadows. The visual change is usually subtle; the page is not redesigned to exaggerate it.</sub></p>

## See the difference

![An animated comparison of native CSS corners and Apple-inspired G3 corners, showing the same card's top-left corner at 8× magnification](assets/corners-comparison.gif)

<p align="center"><sub>The animation switches every 1.8 seconds. Both states use the same 24 px radius, dimensions, border, and shadow parameters. Frame 01 uses native browser CSS; frame 02 uses this skill's G3 contour and shadow adaptation. Only the corner paint layers are shown, with the G3 fill and border rasterized again at the enlarged scale. Image labels are in Chinese.</sub></p>

## What it does

Replaces existing component corners with Apple-inspired continuous contours while aiming to preserve the rest of the design.

- **Changes corners only** — Keeps your layout, copy, and card design.
- **Uses existing parameters** — Preserves dimensions, radius declarations, design tokens, and responsive rules.
- **Handles special shapes** — Supports pills, large radii, percentages, elliptical corners, and asymmetric corners.
- **Migrates across a project** — Works through shared components and theme entry points in a single request.
- **Adapts shadows when needed** — Retains a native shadow base and applies a differential correction to follow the G3 contour.

> **G3 continuity first, Apple-inspired appearance second.** This is custom geometry, not Apple's native algorithm.

## Quick start

Run in your terminal:

```bash
git clone https://github.com/Followhongyun/apple-corners.git ~/.codex/skills/apple-corners
```

If that directory already exists, back it up before replacing it. If you installed the skill with Git, run `git pull --ff-only` inside the directory to update it.

## Usage

After installation, mention `$apple-corners` in Codex and describe what you want to change.

**Update one component**

```text
Use $apple-corners to give this card Apple-inspired G3 corners.
Preserve its existing width, height, radius, border, shadow, and content.
```

**Migrate an entire project**

```text
Use $apple-corners to replace the corners throughout this website with Apple-inspired G3 corners.
Change only the corners, preserve the existing design and parameters, and check buttons, inputs, and pill tags.
```

**Migrate an existing CSS page**

```text
Use $apple-corners to migrate this page, which already uses border-radius, border, and box-shadow.
Make the shadows follow G3 too, and compare against native CSS screenshots to verify that the rest of the design is unchanged.
```

## Supported shapes

| Case | Approach |
| :--- | :--- |
| Standard rounded corners | Degree-7 curves with G3 joins to straight edges |
| Large radii and tight spaces | Adaptive curve profiles that preserve input parameters |
| Horizontal and vertical pills | Complete degree-8 end caps without an extra join in the middle |
| Percentage, elliptical, and asymmetric corners | Calculated from actual dimensions and each corner's used radii |
| Circles and complete ellipses | Preserve their existing smooth analytic contours |
| Zero-radius corners | Keep sharp corners sharp |
| CSS outer shadows | Optional differential adaptation; currently validated for single-color, single-layer outer shadows in Chromium, with no spread or inset |

## Implementation and checks

No third-party runtime packages are required. The core provides geometry, RGBA rasterization, and browser Canvas masks. Native apps can integrate image masks or port the evaluation logic.

```bash
# Test the geometry and shadow algorithms
node scripts/test-g3.mjs
node scripts/test-shadow-delta.mjs

# Export a PNG mask and geometry JSON: 280 × 210, radius 40, at 2× resolution
node scripts/export-g3.mjs 280 210 40 2 corner.png
```

| File | Purpose |
| :--- | :--- |
| [SKILL.md](SKILL.md) | Instructions for Codex (Chinese) |
| [Implementation notes](references/implementation.md) | APIs, special shapes, and continuity (Chinese) |
| [Shadow adaptation](references/shadows.md) | Differential correction and validation for native CSS shadows (Chinese) |
| [Corner core](scripts/g3-corners.mjs) | Geometry and rasterization |
| [Shadow core](scripts/shadow-delta.mjs) | Shadow correction calculations |

## Limitations

G3 describes the underlying continuous geometry; raster images have finite precision. A contour containing sharp corners is not claimed to be G3 throughout. Borders, shadows, and framework integration still require validation in the target project. Shadow compositing may introduce small pixel differences.

“Site-wide replacement” is a project migration workflow carried out by Codex, not a runtime library that can losslessly transform any website with a single CSS rule. Native platforms and other browsers require separate validation.
