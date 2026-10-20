# Geometry and integration

## API

Import from `scripts/g3-corners.mjs`:

- `geometry(width, height, radius)`: returns used radii, kind, control points, and the G3 flag. The radius can be a number, px/% shorthand (including `/`), or `{tl,tr,br,bl}`; individual corners can use `[rx,ry]`.
- `readElementGeometry(element)`: reads the untransformed border box and computed styles, resolving percentages, calc expressions, and common font units without modifying the target. Special context-dependent units must be resolved by the framework. The fallback for inline auto dimensions has integer precision.
- `maskCanvas(width,height,radius,scale)`: a Canvas mask; configure mask-size and mask-repeat when integrating it. Prefer data URLs on local file pages and verify that the mask actually loads.
- `rasterize(...)`: RGBA pixels and geometry, without a DOM dependency.
- `makeField(geometry)`: a signed distance estimate near the boundary, not an exact global distance field. Do not use it for large, exact normal offsets.

```js
const g = readElementGeometry(element);
const r = Object.fromEntries(['tl','tr','br','bl'].map((k,i) => [k,g.resolvedRadii[i]]));
const mask = maskCanvas(g.width,g.height,r,devicePixelRatio);
// Integrate the mask into existing paint layers; do not unconditionally clip the whole element.
```

Resolve percentages against width and height separately. Normalize overlapping radii uniformly according to CSS rules to obtain used values, without writing them back to source declarations. A 9999px pill and a 50% ellipse have different semantics. Keep zero-radius corners square while converting the other corners normally.

## Continuity

Standard corners use a degree-7 Bezier curve with this control-point structure:

```
(0,0), (a,0), (b,0), (c,0),
(1,1-c), (1,1-b), (1,1-a), (1,1)
```

The first four and last four points each lie on their respective tangent line. Endpoint derivatives of orders one through three are therefore collinear, with κ=0 and dκ/ds=0, matching a straight edge. Parameters satisfy 0<a<b<c<1; the sum of coordinate increments between adjacent control points is positive, ensuring regularity. Tight spaces interpolate between two parameter sets while preserving these properties. Elliptical corners apply positive per-axis scaling to the continuous curve and are then rasterized again.

Pills use single-segment degree-8 end caps. Their first three endpoint derivatives are collinear and entry velocity is nonzero; internally, y′=280t³(1−t)³>0 ensures regularity, with no extra join in the middle. Complete circles and ellipses use analytic contours. The source code is authoritative for coefficients and branches.

The rasterizer evaluates the canonical curve directly, without conversion to cubic paths. Construct strokes from distance or coverage relative to the same boundary; simply shrinking the shape does not produce an exact equidistant inner stroke. Numerical evaluation and pixels both have finite precision.

## Dynamic updates and native platforms

ResizeObserver detects dimensions only; reread geometry when themes, radius states, fonts, or DPR change as well. Cache keys include width, height, the four corners' used radii, DPR, and algorithm version. Native platforms can use same-size RGBA/PNG masks or port all geometry branches and evaluation methods, not just standard corners.
