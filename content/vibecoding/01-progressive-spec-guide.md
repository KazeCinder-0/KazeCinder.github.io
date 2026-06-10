---
title: "2026 年 AI 编码的渐进式 Spec 实战指南"
category: "vibecoding"
chapter: "第一章"
date: "2026-06-10"
---

# 2026 年 AI 编码的"渐进式 Spec"实战指南

作者: 阿里云开发者
发布时间: 2026年4月2日
来源: 微信公众号

## 一、背景

聊 AI 编码之前，先对齐三个基础认知。

### 1.1 如何理解大模型 — 它能做什么、不能做什么

不同模型之间的性能差异是断崖式的。Chatbot Arena 通过真人盲评计算 ELO 分数：

| 梯队 | 模型 |
|------|------|
| T0 | Claude 4.6 Opus、Gemini 3.1 Pro |
| T1 | Grok 4.20、GPT 5.2、Gemini 3 Pro、Claude Sonnet 4.6 |
| T1.5 | Dola-Seed 2.0、Kimi-K2.5(月之暗面)、GLM-5(智谱) |
| T2 | Claude 4.5 Sonnet、GPT 5.1、Gemini 3 Flash |

核心结论：模型是地基，方法论是上层建筑。

### 1.2 如何理解 Agent — 从一问一答到自主行动

> Agent = while 循环 + Tool Use + 工具执行器

## 二、渐进式编码框架

### 2.1 Spec Coding 是什么

一句话：在让 AI 写代码之前，先用结构化文档（Spec）把"要做什么、怎么做、有什么约束"说清楚，然后 AI 围绕这份文档编码。

Spec Coding 三条铁律：

- No Spec, No Code — 没有文档，不准写代码
- Spec is Truth — 文档和代码冲突时，错的一定是代码
- Reverse Sync — 发现 Bug，先修文档，再修代码

### 2.3 核心设计：渐进式复杂度

| 复杂度 | 流程 | 适用场景 | 占比 |
|--------|------|----------|------|
| 简单 | rules/ + 直接对话 | 改字段、修bug、加日志 | ~70% |
| 中等 | + spec.md | 新增接口、迁移模块 | ~25% |
| 复杂 | + spec + tasks + knowledge | 链路迁移、新子系统、跨模块 | ~5% |

### 2.5 框架全貌：目录结构

```
code_copilot/
├── rules/                      # Project Rules（始终生效）
├── knowledge/                  # 领域知识（按需加载）
├── agents/                     # Agent 配置与提示词
├── changes/                    # 变更管理
└── archives/                   # 已完成变更的归档
```

## 三、实操效果与踩坑

### 3.1 实际效果

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 一次做对率 | ~30% | ~75% | +150% |
| 对话轮次 | 15-25 轮 | 3-7 轮 | -70% |
| 人工 Review 时间 | 30-60min | 5-15min | -75% |
| 返工率 | ~40% | ~10% | -75% |

### 3.2 踩坑记录

- Spec 写太细，AI 不看 — 单个 spec 控制在 500 行以内
- Rules 写太多，互相矛盾 — 精简到 5-8 条核心 rule
- 知识库塞满垃圾 — /archive 时逐条确认
- Agent 自己改 spec — 加 Reverse Sync 强制回写

## 四、总结

- 模型是地基：选对模型是一切的前提
- Spec Coding 是方法论：No Spec No Code、Spec is Truth、Reverse Sync
- 渐进式是关键：70% 的简单需求不该承担复杂流程的成本
- 一切皆可迭代：prompt、模板、rules 都是代码
- 知识飞轮：实践 → 踩坑 → 沉淀 → AI 更准 → 更好实践
