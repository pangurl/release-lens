# Signal-to-Ship｜MVP 技术设计

## 1. 架构选择

采用单仓库、前后端分离的可部署架构：

```text
Next.js Web (TypeScript)
        │ REST + SSE  
FastAPI API (Python) ── PostgreSQL + pgvector
        │                    │
        ├── Redis / task queue ┘
        │
Worker: fetch → extract → normalize → embed → cluster → score → blueprint
        │
Public URL / GitHub API / HN API (遵守各自条款与速率限制)
```

### 推荐技术栈

| 层 | 选择 | 求职价值 |
| --- | --- | --- |
| Web | Next.js、TypeScript、Tailwind、TanStack Query | 类型安全前端、异步状态、可视化证据链 |
| API | FastAPI、Pydantic、SQLAlchemy | 明确 Schema、异步接口、Python AI 集成 |
| 任务 | Celery 或 Dramatiq + Redis | 抓取/LLM 长任务脱离请求生命周期 |
| 数据 | PostgreSQL + pgvector | 关系数据、向量检索、可重放分析 |
| AI | embedding provider + 结构化输出模型 | 不是聊天，而是受 Schema 约束的提取与生成 |
| 交付 | Docker Compose、GitHub Actions、Vercel + Render/Fly.io | 可复现开发、CI、上线能力 |

MVP 可用 SQLite + 本地向量索引替代 PostgreSQL/Redis，**但 GitHub 展示版必须迁移到 PostgreSQL + pgvector**，以证明生产化设计能力。

## 2. 领域实体

```text
Workspace 1──N Source 1──N EvidenceSnippet
Workspace 1──N AnalysisRun
AnalysisRun 1──N Signal N──1 Source
AnalysisRun 1──N PainCluster 1──N Signal
PainCluster 1──N Opportunity
Opportunity 1──0..1 Blueprint
```

关键字段：

- `Source`: `canonical_url`, `title`, `publisher`, `fetched_at`, `content_hash`, `fetch_status`。
- `EvidenceSnippet`: `quote`, `start_offset`, `end_offset`, `source_url`，保证 UI 能引用原文。
- `Signal`: `problem_statement`, `actor`, `workaround`, `specificity`, `novelty`, `embedding`, `extraction_version`。
- `PainCluster`: `label`, `centroid_embedding`, `member_count`, `confidence`。
- `Opportunity`: `frequency`, `specificity`, `recency`, `source_quality`, `saturation_penalty`, `delivery_risk`, `score`, `score_version`。
- `Blueprint`: `problem`, `target_user`, `scope_in`, `scope_out`, `architecture`, `milestones`, `acceptance_tests`。

## 3. 可解释评分

所有归一化指标范围为 0–100：

```text
raw = 0.30 × frequency
    + 0.20 × specificity
    + 0.15 × recency
    + 0.15 × source_quality
    + 0.10 × skill_fit
    + 0.10 × evidence_coverage
    - 0.15 × saturation_penalty
    - 0.10 × delivery_risk

opportunity_score = clamp(round(raw), 0, 100)
```

分数不代表市场规模；它仅用于在当前一批来源、当前用户约束下排序。低于 3 条独立来源的机会必须显示 `验证不足`，不能进入“推荐”状态。

## 4. API 合同（首版）

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| `POST` | `/workspaces` | 创建用户约束 |
| `POST` | `/workspaces/{id}/sources` | 提交 URL 列表 |
| `POST` | `/workspaces/{id}/analysis-runs` | 入队分析并返回 run id |
| `GET` | `/analysis-runs/{id}` | 查询状态与阶段进度 |
| `GET` | `/analysis-runs/{id}/clusters` | 读取簇、证据与评分 |
| `POST` | `/opportunities/{id}/blueprint` | 生成/再生成蓝图 |
| `GET` | `/blueprints/{id}/export?format=md` | 导出可提交的 Markdown |

## 5. 关键风险与处理

| 风险 | 处理 |
| --- | --- |
| 抓取失败或内容变动 | 记录状态、重试次数和内容 hash；允许用户手工粘贴文本。 |
| LLM 生成幻觉 | 结构化输出、每个字段映射引用片段、未引用字段拒绝展示为结论。 |
| 相似但不相同的痛点被误合并 | 先取候选近邻，再用阈值 + LLM 判别；UI 支持拆分/合并。 |
| 成本失控 | 限制每 run 的 URL 数、正文长度与模型调用次数；缓存 embedding 和提取结果。 |
| 爬虫合规 | API 优先；尊重站点条款、速率限制和禁止抓取列表。 |
