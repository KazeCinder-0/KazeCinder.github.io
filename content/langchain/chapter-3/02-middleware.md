---
title: "第2节. Middleware (中间件)"
category: "langchain"
chapter: "第三章"
date: "2026-06-10"
---

# 第2节. Middleware

Middleware，也就是中间件是一种控制Agent内部运行过程的技术，它在智能体运行的各个过程中预留钩子（hook），方便我们嵌入自定义操作。

基于Middleware可以实现各种高级功能：

- 拦截和修改请求 - 在模型调用前后对输入输出进行处理
- 实现PII脱敏 - 自动检测和脱敏敏感个人信息
- 会话摘要管理 - 当对话过长时自动压缩历史消息
- 人工审核机制 - 在执行危险操作前等待人工确认
- 动态模型选择 - 根据运行时条件选择不同的模型
- 自定义状态管理 - 扩展Agent状态以跟踪额外信息

## 预定义中间件（Prebuilt Middleware）

LangChain提供了多种预置中间件：

### PIIMiddleware - 个人信息脱敏

PIIMiddleware是一种预定义的wrap_modelcall中间件，可以在调用模型前后自动检测并脱敏输入、输出消息中的个人身份信息（PII）。

脱敏策略有四种：

- 'block' - 抛出异常
- 'redact' - 用 [REDACTED{PII_TYPE}] 来替代
- 'mask' - 关键信息采用掩码
- 'hash' - 用哈希值来替换

### ModelFallbackMiddleware

ModelFallbackMiddleware的作用是在模型调用失败时给出降级处理方案。

### HumanInTheLoopMiddleware - 人工审核

HumanInTheLoop，简称为HITL，让人工介入到Agent执行流程中，在执行工具调用前暂停，等待人工确认。

可选操作：

- approve：允许执行
- reject：拒绝执行
- edit：修改tool参数后执行

## 自定义中间件

### node-style装饰器

- before_agent
- before_model
- after_model
- after_agent

### wrap-style装饰器

- wrap_model_call
- wrap_tool_call

## 类装饰器

对于需要同时用到多个hooks的更复杂的中间件逻辑，可以使用自定义类继承AgentMiddleware的方式来创建中间件。

## 高级用法

### 动态修改请求参数

利用request.override()来覆盖原本的request参数。

### 条件跳转

在中间件使用jump_to指令可以跳过模型调用，直接进入指定的Agent节点。
