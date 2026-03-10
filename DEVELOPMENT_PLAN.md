# Pomodoro3 详细开发计划（MVP）

## 1. 计划概览
- 项目：Pomodoro3（纯前端，部署 GitHub Pages）
- 计划周期：2026-03-10 至 2026-03-20（11 天，含缓冲）
- 目标：交付可上线 MVP，满足 `PRD.md` 与 `TECH_ARCHITECTURE.md`
- UI 技术：React + Tailwind CSS
- 交付方式：主干开发 + GitHub Actions 自动发布 Pages

## 2. 范围基线
### 2.1 In Scope（本期必须）
- 番茄计时器：专注/短休息/长休息、开始/暂停/重置/跳过、自动流转
- 任务管理：新增、完成、删除、番茄关联累计
- 统计：今日/本周番茄数
- 设置：时长与行为开关、立即生效、持久化
- 本地存储：`localStorage` 持久化 + 版本迁移兜底
- 通知与提示音：授权可用、失败降级
- 响应式与可访问性：移动端可用，键盘可操作
- 部署：GitHub Pages 可访问，构建发布自动化

### 2.2 Out of Scope（本期不做）
- 登录与多端同步
- 团队协作与共享
- 高级分析报表
- 浏览器插件/桌面端

## 3. 里程碑与门禁
## M1：工程基础完成（2026-03-11）
- 产物：
  - Vite + React + TypeScript 初始化
  - Tailwind 接入与基础设计令牌
  - ESLint/Prettier/Vitest 基础配置
  - GitHub Actions 构建流水线（不发布）
- 通过标准：
  - 本地可启动
  - `npm run build` 成功
  - `npm run test` 至少跑通基础示例

## M2：核心计时能力完成（2026-03-14）
- 产物：
  - 计时状态机与阶段流转
  - 漂移校准（`plannedEndAt` 策略）
  - 计时器主视图和基础交互
- 通过标准：
  - 可完整跑通专注 -> 休息 -> 专注
  - 暂停/恢复不丢失剩余时间
  - 后台切回后时间自动校准

## M3：任务/统计/设置完成（2026-03-17）
- 产物：
  - 任务 CRUD + 绑定任务番茄累积
  - 今日/本周聚合统计
  - 设置项生效 + 本地持久化
- 通过标准：
  - 页面刷新后数据仍一致
  - 统计在专注完成后准确增加
  - 设置改动立即反映到计时行为

## M4：发布就绪（2026-03-20）
- 产物：
  - 通知/音频降级处理
  - 响应式与可访问性修复
  - GitHub Pages 自动发布
  - README 使用说明与线上地址
- 通过标准：
  - 桌面与移动核心流程可用
  - Pages 访问无致命错误
  - 验收清单全部通过

## 4. WBS（工作分解结构）
## 4.1 工程与基础设施
- WBS-01：初始化项目结构
- WBS-02：Tailwind 配置与主题令牌
- WBS-03：质量工具链（Lint/Format/Test）
- WBS-04：GitHub Actions（CI + Pages）

## 4.2 领域能力实现
- WBS-05：Timer Engine（状态机、漂移控制）
- WBS-06：Task Domain（CRUD、绑定、计数）
- WBS-07：Stats Domain（今日/本周聚合）
- WBS-08：Settings Domain（配置与行为）
- WBS-09：Persistence Layer（schema、迁移、容错）

## 4.3 体验与兼容
- WBS-10：通知与提示音能力
- WBS-11：响应式布局与 Tailwind 组件规范
- WBS-12：可访问性优化（键盘与语义）
- WBS-13：兼容性与回归测试

## 4.4 发布与交付
- WBS-14：文档补齐（README、已知限制）
- WBS-15：发布验证与回滚策略演练

## 5. 详细排期（按日）
## D1（2026-03-10）
- 任务：
  - 确认 PRD 与架构冻结版本
  - 定义目录规范和命名约定
  - 输出本开发计划
- 产出：
  - `PRD.md`、`TECH_ARCHITECTURE.md`、`DEVELOPMENT_PLAN.md`

## D2（2026-03-11）
- 任务：
  - 初始化 Vite + React + TS
  - 接入 Tailwind（含 `tailwind.config.*`）
  - 配置 ESLint/Prettier/Vitest
- 验证：
  - `dev/build/test` 命令可执行

## D3（2026-03-12）
- 任务：
  - 搭建 Zustand Store 主体
  - 定义核心数据模型与默认状态
  - `localStorage` Repository 与 schema guard
