# Native CSS shadow adaptation (optional)

Preserve shadow parameters while making the contour follow G3. Keeping an ordinary box-shadow without correction is only "native shadow preservation," not a complete G3 shadow migration.

`scripts/shadow-delta.mjs` provides differential correction: retain the native shadow base, estimate the shadow difference between ordinary and G3 contours, and apply an attenuation mask and a same-color additive layer. Current validation is limited to single-color, single-layer outer shadows in Chromium, with spread=0 and no inset. Multiple layers, inset shadows, spread, or other browsers require additional implementation and validation; do not discard parameters.

## Calculation

```js
const correction = buildShadowCorrection(ordinaryAlpha, g3Alpha, widthPx, heightPx, {
  sigma: blurCssPx * scale / 2,
  offsetX: dxCssPx * scale,
  offsetY: dyCssPx * scale,
  opacity: sourceOpacity
});
```

Inputs contain 0–1 alpha values, with matching dimensions and pixel scale and sufficient transparent padding. Reserve at least 4σ plus space for the offset. The result contains attenuation and addition. The blur/2 kernel is an estimate, not a guarantee of equivalence across browsers.

Let the estimated original shadow be B and the target be T: when T<B, m=T/B; otherwise m=1. When T>B, A=(T−B)/(1−B); otherwise A=0. Composition yields Bm+A(1−Bm)=T. `compensation(B,T)` can also consume a framework's own filtered results; identical contours produce an identity correction.

## Integration and validation

- Preserve source declarations and read the used border width and shadow RGB/alpha/offset/blur. Used border widths can vary with DPR; do not render solely from a design token.
- Move the native shadow to a separate absolute paint layer with pointer-events:none and aria-hidden. Apply attenuation, overlay addition in the same RGB color, then paint the G3 background and border. Disable duplicate shadow painting on the original component while preserving content and layout.
- For low-opacity shadows, render opaque RGB first and apply opacity outside the mask layer to reduce offscreen quantization error. `quantizeOpacity8bit` is an explicit configuration for the tested Chromium setup, not a universal CSS rule. Do not change source opacity or search for small design-parameter adjustments to match screenshots.
- Cache results and recompute when dimensions, DPR, or state change. Use an appropriate GPU/worker implementation for real-time animation.
- Use a genuine native CSS baseline and compare layout, style tokens, straight edges, corners, and shadows separately. Keep comparison regions fixed. Also compare the same paint layer with correction disabled to confirm that the shadow actually follows G3.

Differential adaptation reduces errors from full repainting, but compositing differences on the order of 1/255 may remain. Do not promise strictly lossless, cross-platform, or pixel-identical native Apple rendering.
