# myopia-tracker

一个 iPhone Safari 可添加到主屏幕的 local-first 眼生物测量趋势记录 app。

## 功能

- 多用户 profile
- 一次上传 1 张或多张图片
- OCR 尝试提取眼轴、屈光、眼轴速度、屈光速度、CT、AD、LT、VT、K1、K2
- 保存前可手动确认和修正数值
- 多张图片按字段求平均，保存为同一次检查 data point
- 趋势图、记录列表、JSON 导入/导出
- PWA manifest 和 service worker

## 本地运行

```bash
npm run dev
```

然后打开 `http://localhost:5173`。

## 验证

```bash
npm run build
```
