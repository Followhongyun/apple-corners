# 几何与接入

## API

从 `scripts/g3-corners.mjs` 导入：

- `geometry(width, height, radius)`：返回使用半径、kind、控制点和 G3 标记。radius 可为数值、px/% 简写（含 `/`）、或 `{tl,tr,br,bl}`；各角可用 `[rx,ry]`。
- `readElementGeometry(element)`：读取未变换 border-box 和计算样式，解析百分比、calc、常规字体单位；不修改目标元素。特殊上下文单位须由框架解析。inline auto 尺寸后备值有整数精度。
- `maskCanvas(width,height,radius,scale)`：Canvas 遮罩；接入需设置 mask-size 和 mask-repeat。本地文件页面优先使用 data URL，验证遮罩实际加载。
- `rasterize(...)`：RGBA 像素及几何，不依赖 DOM。
- `makeField(geometry)`：边界附近的符号距离估计，不是全局精确距离，不能用于大幅精确法向偏置。

```js
const g = readElementGeometry(element);
const r = Object.fromEntries(['tl','tr','br','bl'].map((k,i) => [k,g.resolvedRadii[i]]));
const mask = maskCanvas(g.width,g.height,r,devicePixelRatio);
// 将 mask 接入项目既有绘制层，不无条件裁剪整个元素。
```

百分比按宽高分别解析；重叠半径依 CSS 规则统一计算使用值，不写回声明。9999px 胶囊与 50% 椭圆语义不同。零半径保持方角，其他角照常转换。

## 连续性

普通角为七次贝塞尔，控制点结构：

```
(0,0), (a,0), (b,0), (c,0),
(1,1-c), (1,1-b), (1,1-a), (1,1)
```

前四点与后四点分别共切线，使端点一至三阶导数共线，κ=0、dκ/ds=0，与直线匹配。参数满足 0<a<b<c<1，相邻控制点差的坐标和为正，保证正则性。紧凑空间在两套参数间插值，保持上述性质；椭圆角对连续曲线进行正的分轴缩放后重新栅格化。

胶囊使用单段八次端帽，端点前三阶导数共线，入口速度非零；内部 y′=280t³(1−t)³>0，保证正则性，中部没有额外拼接。完整圆/椭圆采用解析轮廓。系数与分支以源码为准。

栅格器直接求规范曲线，不转换为三次路径。描边应按同一边界的距离/覆盖率构造；简单缩小形状不是精确等距内描边。数值和像素均有有限精度。

## 动态与原生平台

ResizeObserver 只检测尺寸；主题、半径状态、字体和 DPR 变化也要重读。缓存键包含宽高、四角使用值、DPR、算法版本。原生平台可使用同尺寸 RGBA/PNG 遮罩，或移植全部几何分支与求值方法；不要只移植普通角。
