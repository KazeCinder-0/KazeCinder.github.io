---
title: "第3节. EmailAgent案例"
category: "langchain"
chapter: "第三章"
date: "2026-06-10"
---

# 第3节. EmailAgent案例

利用前面所学的Runtime和Middleware的知识完成一个实战案例。

## 需求分析

Email Friend 包含以下核心功能：

- 邮箱认证授权
- 读写邮件
- 邮件操作的人工确认
- 多会话管理
- 基于SSE的异步通信

## 实现思路

定义一个基础Agent，核心是模型（Model）和工具（Tool）。

工具需要定义3个：

- 邮箱鉴权工具
- 查看邮件工具
- 发送邮件工具

记忆使用自定义state，包含两个信息：

- messages：会话历史
- authenticated：鉴权状态

## 动态中间件

### 动态工具中间件

通过中间件实现动态工具：

- 在用户邮箱授权之前，只能看到authenticate工具
- 在用户邮箱授权之后，只能看到send_email和check_inbox工具

```Python
@wrap_model_call
def dynamic_tool_call(
    request: ModelRequest, handler: Callable[[ModelRequest], ModelResponse]
) -> ModelResponse:
    authenticated = request.state.get("authenticated")
    if authenticated:
        tools = [check_inbox, send_email]
    else:
        tools = [authenticate]
    request = request.override(tools=tools)
    return handler(request)
```

### 动态提示词中间件

通过判断state的authenticated值来动态切换提示词：

```Python
@dynamic_prompt
def dynamic_prompt_func(request: ModelRequest) -> str:
    authenticated = request.state.get("authenticated")
    final_prompt = authenticated_prompt if authenticated else unauthenticated_prompt
    return final_prompt
```

## HITL 的 stream 模式

由于HITL并不是模型的能力，而是LangChain利用wrap_tool_call在模型调用工具前后的一种拦截行为。因此采用messages模式只能看到模型返回的消息，无法看到interrupt中断信息。

在HITL存在时，stream采用的模式比较特殊，需要同时包含两种模式：

- messages: 以token方式返回AI生成的内容
- updates: 返回Agent调用时的每个步骤的完整信息
