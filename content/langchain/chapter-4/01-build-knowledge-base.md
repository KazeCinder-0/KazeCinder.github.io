---
title: "第1节构建知识库"
category: "langchain"
chapter: "第四章"
date: "2026-06-10"
---
# 第1节. 构建知识库



RAG（Retrieval-Augmented Generation，检索增强生成）是LangChain的核心应用场景之一。它通过从外部知识库检索相关信息来增强LLM的回答质量。

一个完整的RAG流程分为两大部分：

- 知识库构建：加载文档 → 切分文本 → 向量化 → 存入向量库

- 检索生成：用户提问 → 向量化 → 检索相关文档 → 拼接上下文 → 生成回答

本章聚焦《知识库构建》部分。

知识库构建的完整流程如图：


## 文档加载（Document Loaders）



企业真实业务场景中，需要加载的文档类型多种多样，例如：

- PDF

- Word

- Text

- CSV

- Html

- ...

这些不同来源的数据格式、文档结构存在很大的差异，更离谱的是PDF文档中还有很多的扫描件。而RAG系统更擅长的是处理普通文本，因此不管是哪种文档来源，都需要经过处理变成普通文本才能存入向量库。

但是，如此多不同种类的文档，我们该如何处理呢？

LangChain提供了丰富的文档加载器（Document Loaders），支持从各种来源加载文档，例如：

- Webpages: 将网页内容加载为Document，例如WebBaseLoader

- PDFs: 将PDF文件加载为Document，例如PyPDF

- CommonFiles: 各种常见文件类型加载为Document，例如TextLoader、CSVLoader

- Social platforms: 从社交媒体加载文档，例如Twitter、Reddit

- Messaging services: 从消息平台加载文档，例如Telegram、WhatsApp、Discord

- Productivity tools: 从常用的生产力工具中加载文档，例如Figma、Github、Slack

更多文档加载器参考LangChain官网：https://docs.langchain.com/oss/python/integrations/document_loaders#all-document-loaders

虽然加载器各不相同，但都实现了BaseLoader接口，因此都具有两个通用方法：

- load() : 一次性加载所有文档

- lazy_load() : 基于流式传输懒加载文档，适用于大数据集

所有加载器都将原始数据转换为统一的 Document 对象，包含：

- page_content: 文档内容

- metadata: 元数据（如来源、页码等）

接下来，我们就看几个比较常见的加载器。


### TextLoader



TextLoader是社区提供的加载器，作用是加载普通的txt文件，这也是最常见的一种文本文件类型，格式简单，没什么好说的，直接看代码。

示例代码：

```Python
from langchain_community.document_loaders import TextLoader


# 创建示例文本文件


with open("resources/sample.txt", "w", encoding="utf-8") as f:
    f.write("LangChain是用于构建LLM应用的框架。\\n")
    f.write("LangGraph是LangChain的图结构编排库。\\n")
    f.write("LangSmith是调试监控平台。\\n")


# 加载文本文件


loader = TextLoader("resources/sample.txt", encoding="utf-8")
docs = loader.load()

print(f"加载了 {len(docs)} 个文档")
print(f"内容: {docs[0].page_content}")
print(f"元数据: {docs[0].metadata}")
```


### WebBaseLoader



WebBaseLoader同样是社区提供的加载器，只要给一个url地址，它就能自动读取网页内容，去掉无用的Html、CSS、JS元素，只保留普通文本数据。

示例：

```Python
from langchain_community.document_loaders import WebBaseLoader


# 加载网页内容


loader = WebBaseLoader(
    web_paths=["https://docs.langchain.com/oss/python/langchain/rag"],
)
docs = loader.load()

print(f"加载了 {len(docs)} 个文档")
print(f"来源: {docs[0].metadata.get('source', 'unknown')}")
print(f"内容长度: {len(docs[0].page_content)} 字符")
print(f"内容预览: {docs[0].page_content[:200]}...")
```


### CSVLoader



CSVLoader也是社区提供的加载器，它可以加载csv格式的文件，示例代码：

```Python
from langchain_community.document_loaders.csv_loader import CSVLoader


# 创建示例CSV文件


import csv
with open("resources/sample.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["name", "description", "category"])
    writer.writerow(["LangChain", "LLM应用开发框架", "AI框架"])
    writer.writerow(["LangGraph", "图结构编排库", "AI框架"])
    writer.writerow(["LangSmith", "调试监控平台", "AI工具"])


# 加载CSV文件


loader = CSVLoader(
    file_path="resources/sample.csv",
    source_column="name",  # 用name列作为source
    encoding="utf-8"
)
docs = loader.load()

print(f"加载了 {len(docs)} 行数据")
for doc in docs:
    print(f"  [{doc.metadata.get('source', '?')}] {doc.page_content[:100]}")
```


### PyPDFLoader



