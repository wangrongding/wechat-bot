# Pi Agent + IM 使用说明

[English](./pi-im-agent.md) | 简体中文

这份文档说明如何把当前项目作为 Pi agent 的运行壳，用 IM 作为外部通信渠道。

## 目标链路

```text
外部 IM 消息 -> wechat-bot -> Pi agent -> IM 回复
```

当前已实现：

- 微信 IM：扫码登录后接收/回复消息。
- Pi agent：作为 `serve` 类型处理微信、飞书、Telegram 和 WhatsApp 消息。
- 本地微信数据：通过 OpenCLI `wx-cli` 访问聊天、群成员、统计和朋友圈缓存。
- 飞书 IM：通过 `lark-cli` 登录、发消息、读消息、搜索消息和消费消息事件。
- Telegram IM：通过 Bot API long polling 接收消息，并通过 Bot API 发送回复。
- WhatsApp IM：通过 WhatsApp Cloud API webhook 接收消息，并通过 Cloud API 发送回复。

## 安装命令

如果希望直接使用 `wb` 命令，在项目根目录执行：

```sh
npm link
```

也可以不用 `wb`，直接使用：

```sh
npm run start -- <command>
```

## 环境配置

复制并编辑 `.env`：

```sh
cp .env.example .env
```

微信 + Pi 推荐配置：

```env
BOT_NAME='@你的微信昵称'
ALIAS_WHITELIST='允许私聊你的好友备注'
ROOM_WHITELIST='允许接入的群名'
AUTO_REPLY_PREFIX=''

WECHAT_DATA_DIR='.data/wechat'
WECHAT_STORE_MESSAGES='true'

PI_BIN='pi'
PI_NPM_PACKAGE='@earendil-works/pi-coding-agent'
PI_AGENT_ARGS='--print --no-session'
```

如果本机没有全局 `pi` 命令，可以先留空：

```env
PI_BIN=''
```

项目会通过 `npx --yes @earendil-works/pi-coding-agent` 调起 Pi，但每次冷启动会慢一些。

## 微信扫码接入 Pi

推荐命令：

```sh
wb agent --im wechat --agent pi
```

等价命令：

```sh
wb start --serve pi
```

或使用 npm：

```sh
npm run agent
npm run start -- start --serve pi
```

启动后终端会展示微信二维码。扫码登录成功后，链路如下：

```text
微信扫码登录 -> Wechaty 收消息 -> 本地 JSONL 捕获 -> Pi 单轮 agent 回复 -> 微信 IM 发回
```

触发规则：

- 私聊：发消息人必须在 `ALIAS_WHITELIST` 中。
- 群聊：群名必须在 `ROOM_WHITELIST` 中，并且消息里需要 `@机器人昵称`。
- 非文本消息不会进入 Pi 回复链路。

## 微信内置分析命令

微信聊天中可以直接发命令：

```text
/统计 群 XX群1
/分析 群 XX群1
/统计 好友 好友备注
/分析 好友 好友备注
```

说明：

- `/统计` 只读取本地 JSONL，不调用 AI。
- `/分析` 会调用当前 agent 或 AI 服务，并把最近消息样本发给模型。
- 隐私聊天建议优先使用本地模型或本地 Pi 配置。

## 本地微信数据与朋友圈

OpenCLI 的 `wx-cli` 可访问本机微信缓存数据：

```sh
wb wx init
wb wx sessions
wb wx history
wb wx search
wb wx contacts
wb wx members
wb wx stats
wb wx favorites
wb wx sns-feed
wb wx sns-search
wb wx sns-notifications
```

首次使用先执行：

```sh
wb wx init
```

查看 `wx-cli` 支持的完整命令：

```sh
wb wx help
```

## 飞书 IM

飞书可登录、读写、搜索消息，也可以启动事件驱动 agent：

```sh
wb lark login --no-wait
wb lark status
wb lark messages --chat-id oc_xxx
wb lark search --query "关键词"
wb lark send --chat-id oc_xxx --text "hello"
```

`--no-wait` 会返回 device-flow 授权链接/扫码信息。你完成授权后，再运行读写命令。

要让 Pi 回复飞书消息，配置事件 agent：

```env
LARK_AGENT_IDENTITY='bot'
LARK_AGENT_EVENT_KEY='im.message.receive_v1'
LARK_AGENT_CHAT_TYPES='p2p,group'
LARK_AGENT_MESSAGE_TYPES='text,post'
LARK_AGENT_CHAT_WHITELIST=''
LARK_AGENT_USER_WHITELIST=''
LARK_AGENT_REPLY_PREFIX=''
LARK_AGENT_GROUP_MENTION_NAME=''
LARK_AGENT_GROUP_AUTO_REPLY='false'
```

启动：

```sh
wb agent --im lark --agent pi
# 或
wb lark agent --agent pi
```

飞书 agent 通过 `lark-cli event consume` 消费 `im.message.receive_v1`。私聊默认回复；如果配置 chat 或 user 白名单，则只回复白名单。群聊需要配置 `LARK_AGENT_CHAT_WHITELIST`，并命中回复前缀、群提及名，或显式设置 `LARK_AGENT_GROUP_AUTO_REPLY=true`。

