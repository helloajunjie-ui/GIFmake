# GIF 工具 - 架构设计文档

## 1. 项目概述

纯前端浏览器 GIF 制作工具，支持：
- 多图片合成 GIF
- 视频转 GIF
- GIF 尺寸/分辨率调整
- GIF 预览与下载

所有处理在浏览器本地完成，不上传服务器。

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Vue 3 (Composition API) | 响应式 UI |
| 构建 | Vite 5 | 快速开发/构建 |
| 语言 | JavaScript |  |
| GIF 编码 | [gif.js](https://github.com/jnordberg/gif.js) | 浏览器端 GIF 编码 |
| 视频处理 | [@ffmpeg/ffmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm) | 浏览器端 FFmpeg WASM |
| 样式 | 原生 CSS (现代化风格) | 无额外 UI 框架依赖 |

---

## 3. 目录结构

```
MISStoFENGYUE/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.ico
├── src/
│   ├── main.js              # 入口
│   ├── App.vue               # 根组件 - 路由/布局
│   ├── assets/
│   │   └── styles/
│   │       └── global.css    # 全局样式变量
│   ├── components/
│   │   ├── Layout.vue        # 整体布局 (Header + Content)
│   │   ├── Header.vue        # 顶部导航/标题
│   │   ├── ImageToGif.vue    # 图片合成 GIF 面板
│   │   ├── VideoToGif.vue    # 视频转 GIF 面板
│   │   ├── GifSettings.vue   # GIF 参数设置 (尺寸/帧率/质量)
│   │   ├── ImageList.vue     # 图片列表 (拖拽排序/删除)
│   │   ├── Preview.vue       # GIF 预览组件
│   │   └── DropZone.vue      # 拖拽上传区域
│   ├── composables/
│   │   ├── useGifEncoder.js  # GIF 编码逻辑 (gif.js)
│   │   ├── useVideoDecoder.js# 视频解码逻辑 (ffmpeg.wasm)
│   │   └── useFileUpload.js  # 文件上传/拖拽处理
│   └── utils/
│       ├── constants.js      # 常量/默认配置
│       └── helpers.js        # 工具函数
```

---

## 4. 核心功能模块

### 4.1 图片合成 GIF (`ImageToGif.vue`)

```
用户上传多张图片
    │
    ▼
┌─────────────────────┐
│   DropZone.vue       │  ← 拖拽/点击上传 (支持 png/jpg/webp)
│   ImageList.vue      │  ← 显示图片列表，支持拖拽排序、删除
│   GifSettings.vue    │  ← 设置: 宽/高、帧延迟、循环次数、质量
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  useGifEncoder.js    │  ← 调用 gif.js 编码
│  (GIF 编码)          │     每个图片作为一帧
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Preview.vue        │  ← 实时预览生成的 GIF
│   下载按钮           │  ← 下载为 .gif 文件
└─────────────────────┘
```

### 4.2 视频转 GIF (`VideoToGif.vue`)

```
用户上传视频 (mp4/webm/avi/mov)
    │
    ▼
┌─────────────────────┐
│   DropZone.vue       │  ← 拖拽/点击上传视频
│   GifSettings.vue    │  ← 设置: 宽/高、FPS、起始时间、持续时间
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  useVideoDecoder.js  │  ← 使用 ffmpeg.wasm
│  (视频解码)          │     提取帧 → 缩放 → 输出 raw 帧数据
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  useGifEncoder.js    │  ← 将帧数据编码为 GIF
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Preview.vue        │  ← 预览 + 下载
└─────────────────────┘
```

### 4.3 GIF 参数设置 (`GifSettings.vue`)

| 参数 | 说明 | 默认值 | 范围 |
|------|------|--------|------|
| 宽度 (Width) | GIF 宽度 | 原始宽度 | 50~4096 |
| 高度 (Height) | GIF 高度 | 原始高度 | 50~4096 |
| 保持比例 | 锁定宽高比 | true | - |
| 帧延迟 (Delay) | 每帧停留时间 (ms) | 100 | 10~5000 |
| 循环次数 | 0 = 无限循环 | 0 | 0~100 |
| 质量 (Quality) | GIF 颜色量化质量 | 10 | 1~20 (1最佳) |
| FPS (视频) | 每秒提取帧数 | 10 | 1~30 |
| 起始时间 | 视频开始截取位置 (s) | 0 | - |
| 持续时间 | 截取时长 (s) | 3 | 1~30 |

---

## 5. 数据流

### 5.1 图片 → GIF

```
FileList (图片文件)
    │ readAsDataURL / createImageBitmap
    ▼
ImageData[] (Canvas 渲染后的像素数据)
    │ gif.js: addFrame(imageData, {delay, copy})
    ▼
GIF Blob (Uint8Array)
    │ URL.createObjectURL
    ▼
预览 & 下载
```

### 5.2 视频 → GIF

```
File (视频文件)
    │ ffmpeg.wasm: load() → writeFile() → run(['-i', ...])
    ▼
帧图片 (PNG bytes[])  ← ffmpeg 输出为 PNG 序列
    │ 每个 PNG → createImageBitmap → Canvas → ImageData
    ▼
ImageData[] (像素数据)
    │ gif.js: addFrame()
    ▼
GIF Blob
    │
    ▼
预览 & 下载
```

---

## 6. 组件树

```
App.vue
 └── Layout.vue
      ├── Header.vue              ← 标题 + 模式切换 (图片/视频)
      └── [Content Area]
           ├── ImageToGif.vue     ← 图片模式
           │    ├── DropZone.vue
           │    ├── ImageList.vue
           │    └── GifSettings.vue
           │
           ├── VideoToGif.vue     ← 视频模式
           │    ├── DropZone.vue
           │    └── GifSettings.vue
           │
           └── Preview.vue        ← 底部预览区 (共用)
```

---

## 7. 状态管理

使用 Vue 3 Composition API 的 `provide/inject` + `reactive`，无需 Vuex/Pinia。

```javascript
// 全局共享状态 (App.vue 中 provide)
{
  mode: 'image' | 'video',       // 当前模式
  images: File[],                 // 上传的图片列表
  video: File | null,            // 上传的视频
  settings: {                    // GIF 参数
    width: number,
    height: number,
    keepAspectRatio: boolean,
    delay: number,
    loop: number,
    quality: number,
    fps: number,
    startTime: number,
    duration: number
  },
  gifBlob: Blob | null,         // 生成的 GIF
  isProcessing: boolean,         // 是否正在处理
  progress: number               // 处理进度 0-100
}
```

---

## 8. 关键技术决策

### 8.1 为什么用 gif.js 而非其他库
- 纯浏览器端编码，无需后端
- 支持自定义帧延迟、循环、质量
- 支持 Web Worker，不阻塞主线程
- 成熟稳定，npm 周下载量高

### 8.2 为什么用 ffmpeg.wasm
- 浏览器端解码视频，无需上传服务器
- 支持多种视频格式 (mp4/webm/avi/mov)
- 可精确控制截取时间、FPS、缩放

### 8.3 为什么不使用 UI 框架
- 项目功能单一，组件数量少
- 原生 CSS 更轻量，无额外依赖
- 自定义现代化风格更灵活

---

## 9. 实现步骤 (Todo List)

1. **初始化项目** - 创建 Vite + Vue3 项目，安装依赖 (gif.js, @ffmpeg/ffmpeg)
2. **创建全局样式** - CSS 变量、现代化配色、布局基础
3. **实现 Layout + Header** - 整体布局、模式切换
4. **实现 DropZone 组件** - 拖拽/点击上传文件
5. **实现 ImageList 组件** - 图片列表展示、拖拽排序、删除
6. **实现 GifSettings 组件** - 所有参数控制面板
7. **实现 useGifEncoder composable** - GIF 编码核心逻辑
8. **实现 ImageToGif 面板** - 图片合成 GIF 完整流程
9. **实现 useVideoDecoder composable** - 视频解码核心逻辑
10. **实现 VideoToGif 面板** - 视频转 GIF 完整流程
11. **实现 Preview 组件** - GIF 预览 + 下载
12. **集成测试与优化** - 边界情况处理、进度显示、错误提示

---

## 10. 界面草图

```
┌─────────────────────────────────────────────┐
│  🎬 GIF 工具    [图片模式] [视频模式]        │  ← Header
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │       拖拽上传区域                   │    │
│  │   点击上传 或 拖拽文件到此处          │    │
│  │   支持: PNG, JPG, WebP (图片模式)    │    │
│  │         MP4, WebM, AVI (视频模式)    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  图片列表:                                   │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐                      │
│  │ 1│ │ 2│ │ 3│ │ 4│  ← 拖拽排序          │
│  └──┘ └──┘ └──┘ └──┘                      │
│                                             │
│  参数设置:                                   │
│  宽度 [320] 高度 [240]  ☑ 保持比例          │
│  帧延迟 [100ms]  循环 [0]  质量 [10]        │
│  FPS [10]  (视频模式)                       │
│                                             │
│  [🔄 生成 GIF]                              │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │         GIF 预览区域                 │    │
│  │         [⬇ 下载]                    │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```
