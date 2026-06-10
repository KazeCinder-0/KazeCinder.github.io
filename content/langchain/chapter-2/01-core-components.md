---
title: "第1节. LangChain核心组件"
category: "langchain"
chapter: "第二章"
date: "2026-06-10"
---

# 第1节. LangChain核心组件

## 认识LangChain

LangChain 由 Harrison Chase 创建于2022年10月，是用于开发智能体工程（Agent Engineering）的平台。

### 架构体系

LangChain并不仅仅是一个框架，而是一整个智能体开发平台，包含很多不同的组件。

其中，包含一系列开源的智能体（Agent）开发框架，而且兼容Python和TypeScript两种语言：

- LangChain：用于快速构建智能体，可兼容任何模型提供商。
- LangGraph：从底层一步步控制智能体的构建，包括记忆（Memory）、人机协同（HITL）等
- Deep Agents：用于构建复杂的、处理多步骤的任务的智能体

另外，LangChain还包含一套帮助人工智能团队利用实时生产数据进行持续测试和改进的平台，叫做LangSmith：

总结：

LangChain是智能体开发平台，包含一套各种帮助开发、测试、评估智能体的框架。核心包括：

- LangChain：用于快速构建智能体，可兼容任何模型提供商。
- LangGraph：从底层一步步控制智能体的构建，包括记忆（Memory）、人机协同（HITL）等
- Deep Agents：用于构建复杂的、处理多步骤的任务的智能体
- LangSmith：用于测试、观察、评估、部署智能体

### 什么是Agent

对于这个问题，LangChain创始人Harrison Chase有一个偏向技术性的答案：

> An AI agent is a system that uses an LLM to decide the control flow of an application.

Agent是一种使用大语言模型（LLM）来决定应用程序控制流的系统。

### 快速入门

#### 准备工作

首先，要使用LangChain必须先安装依赖：

```Python
uv add langchain
```

#### 代码示例

```Python
from dotenv import load_dotenv
load_dotenv()

@tool
def getWeather(location: str) -> str:
    """Get the weather in a given location. Args: location: city name or coordinates"""
    return f"Current weather in {location} is sunny"

agent = create_agent(
    "deepseek-chat",
    tools=[getWeather]
)

print("🚀 正在调用大模型...")
response = agent.invoke({
    "messages": [{"role": "user", "content": "杭州今天天气如何?"}]
})
print(response)
```

## 模型（Models）

### 初始化模型

#### init_chat_model

```Python
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
load_dotenv()

model = init_chat_model(model="deepseek-chat")
```

#### 自定义模型及参数

```Python
import os
base_url = os.getenv("DASHSCOPE_BASE_URL")
api_key = os.getenv("DASHSCOPE_API_KEY")

model = init_chat_model(
    model="qwen-max",
    model_provider="openai",
    base_url=base_url,
    api_key=api_key
)
```
