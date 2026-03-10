# Pomodoro3

纯前端番茄钟应用，符合 `PRD.md` 与 `TECH_ARCHITECTURE.md` 约束，可直接部署到 GitHub Pages。

## 功能
- 专注/短休/长休计时与自动流转
- 开始、暂停、重置、跳过阶段
- 任务新增、完成、删除、番茄绑定累积
- 今日/本周番茄统计
- 设置管理（时长、自动流转、提示音）
- `localStorage` 持久化（刷新不丢数据）
- 通知与提示音降级处理

## 技术栈
- React + TypeScript + Vite
- Tailwind CSS
- Zustand
- Vitest

## 本地开发
```bash
npm install
npm run dev
```

## 测试与构建
```bash
npm run test:run
npm run build
```

## GitHub Pages 部署
已内置 `.github/workflows/deploy.yml`。

仓库启用 Pages（Source: GitHub Actions）后，push 到 `main` 会自动部署。

访问地址（示例）：
- `https://dongshao.github.io/Pomodoro3/`