- 验证：
  - 状态初始化、读写、异常兜底通过单测

## D4（2026-03-13）
- 任务：
  - 实现 Timer 状态机（运行状态与阶段切换）
  - 漂移控制引擎（基于 `plannedEndAt`）
- 验证：
  - 单测覆盖开始/暂停/重置/跳过/完成流转

## D5（2026-03-14）
- 任务：
  - 计时器 UI 与主交互接入
  - 自动流转与长休息规则落地
- 验证：
  - 手工回归 4 番茄周期

## D6（2026-03-15）
- 任务：
  - 任务模块 UI + 逻辑（CRUD）
  - 当前任务绑定与番茄计数累加
- 验证：
  - 任务功能单测 + 刷新持久化验证

## D7（2026-03-16）
- 任务：
  - 统计模块（今日/本周）
  - 日期聚合与周边界处理
- 验证：
  - 跨天/跨周场景单测

## D8（2026-03-17）
- 任务：
  - 设置模块（时长、开关）
  - 设置变更实时影响计时行为
- 验证：
  - 设置保存后刷新不丢失

## D9（2026-03-18）
- 任务：
  - 通知权限引导与降级
  - 提示音播放与失败兜底
  - 页面可见性恢复重算
- 验证：
  - 通知拒绝/默认/允许三态验证

## D10（2026-03-19）
- 任务：
  - 响应式与可访问性修复
  - 组件细节与 Tailwind 样式收敛
  - 端到端关键路径自测
- 验证：
  - 360px 宽度可用
  - 键盘可完成核心操作

## D11（2026-03-20）
- 任务：
  - GitHub Actions Pages 发布打通
  - README 补齐使用说明与链接
  - 最终验收与问题清零
- 验证：
  - 线上可访问并通过验收清单

## 6. 任务责任与并行策略（单人/小团队通用）
- 角色 A（前端主程）：
  - WBS-05/06/08/11 主责
- 角色 B（工程效能与质量）：
  - WBS-01/03/04/13/15 主责
- 角色 C（体验与测试）：
  - WBS-07/10/12/14 主责
- 并行原则：
  - 先锁定数据模型与状态机接口，再并行 UI 开发
  - 以 mock store 先行推进组件，减少等待

## 7. 质量门禁与验收清单
## 7.1 开发阶段门禁
- PR 必须通过：
  - Lint
  - Unit Test
  - Build
- 关键模块覆盖率目标：
  - `timer engine` >= 90%
  - `stats aggregator` >= 85%
  - `migration` >= 85%

## 7.2 提测门禁
- 功能 checklist 全部通过
- 无 P0/P1 缺陷
- 无阻断发布的控制台错误

## 7.3 发布门禁
- GitHub Pages 线上回归通过：
  - 启动一个番茄
  - 完成后统计增加
  - 刷新后数据仍在
  - 移动端可完成核心流程

## 8. 风险管理与缓冲
- 风险 R1：后台标签页计时误差
  - 预防：时间戳差值算法 + 可见性事件重算
  - 缓冲：D9 预留 0.5 天修复窗口
- 风险 R2：Pages 静态路径错误
  - 预防：Vite `base` 与仓库名一致
  - 缓冲：D11 发布前灰度验收
- 风险 R3：本地存储异常与迁移失败
  - 预防：版本化 schema + 自动回退默认值
  - 缓冲：D3 与 D8 双次验证

## 9. 分支与提交策略
- 分支模型：
  - `main`：可发布主干
  - `feature/*`：功能分支
  - `fix/*`：缺陷修复分支
- 提交规范（建议）：
  - `feat(timer): add phase transition machine`
  - `fix(storage): guard invalid persisted state`
  - `chore(ci): add pages deployment workflow`

## 10. Definition of Done（DoD）
- 代码已合入主干并通过 CI
- 对应测试已补充且通过
- 文档（README/配置说明）已更新
- 验收清单项可复现通过
- 无阻断级已知问题

## 11. 首次启动任务清单（可直接执行）
1. 初始化工程：Vite + React + TS + Tailwind
2. 建立目录：`domains/store/infra/components`
3. 定义状态与模型：`Phase/RunState/Settings/Task`
4. 实现 `localStorageRepo` 与版本化 schema
5. 完成计时状态机与单测
6. 接入计时器 UI 并跑通主流程
7. 逐步补齐任务/统计/设置模块
8. 配置 GitHub Actions 并发布 Pages
