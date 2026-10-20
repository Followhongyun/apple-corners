---
name: apple-corners
description: Add Apple-inspired G3 corners to websites or apps, for individual components or project-wide migrations, while preserving existing dimensions, radius parameters, and design.
---

# Apple Corners

Use custom G3 curves for Apple-inspired corners: prioritize geometric continuity, then visual similarity. This is not Apple's native algorithm and does not promise pixel-for-pixel equivalence.

## Change corners only

Read existing dimensions, per-corner radii, units, and design tokens. Preserve content, layout, typography, colors, border parameters, shadow parameters, and interactions. Adjust only contours and necessary paint layers; do not resize cards or change radius values to accommodate a curve. Preserve existing overflow behavior, popovers, and focus rings.

## Workflow

1. Locate the target components and their radius sources. For a site-wide or app-wide request, scan shared components, styles, and theme entry points and adapt them in batches. Otherwise, stay within the requested scope.
2. Copy [g3-corners.mjs](scripts/g3-corners.mjs) into the project. Use `geometry` for geometry, `maskCanvas` for browser masks, or `rasterize` for cross-platform RGBA. See [implementation notes](references/implementation.md) for APIs and special shapes.
3. Use the same contour for backgrounds, strokes, and content that already needs clipping. Do not leave an ordinary CSS border around a G3 background or clip G3 painting through an ordinary rounded corner. Read [shadow adaptation](references/shadows.md) when adapting native CSS shadows.
4. Recompute and cache when dimensions, radii, state, or device pixel ratio change; clean up observers. Do not stretch old masks or encode large PNGs on every animation frame.
5. Check layout, content, borders, shadows, and interactions on the actual page. Existing websites require a genuine native CSS screenshot baseline. Report coverage and components that cannot be adapted faithfully; newly created sample cards are not migration validation.

Use the generator's adaptations for pills, large radii, percentages, ellipses, and asymmetric corners rather than skipping them. Keep zero-radius corners sharp; do not claim that a contour containing sharp corners is G3 throughout. G3 describes continuous geometry, not discrete pixels. Do not convert it to ordinary cubic Bezier curves or polylines and continue to promise strict G3.

When the user explicitly requests native Apple rendering, use the target platform's continuous API and identify it as the native approach without promising G3.

## Validate and export

```sh
node scripts/test-g3.mjs
node scripts/test-shadow-delta.mjs # When using shadow adaptation
node scripts/export-g3.mjs 280 210 40 2 corner.png
```

The scripts have no third-party runtime dependencies. Native drawing or GPU ports require separate validation on the target platform; this skill does not include UI wrappers for every framework.
