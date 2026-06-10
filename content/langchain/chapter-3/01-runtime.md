---
title: "第1节. Runtime (Agent内部状态)"
category: "langchain"
chapter: "第三章"
date: "2026-06-10"
---

# 第1节. Runtime

LangChain的Runtime机制是理解Agent内部运行状态的关键。它包括三个核心概念：

- State（短期记忆）
- Store（长期记忆）
- Context（运行上下文）

## State（短期记忆）

State是Agent的短期记忆，存储当前会话的历史消息、任务状态等信息。

### 自定义State

```Python
from langchain.agents import AgentState
from typing import NotRequired

class CustomState(AgentState):
    """Agent的任务状态"""
    model_call_count: NotRequired[int]  # 模型调用次数
    session_start: NotRequired[str]  # 会话开始时间
```

### 在工具中访问state

```Python
from langchain.tools import tool, ToolRuntime
from langgraph.types import Command
from langchain.messages import ToolMessage
from datetime import datetime

@tool
def update_state(runtime: ToolRuntime):
    """A tool that update agent state"""
    messages = runtime.state['messages']
    message_count = len(messages)
    command = {
        "model_call_count": runtime.state.get("model_call_count", 0) + 1,
        "messages": [ToolMessage("Successfully updated agent state", tool_call_id=runtime.tool_call_id)]
    }
    if message_count <= 2:
        command['session_start'] = datetime.now()
    return Command(update=command)
```

## Store（长期记忆）

Store是LangChain提供的长期记忆机制，用于在不同会话间共享数据。

### Store的数据结构

Store的数据格式是JSON文档，采用分级管理：

- Namespace（命名空间）：可以理解为一个文件夹
- Key（键）：可以理解为文件名，必须唯一
- Value（值）：要存储的JSON文档

```Python
from langgraph.store.memory import InMemoryStore

memory_store = InMemoryStore()

memory_store.put(("preferences",), "user_001", {
    "style": "business_markdown",
    "language": "zh-CN"
})
```

## Context（运行上下文）

Context用于在运行时传递配置参数、用户信息等会话临时数据。

```Python
from dataclasses import dataclass

@dataclass
class UserContext:
    """Agent运行时上下文"""
    user_id: str = ""
```
