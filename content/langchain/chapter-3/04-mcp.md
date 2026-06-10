---
title: "第4节MCP"
category: "langchain"
chapter: "第三章"
date: "2026-06-10"
---
# 第4节. MCP



MCP (Model Context Protocol) 是由 Anthropic 推出的开放标准，用于便捷的将AI应用连接外部系统。

在没有MCP的时候，必须手动定义工具，用工具实现文件操作、web搜索、查询航班、查询天气等功能，从而让AI连接外部系统。

这就存在两个问题：

- 不同Agent可能有同样的tool需求，每次都重复定义，复用性差

- 全世界有各种不同的服务，不同服务接口不同，定义Tool非常麻烦

MCP就像是AI世界的USB接口协议：

- 所有外部服务提供者都可以遵循MCP协议提供Tool，分享自己的Tool服务

- AI应用基于MCP协议对接任意遵循MCP的外部服务，无需自己定义Tool

这样一来就解决了重复定义工具的复用性问题、以及对接全世界各种公共服务的问题。


## MCP核心概念


## 连接外部MCP服务



很多提供云服务的公司都提供了MCP服务，例如：

- Amap Maps : 高德地图提供的MCP

- Filesystem : 可以操作文件系统的MCP

- Time : 查询当前时间的MCP服务

- Kiwi : 查询航班、预定航班的MCP服务

- ...

大家可以在https://mcp.so/zh/搜索各种MCP服务：

找好自己想要使用的MCP服务后，就可以用LangChain来对接了。

首先，我们需要安装LangChain的MCP依赖库:

Plain Text
uv add langchain-mcp-adapters


接下来，就可以用LangChain对接MCP服务，获取其提供的工具，创建Agent了。

接下来，我们以两个MCP服务为例来介绍LangChain对接MCP服务的方式：

- Time MCP ：基于stdio通信

- Kiwi MCP : 基于http通信


### Time MCP服务



# 连接Time MCP服务器


client = MultiServerMCPClient(
    {
        "time": {
            "transport": "stdio",
            "command": "uvx",
            "args": [
                "mcp-server-time",
                "--local-timezone=Asia/Shanghai"
            ]
        }
    }
)


# 注意MultiServerMCPClient是异步的，结果都是协程对象，需要await


tools = await client.get_tools()


打印可以看到Time MCP提供的工具：

Python
for tool in tools:
    print(tool.name)
    print(tool.description)
    print("-----------------------")


结果：

Plain Text
get_current_time
Get current time in a specific timezones
-----------------------
convert_time
Convert time between timezones


接下来，就可以像正常使用Tool那样创建Agent即可：

Python
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage

agent = create_agent("deepseek-chat", tools)

response = await agent.ainvoke({
    "messages": [HumanMessage("现在几点了？")]
})

for message in response["messages"]:
    message.pretty_print()


结果：

JSON
================================ Human Message =================================

现在几点了？
================================== Ai Message ==================================

好的，我先获取一下当前的时间。
Tool Calls:
  get_current_time (call_00_LEeOqXUsKTiAo4abwEjn6951)
 Call ID: call_00_LEeOqXUsKTiAo4abwEjn6951
  Args:
    timezone: Asia/Shanghai
================================= Tool Message =================================
Name: get_current_time

[{'type': 'text', 'text': '{\n  "timezone": "Asia/Shanghai",\n  "datetime": "2026-05-12T10:47:13+08:00",\n  "day_of_week": "Tuesday",\n  "is_dst": false\n}', 'id': 'lc_ccf2b9d8-76e4-491e-839a-e3a1d703f7b8'}]
================================== Ai Message ==================================