PyPDFLoader顾名思义，是加载PDF文件的加载器，依赖于pypdf，所以需要先安装：

Python
uv add pypdf


PyPDFLoader支持两种模式：

- single：整个文档作为一个Document，但是可以自定义文档页与页之间的分隔符

- page：每页作为一个Document

示例：

```Python
from langchain_community.document_loaders import PyPDFLoader


# 加载PDF文件（每页作为一个Document）


loader = PyPDFLoader(
    "resources/sample.pdf",
    mode="single", # single \\ page
    pages_delimiter="\n-------THIS IS A CUSTOM END OF PAGE-------\n" # 自定义页分隔符，可选
)
docs = loader.load()

print(f"加载了 {len(docs)} 页")
print("-"*50)
print(f"第1页内容: {docs[0].page_content[:15800]}...")
print("-"*50)
print(f"元数据: {docs[0].metadata}")  # 包含 source, page 等信息
```


### 复杂文本加载工具



某些行业的PDF文件结构非常复杂，可能包含：左右分栏、复杂表格、图文混排、图片扫描件等情况。

针对这样的PDF文件就需要用到诸如：文档结构识别模型、多模态模型、表格处理、OCR等专用工具，非常复杂。

好在市面上已经有很多专业的工具，帮我们实现了这些功能。


#### PDF处理高级工具



常见的复杂PDF处理工具有：

总结一下，对于商业友好的开源产品有三款：

- Docling

- MinerU

- Unstructured

这三款中，文档处理能力最强的有两个：

- Docling

- MinerU

而这两个里，MinerU是国人开发，不管是处理速度还是精度都非常优秀。推荐使用。

另外，需要说明的是，无论是MinerU还是Docling都是可以本地部署使用的，要追求最佳性能需要本地GPU加速、部署本地视觉模型、OCR、Cuda工具。对于数据隐私要求较高的用户，可以选择本地部署。

MinerU提供了公共的API服务、桌面客户端、SDK等工具，每天可以免费处理5000个不超过200页的文档，小于20页的文档则不限数量。如果对数据隐私要求不高，而且希望降低运维成本的企业非常友好。

接下来我们就以MinerU为例来看看这种高级工具的PDF处理能力。


#### 注册MinerU



MinerU的公共API服务提供两种模式：

- 🎯 精准解析 API — 需申请 Token，支持单文件/批量、表格/公式/多格式输出，限制页数<=200

- ⚡ Agent 轻量解析 API — 免登录，IP 限频防滥用，专为 AI Agent 工作流设计，限制页数<=20

如果要使用精准解析模式，就必须注册账号，开通API Token，不过不用担心，并不需要收费~嘿嘿

注册地址：https://mineru.net/


#### 使用MinerU



MinerU的API是基于Http协议，理论上我们可以直接基于Http请求调用。不过，这样做太麻烦了。

MinerU还提供了多种不同的访问API接口的方式，例如：

- 基于Skills和MCP

- 基于CLI

- 基于SDK，支持Python、JS、TS、GO

- 基于RAG框架，支持LangChain、Dify、RAGFlow、LlamaIndex等

- ...

详见官方文档：https://mineru.net/ecosystem?tab=cli

这里重点说两种：

- SDK : 原生SDK，兼容性最好，可以自由的处理MinerU解析好的markdown、images、json

- LangChain : 完美适配LangChain，但解析PDF时只能得到markdown，其它内容无法获取

MinerU的其它用法可以参考官方教学文档：

MinerU的本地部署可以参考官方教学文档：


##### 基于SDK



首先来说SDK方式，我们先安装依赖：

Plain Text
uv add mineru-kie-sdk


然后就可以使用了：

- Flash模式：

```Python
from mineru import MinerU
import os


# Flash 模式，无需Token


# 创建客户端


client = MinerU()


# 解析文件


result = client.flash_extract("./resources/sample.pdf")


# 输出到本地


result.save_markdown("./resources/output/r1.md")


- Precision模式：


Python


# Precision模式，需要Token ，可以到官网申请 https://mineru.net


# 创建客户端


client = MinerU(os.getenv("MINERU_TOKEN"))


# 解析文件，支持各种自定义参数，例如：language、ocr、


result = client.extract("https://cdn-mineru.openxlab.org.cn/demo/example.pdf")


# 输出到本地


result.save_markdown("./resources/output/r2.md", True)
```


##### 基于LangChain



基于SDK方式虽然可以读取到图片，但输出格式只是普通文本。如果你的项目是基于LangChain，后续就需要我们自己把markdown封装为LangChain的Document.

所以，如果你的PDF不包含图片，或者图片中不包含重要信息，完全可以直接使用MinerU官方提供的LangChain版本SDK，解析完成后直接得到LangChain的Document对象。

首先，同样是安装依赖：

Plain Text
uv add langchain-mineru

