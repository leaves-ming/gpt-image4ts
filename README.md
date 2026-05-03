# 纯前端AI绘画工具

一个开箱即用的纯前端AI绘画 playground，支持对接 Stable Diffusion API / OpenAI DALL-E 等兼容接口，无需后端服务。

## ✨ 功能特性
- 🎨 **双模式支持**：文生图 + 图生图（图片编辑/重绘）
- 🔑 **多API Key管理**：自动轮询、指数退避重试、故障转移
- 💾 **本地持久化**：配置和生成历史全部存储在本地浏览器，无数据泄露风险
- 📦 **批量下载**：单图下载、多图打包ZIP下载一键完成
- 🌙 **亮/暗主题**：支持主题切换，自动跟随系统
- 📱 **响应式适配**：完美适配桌面端、平板、移动端
- ⚡ **高性能**：基于LocalForage实现大容量本地存储，分页加载历史不卡顿

## 🛠️ 技术栈
- 框架：Vue 3 + TypeScript
- 构建工具：Vite
- UI组件：Element Plus + Tailwind CSS 4
- 状态管理：Pinia
- 本地存储：LocalForage
- 其他：Axios、fflate（ZIP打包）

## 🚀 快速开始
### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务
```bash
npm run dev
```
访问 http://localhost:5173 即可使用

### 3. 配置API
进入「设置」页面，填写以下配置：
- Base URL：你的API服务地址（如`https://api.openai.com/v1` 或 Stable Diffusion WebUI API地址）
- API Key：你的API Key，支持多行输入多个Key，自动轮询使用
- 生成/编辑路径：对应API的文生图/图生图接口路径

### 4. 生产构建
```bash
npm run build
```
构建产物输出到`dist`目录，可直接部署到任意静态托管服务（Nginx/Vercel/Netlify等）

## 📁 目录结构
```
├── src
│   ├── api/            # API请求封装
│   ├── components/     # 公共组件
│   ├── router/         # 路由配置
│   ├── storage/        # 本地存储封装
│   ├── store/          # Pinia状态管理
│   ├── styles/         # 全局样式
│   ├── types/          # TypeScript类型定义
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue
│   └── main.ts
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## ⚠️ 注意事项
1. **跨域问题**：开发环境已配置Vite代理，生产环境需要配置反向代理或使用支持CORS的API服务
2. **存储容量**：默认使用浏览器IndexedDB存储生成的图片，大量存储可能占用较多本地空间，可按需清理历史记录
3. **API兼容**：默认适配OpenAI DALL-E和Stable Diffusion WebUI API格式，其他API可自行修改接口适配层

## 📄 开源协议
MIT License
