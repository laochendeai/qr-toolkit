# QR 工具箱（QR Toolkit）

围绕高搜索量关键词 **“qr code generator”** 做的一个本地可运行小工具：二维码生成 + 扫码识别 + 批量打印。

## 功能

- 生成：URL/文本、Wi‑Fi、电话、邮件、短信、地理坐标、vCard 名片
- 导出：SVG / PNG
- 扫码：摄像头实时识别、图片文件识别（依赖浏览器 `BarcodeDetector`）
- 批量：多行内容一页生成，直接打印

## 运行

浏览器访问需要本地 HTTP 服务（摄像头权限在 `localhost` 才是安全上下文）。

```bash
cd /path/to/jjgz
python3 -m http.server 5173
```

然后打开：

```text
http://localhost:5173
```

## 离线说明

默认会从公开 CDN 动态加载二维码引擎（`qrcode-generator` 的 ESM 文件），仓库保持极简。

如果你需要完全离线运行：

1. 创建目录 `src/vendor/`
2. 下载并保存到 `src/vendor/qrcode-generator.mjs`
   - 下载地址：`https://unpkg.com/qrcode-generator@2.0.4/dist/qrcode.mjs`

应用会优先加载本地 `./vendor/qrcode-generator.mjs`，失败才会回退到 CDN。

## 关键词分析

见 `KEYWORD.md`。

