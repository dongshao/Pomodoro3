# Pomodoro3 技术架构文档

## 1. 文档信息
- 文档名称：Pomodoro3 技术架构文档
- 版本：v1.0（MVP）
- 日期：2026-03-10
- 关联文档：`PRD.md`
- 约束前提：仅前端、无后端、部署到 GitHub Pages

## 2. 架构目标与原则
### 2.1 架构目标
- 纯静态部署：可直接发布到 GitHub Pages。
- 低复杂度：优先保证可维护与可迭代。
- 高可靠计时：减少浏览器定时器漂移影响。
- 本地持久化：刷新或重开页面后数据不丢失。

### 2.2 设计原则
- 单向数据流：状态集中管理，UI 仅消费状态并触发事件。
- 模块边界清晰：计时、任务、统计、设置分层隔离。
- 渐进增强：通知、音频、PWA 能力可选启用，不阻塞主流程。
- 前端容错：本地数据解析失败时自动回退默认值。

## 3. 技术选型
## 3.1 核心栈（推荐）
- 构建工具：Vite
- 语言：TypeScript
- UI：React + Tailwind CSS
- 状态管理：Zustand（轻量、低心智负担）
- 时间处理：原生 `Date.now()` + 自定义计时引擎
- 本地存储：`localStorage`
- 测试：Vitest + Testing Library
- 代码质量：ESLint + Prettier
- 部署：GitHub Actions + GitHub Pages

### 3.2 选型理由
- Vite 构建快、Pages 兼容性好。
- React 组件化适合状态驱动 UI。
- Zustand 相比 Redux 更轻，适合 MVP。
- TypeScript 提升状态机与数据模型可维护性。
- Tailwind 在纯前端项目中可快速构建响应式界面并统一设计约束。

### 3.3 Tailwind 实施规范
- 样式优先使用 Tailwind 原子类，不再引入 CSS Modules。
- 设计令牌（颜色、间距、圆角、阴影）统一沉淀到 `tailwind.config.*`。
- 复杂类名组合建议使用 `clsx` + `tailwind-merge` 保持可读性。

## 4. 系统上下文与模块
### 4.1 系统上下文
- 用户通过浏览器访问静态页面。
- 前端应用在本地完成计时、任务与统计逻辑。
- 浏览器能力提供通知、音频播放与本地存储。

### 4.2 模块划分
- `Timer Engine`：计时状态机、阶段切换、漂移校准。
- `Task Domain`：任务增删改查、当前任务绑定。
- `Stats Domain`：今日/本周番茄聚合统计。
- `Settings Domain`：时长配置、行为开关、持久化。
- `Persistence Layer`：`localStorage` 读写、版本迁移、异常兜底。
- `UI Layer`：页面组件、交互事件、可访问性支持。

## 5. 前端分层架构
建议目录结构：

```text
src/
  app/
    App.tsx
    routes.tsx
  components/
    timer/
    task/
    stats/
    settings/
  domains/
    timer/
      engine.ts
      machine.ts
      selectors.ts
    task/
      service.ts
    stats/
      aggregator.ts
    settings/
      service.ts
  store/
    usePomodoroStore.ts
  infra/
    storage/
      localStorageRepo.ts
      schema.ts
      migration.ts
    notification/
      notifier.ts
    audio/
      player.ts
  utils/
    time.ts
    date.ts
  main.tsx
```

分层职责：
- `UI Layer`：展示与交互，尽量无业务逻辑。
- `Domain Layer`：封装规则与状态流转。
- `Infra Layer`：浏览器 API 适配与副作用处理。
- `Store Layer`：聚合全局状态并暴露 actions。

## 6. 核心数据模型
```ts
type Phase = "focus" | "shortBreak" | "longBreak";
type RunState = "idle" | "running" | "paused" | "completed";

interface Settings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartNextPhase: boolean;
  soundEnabled: boolean;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  pomodoroCount: number;
  createdAt: string;
}

interface SessionCounter {
  date: string; // YYYY-MM-DD
  focusCompleted: number;
}

interface TimerSnapshot {
  phase: Phase;
  runState: RunState;
  remainingSeconds: number;
  startedAt: number | null;
  plannedEndAt: number | null;
  completedFocusCountInCycle: number;
  boundTaskId: string | null;
}

interface PersistedStateV1 {
  version: 1;
  settings: Settings;
  tasks: Task[];
  counters: SessionCounter[];
  timer: TimerSnapshot;
}
```

