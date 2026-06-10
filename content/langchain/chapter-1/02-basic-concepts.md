---
title: "第1节. 基本概念和入门 (LangGraph)"
category: "langchain"
chapter: "第一章"
date: "2026-06-10"
---

# 第1节. 基本概念和入门

正如前面所述，LangGraph中包含的核心组件有：

- 节点（Node）：工作流中的关键工作代码，可以是工具调用、知识检索、LLM调用，用函数来定义

- 边（Edge）：也可以理解为线，就是把各个节点连接起来的路径，是控制工作流走向的关键，连接方式有：

  - 串行
  - 并行
  - 条件

- 状态（State）：整个工作流中流转的数据

由Node和Edge组成的工作流就被称为图（Graph）：

接下来，我们就逐个学习LangGraph中的这些概念，以及如何利用这些组件构成图（Graph），并自定义Agent.

以下是本节课要用到的所有依赖：

```Python
from typing import Annotated, TypedDict, Literal
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages, MessagesState
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command, CachePolicy, interrupt
from langgraph.runtime import Runtime
from langgraph.types import RetryPolicy, TimeoutPolicy
from langgraph.errors import NodeError

from langchain_core.messages import (
    BaseMessage, SystemMessage, HumanMessage, ToolMessage
)
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from IPython.display import Image, display
from operator import add
from dotenv import load_dotenv
from pydantic.dataclasses import dataclass
load_dotenv()
```

## 基本概念

LangGraph的核心概念有3个：Node、Edge、State

### 节点（Node）

节点（Node）是图（Graph）的执行单元，每个Node是一个Python函数。

格式如下：

```Python
def my_node(state: State) -> dict:
    # 从state读取数据
    # 执行计算逻辑（可以调用LLM、工具、数据库等）
    # 返回state的更新部分（dict）
    return {"some_key": new_value}
```

- 输入：完整的State对象
- 输出：一个字典，只包含要更新的字段（部分更新）
- 可以做什么：调用LLM、执行工具、读数据库、文件操作，最终把结果更新到State中...

需要注意的是，LangGraph有两个默认的Node是无需定义的，可以直接使用：

- START：开始节点，也是入口
- END：结束节点，也是出口

例如，我们要做一个简单的Graph：
start(用户输入name) --> 节点1（生成问候语）--> 节点2（把问候语转大写）--> end

```Python
# 最简单的三要素示例

# 1. State: 定义共享数据结构
class SimpleState(TypedDict):
    name: str       # 记录用户name
    greeting: str   # 记录生成的问候语

# 2. Node: 定义处理逻辑
# node 1: 生成问候语的节点
def greet_node(state: SimpleState):
    """接收name，生成greeting"""
    print(f"greet_node is receiving name: {state['name']}")
    return {"greeting": f"Hello, {state['name']}!"}
# node 2: 转大写
def uppercase_node(state: SimpleState):
    """将greeting转为大写"""
    print(f"uppercase_node is receiving greeting: {state['greeting']}")
    return {"greeting": state["greeting"].upper()}

# 3. Edge: 编排执行顺序
graph_builder = StateGraph(SimpleState)             # 1.用State创建图
                                                    # 2.注册节点
graph_builder.add_node("greet", greet_node)             # greet节点
graph_builder.add_node("uppercase", uppercase_node)     # uppercase节点
                                                    # 3.创建edge，连接各个节点
graph_builder.add_edge(START, "greet")                  # START -> greet
graph_builder.add_edge("greet", "uppercase")            # greet -> uppercase
graph_builder.add_edge("uppercase", END)                # uppercase -> END

graph = graph_builder.compile()                     # 4.编译成可执行图

display(Image(graph.get_graph().draw_mermaid_png()))
```

生成的图结构：

测试一下（注意：调用Graph必须传入初始化的State）：

```Python
# 执行
result = graph.invoke({"name": "World"})
print(f"结果: {result['greeting']}")
```

结果：

```
greet_node is receiving name: World
uppercase_node is receiving greeting: Hello, World!
结果: HELLO, WORLD!
```

### State（状态）

State是图的共享内存，贯穿整个执行过程。

- State定义Graph中的数据字段
- 每个Node都可以获取State数据、更新的State数据（返回要更新的字段值即可）

而Node返回数据后State的更新处理方式取决于Reducers，而且State中的每个字段都有自己的Reducer。

#### 默认Reducer

需要注意的是：如果字段没有指定Reducer，那默认的Reducer行为就是覆盖。

也就是说：如果多个Node都更新了State中的同一个字段，默认情况下后执行的Node将覆盖前面Node的更新结果。

#### 自定义Reducer

如果我们不希望覆盖，则需要自定义Reducer，需要用到Annotated来定义：

- Annotated[type, reducer]

### Edge（边）

Edge定义节点的执行顺序。LangGraph提供两种Edge：

#### Normal Edge

#### Conditional Edge

条件边的添加方式如下：

```Python
add_conditional_edges(node_a, router, mapping)
```

接收三个参数：

- node_a：是当前节点
- router：路由函数，逻辑自定义，它的返回值默认就是下个节点的名字。
- mapping：如果router返回值与下个节点名不一样，可以用mapping定义返回值与下个节点名字的映射关系

router可以根据情况返回不同的结果，但一次只能有一个结果。也就是说Conditional Edge连接的多个节点有且只有1个会成为next_node。

#### Command实现条件分支

如果不想编写Conditional Edge，也可以在Node中直接返回下个节点信息。

### LangGraph构建Agent

学会了用LangGraph的基本概念，以及如何创建Graph，接下来我们就可以用LangGraph从零构建一个Agent了。

#### 基础LLM调用工作流

```Python
llm = init_chat_model("deepseek-chat")

class SimpleAgentState(TypedDict):
    user_input: str
    result: str

def call_llm(state: SimpleAgentState):
    response = llm.invoke(state['user_input'])
    return {"result": response.content}

llm_graph = (
    StateGraph(SimpleAgentState)
    .add_node("llm", call_llm)
    .add_edge(START, "llm")
    .add_edge("llm", END)
    .compile()
)
result = llm_graph.invoke(SimpleAgentState(user_input="你好", result=""))
print(result)
```

#### 消息历史

#### 会话记忆

#### 带工具调用的LLM工作流
