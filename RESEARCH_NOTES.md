# 主项目 01｜候选 Skill 与灵感证据（2026-10-22）

## 适合后续安装的 GitHub Skill 候选

| 优先级 | Skill / 仓库 | 用途 | 采用建议 |
| --- | --- | --- | --- |
| A | [Kestrel Search](https://github.com/rafaelpierre/kestrelsearch) | 多搜索引擎并发搜索、正文抽取、BM25 重排；可为 Codex 安装生成的 SKILL.md | 很适合 MVP 的信息采集与可复现检索；先在隔离环境试跑。 |
| A | [Startup Idea Validator](https://github.com/gabrieldejesusrodrigues/agent-skills/tree/main/skills/startup-idea-validator) | 从指定社区采集创意，去重，再从产品、商业、风险三面评估 | 借鉴其评估框架；不直接照搬三 Agent 架构，首版改为可解释评分卡。 |
| A | [deep-research-codex-skill](https://github.com/swllljjz/deep-research-codex-skill) | 证据池、章节化报告和机械 QA 的深度研究工作流 | 用作「证据链 + 可审计报告」规范，适配项目发现而非长报告。 |
| B | [ResearcherSkill](https://github.com/krzysztofdudek/ResearcherSkill) | 假设—实验—淘汰的研究循环 | 适合需求验证与项目复盘；涉及较长自主循环，先只采用模板。 |
| B | [last30days-agent-research](https://github.com/kiemul/last30days-agent-research) | 抓取近期社区信号与讨论 | 适合第二阶段的趋势/舆情发现；Windows 上还需要额外命令行依赖。 |
| C | [research-to-html](https://github.com/onovich/Research/tree/main/.agents/skills/research-to-html) | 将证据研究做成中英可审阅 HTML 报告 | 适合最终作品的“研究报告导出”展示，不是 MVP 核心。 |

> 安全约束：第三方 Skill 先阅读其 `SKILL.md` 与脚本，再安装；不授予额外凭据，不把未审查脚本接入自动发布流程。

## 从低互动黑客松作品抽出的产品机会

| 来源 | 可借鉴的核心 | 不能照搬的部分 |
| --- | --- | --- |
| [Research Assistant Application](https://devpost.com/software/research-assistant-application)（页面显示 2 个点赞） | 将采集、综合、质量评估拆为清晰阶段 | 通用“多 Agent 研究助手”已过于常见，缺少面向结果的决策闭环。 |
| [AgentFlow](https://devpost.com/software/agentflow-j9uc4q) | Fetch → Analyze → Generate → Deploy 的自动化管线 | 定时简报只是在生产内容，无法帮助用户做取舍。 |
| [State of Digital Decay](https://devpost.com/software/state-of-digital-decay) | 用户真正痛点是“稍后再看”造成的信息债 | 单纯收藏/提醒很容易沦为另一层堆积。 |
| [Blueprint](https://devpost.com/software/blueprint-t06bg5) | 从兴趣与经验出发，降低项目选择成本，生成可执行学习路线 | 候选项目依赖星标等粗粒度信号，未证明痛点真实，也没有来源审计。 |

## 推荐主项目：Signal-to-Ship（信号到交付）

### 一句话

把一批网页链接或搜索主题转成 **可追溯的痛点簇**，再根据目标技术栈生成一个有证据、可执行、可展示的 MVP 项目蓝图。

### 为什么它适合求职作品

- 不是“又一个聊天机器人”：核心是可解释的筛选、去重、证据与行动优先级。
- 可展示完整技术能力：采集队列、内容抽取、向量/关键词混合检索、聚类去重、结构化 LLM、评分、Web UI、缓存与可观测性。
- 自带 Demo 数据与故事：从 30 条弱信号中，得出一个值得做的项目和 7 天计划；每条结论可点击回原始来源。

### 最小可行闭环

`输入主题/链接 → 抽取问题陈述 → 相似信号合并 → 证据评分 → 生成项目卡 → 7 天 MVP 计划`

评分不依赖黑盒：

`机会分 = 痛点频次 × 具体程度 × 最近性 × 来源可信度 − 同质化惩罚 − 实现风险`

### 首版边界

- 数据源：手动 URL、GitHub Issues、Hacker News / Devpost 的公开页面；不碰需要账号或违反条款的抓取。
- 只服务一个人：目标岗位/技术栈为约束条件，输出 1–3 个候选项目而非“创业点子大全”。
- 每个结论强制附来源 URL、引用片段、抓取时间与置信度。

## 另外两个方向

1. **Decision Debt Inbox（信息债清理器）**：将邮件、网页、PDF 转成「现在做 / 计划做 / 忽略」并提供理由与截止日期。更容易做，但技术辨识度略弱。
2. **Evidence Radar（机会雷达）**：长期跟踪 GitHub Issues、招聘 JD、社区讨论，发现某技能/问题的变化并推送证据简报。工程味更强，但 MVP 需要可靠的数据更新与通知。