使用这条链路前，需要在飞书开发者后台启用 `im.message.receive_v1` 事件，并确认应用已开通所需 IM 权限。

## Telegram IM

Telegram 使用 Bot API long polling：

```env
TELEGRAM_BOT_TOKEN='123456:bot-token'
TELEGRAM_AGENT_CHAT_WHITELIST=''
TELEGRAM_AGENT_USER_WHITELIST=''
TELEGRAM_AGENT_REPLY_PREFIX=''
TELEGRAM_AGENT_GROUP_MENTION_NAME='@your_bot'
TELEGRAM_AGENT_GROUP_AUTO_REPLY='false'
```

启动：

```sh
wb agent --im telegram --agent pi
wb telegram agent --agent pi
```

私聊默认回复。群聊需要配置 chat 白名单，并命中回复前缀、机器人提及名，或显式设置 `TELEGRAM_AGENT_GROUP_AUTO_REPLY=true`。

## WhatsApp IM

WhatsApp 使用官方 Cloud API，通过 webhook 接收消息：

```env
WHATSAPP_ACCESS_TOKEN='your access token'
WHATSAPP_PHONE_NUMBER_ID='your phone_number_id'
WHATSAPP_VERIFY_TOKEN='your webhook verify token'
WHATSAPP_WEBHOOK_PORT='3000'
WHATSAPP_WEBHOOK_PATH='/webhook/whatsapp'
WHATSAPP_AGENT_REPLY_PREFIX=''
```

启动：

```sh
wb agent --im whatsapp --agent pi
wb whatsapp agent --agent pi
```

在 Meta 后台把 webhook callback URL 配置为公开 HTTPS 地址，例如 `https://your-public-domain.example/webhook/whatsapp`，verify token 和 `WHATSAPP_VERIFY_TOKEN` 保持一致。

## Pi 透传命令

直接调用 Pi：

```sh
wb pi -- --help
wb pi -- --print "分析当前项目结构"
```

`PI_AGENT_ARGS` 控制 Pi 作为 IM 回复 agent 时的参数。默认：

```env
PI_AGENT_ARGS='--print --no-session'
```

这表示每条 IM 消息都是单轮非交互回复。如果希望沿用会话，可以去掉 `--no-session`，但要注意上下文和隐私数据会被 Pi session 保存。

## 常见问题

### 扫码后没有回复

检查：

- 私聊好友备注是否在 `ALIAS_WHITELIST`。
- 群名是否在 `ROOM_WHITELIST`。
- 群聊是否真的 `@` 了 `BOT_NAME`。
- `.env` 中 `BOT_NAME` 是否形如 `@你的微信昵称`。
- 当前消息是否为文本消息。

### Pi 回复慢

建议配置本机 Pi：

```env
PI_BIN='pi'
```

如果留空，项目会通过 `npx` 调起 Pi，首次执行和冷启动都会更慢。

### 如何只分析，不自动回复

使用命令行：

```sh
wb analyze --room "群名" --stats-only
wb analyze --friend "好友备注" --stats-only
```

或调用 AI 深度分析：

```sh
wb analyze --room "群名" --serve pi
```

### 安全边界

- 项目只处理本机已登录账号可见的数据。
- 微信自动回复受白名单控制。
- OpenCLI 远程执行默认关闭。
- `/分析` 会把消息样本交给当前模型或 agent，处理隐私数据前请确认模型运行位置和配置。

## Pi 回复中的网页搜索

全新的 Pi agent 配置会自动加载 [Parallel Search MCP](https://docs.parallel.ai/integrations/mcp/search-mcp)，提供免费的网页搜索和页面读取，无需搜索服务账号或 API key。搜索使用 Fast 模式。需要 Pi 1.3.0 或更新版本，以及 Pi 支持的 Node.js 版本（22.19+）。Pi 根据用户问题决定是否调用工具。

```env
# auto（默认）、parallel（明确启用）或 off
PI_WEB_SEARCH='auto'
```

`auto` 保留已有的 Pi MCP、扩展、包、工具设置、搜索凭据、自定义程序和 `PI_AGENT_ARGS`。只有模型设置时仍可自动启用。已有自定义配置时，可设置 `PI_WEB_SEARCH='parallel'` 来添加 Parallel。Pi 的 `mcp.json` 中名为 `parallel` 的配置优先，包括 `enabled: false` 和带认证的地址；不会覆盖配置文件，也不会在明确选择的服务失败时自动切换。

设置 `PI_WEB_SEARCH='off'` 可关闭内置集成。即使选择 `parallel`，也会遵守 `--tools`、`--exclude-tools`、`--no-tools`、`--no-mcp`、`--no-extensions` 等限制。`wb pi` 透传命令的行为保持不变。

调用工具时，搜索查询和所请求的 URL 会发送给 Parallel。处理必须留在本地的私密聊天分析时，请关闭网页工具。匿名服务有使用额度限制，错误通过 Pi MCP 工具报告。Pi 管理传输、取消和 30 秒请求超时。旧版 Pi 仍可回复，但会在 stderr 中提示更新以使用网页搜索。