## 7. 计时器架构设计
### 7.1 状态机
- 运行状态：`idle -> running -> paused -> running -> completed`
- 阶段流转：
  - `focus` 完成后：
    - 若 `completedFocusCountInCycle % longBreakInterval === 0`，进入 `longBreak`
    - 否则进入 `shortBreak`
  - `shortBreak`、`longBreak` 完成后进入 `focus`

### 7.2 漂移控制策略
为避免 `setInterval` 误差累计，不使用“每秒减 1”作为唯一依据。

实现策略：
- 启动时记录 `plannedEndAt = Date.now() + remainingSeconds * 1000`
- tick 时动态计算：
  - `remainingSeconds = max(0, ceil((plannedEndAt - now)/1000))`
- 页面从后台恢复到前台后立即重算剩余时间

### 7.3 生命周期与副作用
- 阶段结束触发：
  - 更新统计数据
  - 更新绑定任务番茄数
  - 播放音频（开关控制）
  - 触发通知（授权前提）
  - 根据设置决定是否自动进入下一阶段并开始计时

## 8. 持久化与数据一致性
### 8.1 存储策略
- 写入时机：
  - 设置变化后立即写入
  - 任务变化后立即写入
  - 计时器关键事件（开始/暂停/完成/重置/跳过）后写入
- 节流策略：
  - 运行中不每秒写入，避免频繁 IO（可按 10 秒节流快照）

### 8.2 版本迁移
- 持久化结构带 `version` 字段。
- 读取流程：
  - 解析 JSON
  - 校验 schema（手写守卫或 `zod`）
  - 若版本落后则迁移
  - 失败则回退默认状态并记录告警日志

## 9. 通知与音频架构
### 9.1 通知
- 首次进入设置页时引导授权 `Notification.requestPermission()`
- 权限状态：
  - `granted`：阶段结束发系统通知
  - `denied/default`：仅 UI 内提示，不阻塞流程

### 9.2 音频
- 使用短音频资源（本地静态文件）触发提示。
- 对自动播放限制做兜底：若播放失败，保留可见提示。

## 10. UI 与路由
### 10.1 页面结构（MVP）
- 单页应用主视图：
  - 计时卡片
  - 任务列表
  - 今日/本周统计卡片
  - 设置面板（可抽屉或弹层）

### 10.2 路由策略
- MVP 可无复杂路由。
- 若后续拆多页，采用 hash 路由（`/#/path`）以避免 GitHub Pages 刷新 404。

## 11. CI/CD 与部署架构
### 11.1 发布流程
1. push 到 `main`
2. GitHub Actions 执行：
   - 安装依赖
   - 运行 lint + test
   - `vite build`
   - 发布 `dist` 到 Pages

### 11.2 推荐工作流
- 使用 `actions/setup-node`
- 使用 `actions/upload-pages-artifact`
- 使用 `actions/deploy-pages`

### 11.3 环境配置
- Vite `base` 需配置为仓库名路径（如 `/Pomodoro3/`），确保静态资源路径正确。

## 12. 性能与可靠性策略
- 首屏优化：
  - 控制首包体积，按需加载非核心模块。
  - 图标与音频资源压缩。
- 运行可靠性：
  - 计时逻辑与 UI 渲染解耦。
  - 页面可见性变化时主动校准时间。
- 故障恢复：
  - 存储异常回退默认值。
  - 核心异常不导致页面白屏（错误边界）。

## 13. 安全与隐私
- 无后端、无账号、无个人敏感信息上传。
- 所有数据本地存储，用户可通过浏览器清理站点数据。
- 不引入不必要第三方脚本，减少供应链风险。

## 14. 测试策略
### 14.1 单元测试
- `timer machine`：阶段切换、自动开始、长休息判定
- `aggregator`：今日/本周统计聚合正确性
- `migration`：老版本状态迁移与回退

### 14.2 组件测试
- 计时器按钮交互（开始/暂停/重置/跳过）
- 任务新增/完成/删除
- 设置变更后 UI 与状态一致

### 14.3 端到端测试（可选）
- 使用 Playwright 跑关键用户路径：
  - 启动番茄 -> 完成阶段 -> 统计更新
  - 刷新页面 -> 数据保留

## 15. 风险与架构应对
- 浏览器后台节流导致计时异常：
  - 通过 `plannedEndAt` + 实时差值计算规避。
- 本地存储容量与异常：
  - 数据结构精简，解析失败自动回退。
- GitHub Pages 路径问题：
  - 明确 `base` 配置与发布后回归检查。

## 16. 实施顺序建议
1. 初始化工程与 CI/CD
2. 完成计时状态机与基础 UI
3. 接入任务与设置域
4. 加入持久化与迁移机制
5. 增加通知/音频与兼容性修复
6. 完成测试与 Pages 发布验收
