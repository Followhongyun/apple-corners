# Apple Corners

一个只改圆角的 Codex skill：以 G3 连续几何实现苹果风格圆角，保留现有尺寸、半径参数和卡片设计。

支持普通角、大圆角、胶囊、百分比、椭圆与不对称角，以及按需使用的阴影差量适配。可用于单个组件或全站批量迁移。

## 安装

将本仓库文件夹放到 `~/.codex/skills/apple-corners`。如果已有同名 skill，先备份再替换。

## 使用

> 用 $apple-corners 把这个项目的圆角改成苹果风格 G3，只改圆角，保留原有参数和设计。

入口：[SKILL.md](SKILL.md)。运行验证：

```sh
node scripts/test-g3.mjs
node scripts/test-shadow-delta.mjs
```

无需第三方运行依赖。自定义曲线不是 Apple 原生算法；阴影适配及框架接入需在目标项目验证，不承诺任意网站逐像素无损替换。
