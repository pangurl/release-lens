# Signal-to-Ship｜两周原型路径

## 0. Definition of Done

一个新用户能在不访问数据库、不看日志的情况下：提交 10 个演示 URL，看到任务进度，审阅带原文引用的痛点簇，理解排名原因，选出一个项目，并下载 7 天 MVP 计划。

## 第 1 周：做完整垂直切片

### Day 1 — 仓库与数据骨架

- 建立 `apps/web`、`apps/api`、`apps/worker`、`packages/contracts` 和 `infra`。
- 建立实体迁移、Pydantic/TypeScript 共享 JSON Schema、`.env.example`。
- 写入 20 条合法公开来源的固定 fixture，保证演示和测试可复现。

验收：`docker compose up` 后可创建 Workspace、写入和读取 Source。

### Day 2 — 采集与证据

- 实现 URL 规范化、域名白名单/拒绝列表、超时、hash 去重。
- 使用 API 优先的 GitHub/HN 适配器；手工 URL 只抽取可公开访问正文。
- 切分可引用证据段，并保存其来源位置。

验收：每条成功 Source 至少有一个 `EvidenceSnippet`；失败项在 UI 和 API 返回明确原因。

### Day 3 — 结构化抽取

- 定义 `Signal` JSON Schema。
- 输入正文和证据段，生成并校验：问题、受影响人群、替代做法、证据 ids、具体性。
- 保存 prompt/模型/Schema 版本；无法验证引用时标为失败，不静默降级。

验收：fixture 的 80% 能得到有效 Signal；每个 Signal 的证据 ids 均属于同一 Source。

### Day 4 — 聚类与评分

- 生成 embedding；以余弦阈值建立候选邻居，执行聚类。
- 实现纯函数评分器，并单元测试边界、扣分和来源不足规则。
- 返回每项得分贡献。

验收：top 3 簇可重复得到相同排序；评分 API 包含所有分项。

### Day 5 — 审阅界面

- 构建 Workspace 创建、导入、任务进度和簇列表页面。
- 项目卡可展开证据引用、评分明细、反对理由。

验收：非开发者可在 3 分钟内完成一次 demo 流程。

## 第 2 周：把“分析”变成“交付”

### Day 6–7 — Blueprint 生成

- 以被选簇、用户约束、已知证据为输入生成受 Schema 约束的蓝图。
- 强制输出 `in_scope`、`out_of_scope`、7 天任务、架构、验收标准、待验证假设。
- Markdown 导出和静态快照。

验收：蓝图不出现无来源的市场事实；范围不超过 7 天。

### Day 8 — 可靠性

- API、评分器、提取验证、任务状态机测试。
- Playwright 端到端测试：导入 fixture → 跑分析 → 打开项目卡 → 导出 Markdown。
- 失败任务重试与空状态。

### Day 9 — 可观测性与部署

- 加 request/run id、结构化日志、耗时和模型调用计数。
- Docker Compose、本地 seed、GitHub Actions 的 lint/test/build。
- 部署演示环境，单独保留演示数据。

### Day 10 — 求职包装

- README：问题、架构图、权衡、运行方法、Demo gif、局限性。
- 录制 90 秒视频：杂乱链接 → 可审计机会 → 7 天蓝图。
- 准备 5 分钟面试讲解，重点是证据链、任务队列、评分可解释性与失败处理。

## 最小测试矩阵

| 层 | 必测项 |
| --- | --- |
| 单元 | URL canonicalization、score clamp、来源不足、Schema validation |
| 集成 | Source → snippets → signal → cluster → opportunity 的持久化链路 |
| E2E | fixture 导入、任务状态、证据展开、Markdown 导出 |
| 手工 | 同源重复 URL、抓取失败、无有效信号、低证据簇、LLM 格式错误 |

## 首个可提交 GitHub Issue

**标题：** `feat: create auditable source-ingestion vertical slice`

**完成条件：**

- 接收最多 30 个 URL，返回 `analysis_run_id`；
- Worker 规范化、去重并保存抓取状态；
- 每个成功来源产生带 URL/时间的证据段；
- API 和 Web 均可查询逐项进度；
- 具备 fixture、单元测试和 Docker Compose 本地启动说明。