现在是 2026年5月12日 星期二 上午10:47（北京时间，UTC+8）。
```


### Kiwi MCP服务



# 连接Kiwi MCP服务器


client = MultiServerMCPClient(
    {
        "kiwi-com-flight-search": {
            "transport": "http",
            "url": "https://mcp.kiwi.com"
        }
    }
)


# 注意MultiServerMCPClient是异步的，结果都是协程对象，需要await


tools = await client.get_tools()

agent = create_agent(
    model="deepseek-chat",
    tools=tools,
    system_prompt="You are a travel agent. Help user find best flights. No follow up questions. If the user uses Chinese, use zh-cn as the locale value."
)

response = await agent.ainvoke({
    "messages": [HumanMessage("查一下2026年5月15日晚上从北京飞杭州的航班。")]
})

for message in response["messages"]:
    message.pretty_print()


注意：由于Kiwi中有地域参数（locale），但Tool描述中没说清楚，中文有两种：zh-cn,zh-tw，需要在系统提示词中说明，否则AI默认会传入zh，导致报错。

结果：

JSON
================================ Human Message =================================

查一下2026年5月15日晚上从北京飞杭州的航班。
================================== Ai Message ==================================

好的，我来查一下2026年5月15日从北京飞杭州的航班。
Tool Calls:
  search-flight (call_00_pRivmQypfxROSByOOncn2383)
 Call ID: call_00_pRivmQypfxROSByOOncn2383
  Args:
    flyFrom: 北京
    flyTo: 杭州
    departureDate: 15/05/2026
    locale: zh-cn
    curr: CNY
================================= Tool Message =================================
Name: search-flight

[{'type': 'text', 'text': '[\n  {...}, {...}, {...}\n]', 'id': 'lc_dfcd0ae5-f9b9-4a9c-b477-4f0a3e01078c'}]
================================== Ai Message ==================================

好的！以下是2026年5月15日（周五）从北京飞往杭州的航班信息。由于您说"晚上"，我特别筛选了下午到晚间出发的航班为您整理如下：


### 🌟 最便宜航班（性价比之选）


| 航线 | 时间 | 舱位 | 价格 | 预订链接 |
|------|------|------|:----:|:--------:|
| 北京大兴 PKX → 杭州 HGH（经香港转机） | 05/15 02:35 → 14:40（12h 05m） | 经济舱 | ¥2,064 | 预订 |


### ⚡ 最短飞行（直飞最快）


| 航线 | 时间 | 舱位 | 价格 | 预订链接 |
|------|------|------|:----:|:--------:|
| 北京大兴 PKX → 杭州 HGH（直飞） | 05/15 07:25 → 09:25（2h 00m） | 经济舱 | ¥2,997 | 预订 |
| 北京大兴 PKX → 杭州 HGH（直飞） | 05/15 07:30 → 09:30（2h 00m） | 经济舱 | ¥2,577 | 预订 |


### ✈️ 其他可选航班（晚间出发）


| 航线 | 时间 | 舱位 | 价格 | 预订链接 |
|------|------|------|:----:|:--------:|
| 北京大兴 PKX → 杭州 HGH（直飞） | 05/15 21:25 → 23:40（2h 15m） | 经济舱 | ¥2,567 | 预订 |
| 北京首都 PEK → 杭州 HGH（直飞） | 05/15 21:25 → 23:35（2h 10m） | 经济舱 | ¥2,855 | 预订 |


### 💡 推荐总结


- 💰 最便宜：经香港转机的航班仅 ¥2,064，但耗时较长（约12小时）
- ⚡ 最快：大兴机场直飞仅需 2小时，价格 ¥2,577起（如07:30出发的航班）
- 🌟 最佳推荐：如果您想要晚上出发，推荐 大兴 PKX 21:25→23:40（¥2,567） 或 首都 PEK 21:25→23:35（¥2,855），都是晚间直飞，到了杭州直接休息！

祝您旅途愉快！🎉


说明：Kiwi更擅长搜索国际航班，如果是国内航班更建议大家基于携程官方API开发Tool来实现航班搜索。

另外，有一个替代的国内航班查询MCP服务，地址是：https://mcp.variflight.com/

不过这个服务是收费的，而且价格比较贵，即便是优惠过后也需要0.1元/次。

使用步骤是：

- 注册账号

- 申请API Key

- 接入MCP

代码示例：

Python
from langchain_mcp_adapters.client import MultiServerMCPClient


# 连接Kiwi MCP服务器


client = MultiServerMCPClient(
    {
        "VariFlight-Aviation": {
            "transport": "http",
            "url": "https://ai.variflight.com/servers/aviation/mcp/?api_key=您在飞友AI开放平台申请的Key"
        }
    }
)

tools = await client.get_tools()

agent = create_agent(
    model="deepseek-chat",
    tools=tools,
    system_prompt="You are a travel agent. Help user find best flights. No follow up questions."
)

response = await agent.ainvoke({
    "messages": [HumanMessage("查一下2026年5月15日晚上从北京飞杭州的航班。")]
})

for message in response["messages"]:
    message.pretty_print()
```


## 自定义MCP服务



在公司内部，不同团队之间也可以把自己团队的服务开发成MCP Server，供其它团队使用。

接下来，我们就学习如何自定义MCP服务。


### 创建简单的MCP服务器



自定义MCP最简单的方式就是使用FastMCP了。

首先，需要安装依赖：

Plain Text
uv add fastmcp


