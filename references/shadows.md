# 原生 CSS 阴影适配（可选）

目标是保留阴影参数，仅让轮廓跟随 G3。保留普通 box-shadow 而不修正，只能称“原生阴影保留”；不能称完整 G3 阴影迁移。

`scripts/shadow-delta.mjs` 提供差量补偿：保留原生阴影底层，估计普通轮廓与 G3 的阴影差量，通过衰减遮罩和同色增量层修正。当前验证限 Chromium 单层实色外阴影、spread=0、无 inset。多层、内阴影、扩展阴影或其他浏览器需要额外实现与验证，不得丢弃参数。

## 计算

```js
const correction = buildShadowCorrection(ordinaryAlpha, g3Alpha, widthPx, heightPx, {
  sigma: blurCssPx * scale / 2,
  offsetX: dxCssPx * scale,
  offsetY: dyCssPx * scale,
  opacity: sourceOpacity
});
```

输入是同尺寸、同像素比例、带足够透明边距的 0–1 alpha。至少预留 4σ 及偏移的空间。返回 attenuation 和 addition。blur/2 是估计核，不保证等同所有浏览器。

令估计原阴影为 B、目标为 T：T<B 时 m=T/B，否则 m=1；T>B 时 A=(T−B)/(1−B)，否则 A=0。合成为 Bm+A(1−Bm)=T。`compensation(B,T)` 可用于框架自己的滤波结果；相同轮廓的修正为恒等操作。

## 接入与验收

- 保留源声明，读取实际使用边框宽度及阴影 RGB/alpha/offset/blur。不同 DPR 的边框使用宽度可能不同，不能只拿 token 绘制。
- 将原生阴影移到独立 absolute、pointer-events:none、aria-hidden 的绘制层，应用 attenuation；上方叠加同 RGB 的 addition，再绘制 G3 背景/边框。关闭原组件重复的阴影绘制，内容和布局保持原状。
- 低透明度阴影先绘制不透明 RGB，再在遮罩层外应用透明度，可减少离屏量化误差。`quantizeOpacity8bit` 是已测试 Chromium 的显式配置，不是通用 CSS 规则；不修改源透明度，也不搜索微调设计参数来匹配截图。
- 缓存结果，尺寸/DPR/状态变化时重算；实时动画使用适当的 GPU/worker 实现。
- 使用真实原生 CSS 基线，分别比较布局、样式 token、直边、角部和阴影。固定比较区域；额外做“同一层关闭修正”的对照，确认阴影确实跟随 G3。

差量适配减少了全量重绘的误差，但仍可能有 1/255 级合成差异。不要承诺严格无损、全平台或 Apple 原生逐像素一致。