接着，只需要定义几个方法，然后利用FastMCP提供的装饰器即可：

- @mcp.tool : 作为MCP中的工具

- @mcp.resources : 返回MCP需要的resources，类似拓展知识库

- @mcp.prompt : 返回MCP预定义的Prompt，预设的提示词

说明：MCP server端不仅可以提供tool，还可以提供resource、prompt，但通常不太常用，一般只需要提供tool即可。

通常我们只需要定义带有tool的MCP Server就可以了。

例如，我们定义一个数学运算的MCP服务，这个需要写到单独的py文件中，比如math_mcp_server.py：

```Python
from fastmcp import FastMCP


# 初始化mcp


mcp = FastMCP("Math")


# mcp tools


@mcp.tool()
def add(a: float, b: float) -> float:
    """Add two numbers"""
    return a + b

@mcp.tool()
def multiply(a: float, b: float) -> float:
    """Multiply two numbers"""
    return a * b

@mcp.tool
def square_root(x: float) -> float:
    """Calculate the square root of a number"""
    return x ** 0.5


# 启动mcp服务，通信方式设置为stdio


if name == "main":
    mcp.run(transport="stdio")
```

一个自定义MCP server就准备好了。

注意，由于我们是采用stdio方式，因此这个文件写好放在那里，不需要启动，将来MCP Client会自己启动并加载为子进程。


### 连接接自定义MCP服务



由于我们自定义的MCP是本地py文件，所以启动的Command直接就是python，而不是npx或uvx

```Python
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage


# 连接自定义MCP服务


client = MultiServerMCPClient(
    {
        "time": {
            "transport": "stdio",
            "command": "python",
            "args": ["math_mcp_server.py"]
        }
    }
)

# 获取工具


tools = await client.get_tools()


# 创建agent


agent = create_agent(
    model="deepseek-chat",
    tools=tools,
    system_prompt="You are a helpful agent. You must use tools to answer math question."
)


# 调用测试


response = await agent.ainvoke({
    "messages": [HumanMessage("467和529的平方根之和是多少?")]
})

for message in response["messages"]:
    message.pretty_print()


结果：

Python
================================ Human Message =================================

467和529的平方根之和是多少?
================================== Ai Message ==================================

我们先分别计算467和529的平方根，再求和。

首先计算529的平方根：
Tool Calls:
  square_root (call_00_j3L1qg1mxSJIBS9jdxll9134)
 Call ID: call_00_j3L1qg1mxSJIBS9jdxll9134
  Args:
    x: 529
================================= Tool Message =================================
Name: square_root

[{'type': 'text', 'text': '23.0', 'id': 'lc_423ebda4-fa3a-4d89-bb01-735ca14f9802'}]
================================== Ai Message ==================================

529的平方根是23。

接下来计算467的平方根：
Tool Calls:
  square_root (call_00_UCdL2SvqlmCaUESPUWNk9123)
 Call ID: call_00_UCdL2SvqlmCaUESPUWNk9123
  Args:
    x: 467
================================= Tool Message =================================
Name: square_root

[{'type': 'text', 'text': '21.61018278497431', 'id': 'lc_089fcd8-c507-4323-bd74-332c0089e9a7'}]
================================== Ai Message ==================================

467的平方根约为21.61018278497431。

现在将两者相加：
Tool Calls:
  add (call_00_0dqFXu63t1T0iFZPtag58521)
 Call ID: call_00_0dqFXu63t1T0iFZPtag58521
  Args:
    a: 21.61018278497431
    b: 23
================================= Tool Message =================================
Name: add

[{'type': 'text', 'text': '44.61018278497431', 'id': 'lc_aed59d32-0c84-4f18-b704-96bf1c5c640c'}]
================================== Ai Message ==================================

467和529的平方根之和约为 44.6102。

具体计算步骤如下：
- √529 = 23
- √467 ≈ 21.61018278497431
- 两者相加 ≈ 44.61018278497431
```


## 总结



1. MCP是什么

- 开放协议，标准化LLM应用获取工具的方式

- 客户端-服务器架构

1. 连接方式

- STDIO: 本地MCP服务器

- HTTP: 远程MCP服务器

1. 使用流程

- 配置MultiServerMCPClient

- 调用get_tools()获取工具

- 创建Agent并调用

1. 自定义MCP Server

- 导入FastMCP

- 使用@mcp.tool装饰函数，定义工具（必备）

- 使用@mcp.resource装饰函数，返回resources（可选）

- 使用@mcp.prompt装饰函数，返回Prompt（可选）

- 使用mcp.run()启动MCP服务

