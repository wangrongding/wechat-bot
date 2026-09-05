# WeChat Bot

[English](./README.md) | 简体中文

一个基于 `Wechaty` 的微信 / IM agent 项目。

它可以把微信扫码登录、飞书 IM 事件、Telegram Bot API 轮询或 WhatsApp Cloud API webhook 收到的消息交给 ChatGPT、DeepSeek、Ollama、Claude、Pi 等服务处理；也可以通过 OpenCLI 的 `wx-cli` 访问本机微信聊天、联系人、群成员、收藏、朋友圈缓存，并对群聊或某个好友做统计和分析。

如果你希望把 Pi 作为本项目的 agent，用微信、飞书、Telegram 或 WhatsApp 作为外部通信渠道，直接看：[Pi Agent + IM 使用说明](./docs/pi-im-agent.zh-CN.md)。

<!-- ad-slot:autoclaw:start -->

## 赞助商

<div align="center">
  <a href="https://autoclaw.zhipuai.cn/?utm_source=github&utm_medium=readme&utm_campaign=wechat-bot">
    <img src="./sponsors/autoclaw.png" alt="智谱 AutoClaw" width="48" />
  </a>
  <p>
    <a href="https://autoclaw.zhipuai.cn/?utm_source=github&utm_medium=readme&utm_campaign=wechat-bot"><b>智谱 AutoClaw</b></a> · 替你干活的 AI 搭档，一键接入飞书 / 企业微信 / 微信<br />
  </p>
</div>

<!-- ad-slot:autoclaw:end -->

## 能力概览

| 能力                           | 命令入口                                                             | 当前状态                               |
| ------------------------------ | -------------------------------------------------------------------- | -------------------------------------- |
| 微信扫码 IM                    | `wb agent --im wechat --agent pi` / `wb start --serve pi`            | 已接入，可扫码登录并回复白名单消息     |
| Pi 作为项目 agent              | `wb agent --im wechat/lark/telegram/whatsapp --agent pi`             | 已接入，默认单轮非交互回复             |
| 本地微信聊天 / 联系人 / 群成员 | `wb wx sessions`、`wb wx history`、`wb wx members`                   | 通过 OpenCLI `wx-cli` 接入             |
| 本地朋友圈缓存                 | `wb wx sns-feed`、`wb wx sns-search`                                 | 通过 OpenCLI `wx-cli` 接入             |
| 群 / 好友分析                  | `wb analyze --room "群名"`、`wb analyze --friend "好友备注"`         | 支持本地统计和 AI 深度分析             |
| 飞书 IM                        | `wb lark login`、`wb lark messages`、`wb lark send`、`wb lark agent` | 支持登录、读、搜、发和事件驱动自动回复 |
| Telegram IM                    | `wb telegram agent`、`wb telegram send`                              | 支持 Bot API 轮询接收和发送            |
| WhatsApp IM                    | `wb whatsapp agent`、`wb whatsapp send`                              | 支持 WhatsApp Cloud API webhook 收发   |
| 多模型回复                     | `--serve ChatGPT/deepseek/ollama/pi/...`                             | 复用现有 provider 机制                 |

## 快速开始：Pi + 微信 IM

```sh
npm i
cp .env.example .env
npm link
```

在 `.env` 中至少配置：

```env
BOT_NAME='@你的微信昵称'
ALIAS_WHITELIST='允许私聊你的好友备注'
ROOM_WHITELIST='允许接入的群名'

PI_BIN='pi'
PI_AGENT_ARGS='--print --no-session'
WECHAT_STORE_MESSAGES='true'
```

启动：

```sh
wb agent --im wechat --agent pi
```

终端出现二维码后，用微信扫码。消息链路是：

```text
微信扫码登录 -> Wechaty 收消息 -> 本地 JSONL 捕获 -> Pi agent 回复 -> 微信 IM 发回
```

触发规则：

- 私聊：好友备注或昵称需要在 `ALIAS_WHITELIST`。
- 群聊：群名需要在 `ROOM_WHITELIST`，并且消息里需要 `@BOT_NAME`。
- 非文本消息不会自动进入回复链路。

> 注意：微信 Web 协议存在风控和封号风险。请只在你明确接受风险的账号和场景中使用，优先控制白名单和使用范围。

<div align='center'>
  <a href="https://trendshift.io/repositories/11077" target="_blank"><img src="https://trendshift.io/api/badge/repositories/11077" alt="wangrongding%2Fwechat-bot | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>
</div>

## 贡献者们

<a href="https://github.com/wangrongding/wechat-bot/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=wangrongding/wechat-bot&columns=20" />
</a>

欢迎大家提交 PR 接入更多的 ai 服务(比如扣子等...)，积极贡献更好的功能实现，让 wechat-bot 变得更强！

## 注意：最近微信对此审查变得非常严格，使用默认的协议有微信警告或者封号的风险，请大家谨慎使用，关于 padlocal ，这个协议的作者没有继续维护，大家可以自行切换更稳定的协议。

![](https://github.com/user-attachments/assets/1c312cf4-73d8-44a1-8f36-5ea288ac0aa4)

## 支持的回复 / Agent 服务

如果只使用 `wb wx ...` 访问本地微信数据，或只使用 `wb lark ...` 操作飞书 IM，可以不配置大模型。

如果要让微信消息自动回复，或执行 `wb analyze` 深度分析，需要选择一个 `--serve` 服务。当前可选：`ChatGPT`、`doubao`、`deepseek`、`Kimi`、`Xunfei`、`deepseek-free`、`302AI`、`dify`、`ollama`、`tongyi`、`claude`、`pi`。

- pi

  Pi 适合作为项目 agent 使用，可通过微信、飞书、Telegram 或 WhatsApp IM 对外通信：

  ```env
  PI_BIN='pi'
  PI_NPM_PACKAGE='@earendil-works/pi-coding-agent'
  PI_AGENT_ARGS='--print --no-session'
  ```

  如果本机没有全局 `pi` 命令，可以先把 `PI_BIN` 留空，项目会通过 `npx --yes @earendil-works/pi-coding-agent` 调起 Pi。

- deepseek

  获取自己的 `api key`，地址戳这里 👉🏻 ：[deepseek 开放平台](https://platform.deepseek.com/usage) 将获取到的`api key`填入 `.evn` 文件中的 `DEEPSEEK_FREE_TOKEN` 中。

- ChatGPT

  先获取自己的 `api key`，地址戳这里 👉🏻 ：[创建你的 api key](https://platform.openai.com/settings/organization/api-keys)

  **注意：这个是需要去付费购买的，很多人过来问为什么请求不通，请确保终端走了代理，并且付费购买了它的服务**

  ```sh
  # 执行下面命令，拷贝一份 .env.example 文件为 .env
  cp .env.example .env
  # 填写完善 .env 文件中的内容
  OPENAI_API_KEY='你的key'
  ```

- 豆包

  豆包最新的Doubao-Seed-1.6模型，支持输入图片和深度思考，而且每个模型都有 50 万的免费tokens。在火山引擎注册登录账号，可以选择最新的Doubao-Seed-1.6-thinking模型，选择“API接入” -> “获取 API Key”。

  ```sh
  # 拷贝 .env.example 文件为 .env
  cp .env.example .env
  # 修改 .env 文件中的内容
  DOUBAO_API_KEY='你的key'
  # 简单测试API是否可用
  node src/doubao/__test__.js
  ```

- 通义千问

  通义千问是阿里云提供的 AI 服务，获取到你的 api key 之后, 填写到 .env 文件中即可

  ```sh
  # 执行下面命令，拷贝一份 .env.example 文件为 .env
  cp .env.example .env
  # 填写完善 .env 文件中的内容
  # 通义千问, URL 包含 uri 路径
  TONGYI_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
  # 通义千问的 API_KEY
  TONGYI_API_KEY = ''
  # 通义千问使用的模型
  TONGYI_MODEL='qwen-plus'
  ```

- 科大讯飞

  新增科大讯飞，去这里申请一个 key：[科大讯飞](https://console.xfyun.cn/services/bm35)，每个模型都有 200 万的免费 token ，感觉很难用完。注意： 讯飞的配置文件几个 key，别填反了，很多人找到我说为什么不回复，都是填反了。而且还有一个好处就是，接口不会像 Kimi 一样限制请求频次，相对来说稳定很多。服务出错可参考： [issues/170](https://github.com/wangrongding/wechat-bot/issues/170), [issues/180](https://github.com/wangrongding/wechat-bot/issues/180)

- Kimi （请求限制较严重）

  可以去 ： [kimi apikey](https://platform.moonshot.cn/console/api-keys) 获取你的 key 最近比较忙，大家感兴趣可以提交 PR，我会尽快合并。目前 Kimi 刚刚集成，还可以实现上传文件等功能，然后有其它较好的服务也可以提交 PR 。

- dify

  地址：[dify](https://dify.ai/), 创建你的应用之后, 获取到你的 api key 之后, 填写到 .env 文件中即可, 也支持私有化部署dify版本

  ```sh
  # 执行下面命令，拷贝一份 .env.example 文件为 .env
  cp .env.example .env
  # 填写完善 .env 文件中的内容
  DIFY_API_KEY='你的key'
  # 如果需要私有化部署，请修改.env中下面的配置
  # DIFY_URL='https://[你的私有化部署地址]'
  ```

- ollama

  Ollama 是一个本地化的 AI 服务，它的 API 与 OpenAI 非常接近。配置 Ollama 的过程与各种在线服务略有不同

  ```sh
  # 执行下面命令，拷贝一份 .env.example 文件为 .env
  cp .env.example .env
  # 填写完善 .env 文件中的内容
  OLLAMA_URL='http://127.0.0.1:11434/api/chat'
  OLLAMA_MODEL='qwen2.5:7b'
  OLLAMA_SYSTEM_MESSAGE='You are a personal assistant.'
  ```

- 302.AI

  AI聚合平台，有套壳GPT的API，也有其他模型，点这里可以[添加API](https://dash.302.ai/apis/list)，添加之后把API KEY配置到.env里，如下，MODEL可以自行选择配置

  ```
  _302AI_API_KEY = 'xxxx'
  _302AI_MODEL= 'gpt-4o-mini'
  ```

  由于openai充值需要国外信用卡，流程比较繁琐，大多需要搞国外虚拟卡，手续费也都不少，该平台可以直接支付宝，算是比较省事的，注册填问卷可领1刀额度，后续充值也有手续费，用户可自行酌情选择。

- atlascloud

  [Atlas Cloud](https://www.atlascloud.ai/) 是 OpenAI 兼容的推理平台，提供 DeepSeek、GLM、Kimi、Qwen、MiniMax 等模型。在[控制台](https://www.atlascloud.ai/console)获取 api key 后配置：

  ```env
  ATLASCLOUD_API_KEY = 'xxxx'
  # 可选，默认 https://api.atlascloud.ai/v1
  ATLASCLOUD_URL = 'https://api.atlascloud.ai/v1'
  # 可选，默认 deepseek-ai/deepseek-v4-pro
  ATLASCLOUD_MODEL = 'deepseek-ai/deepseek-v4-pro'
  ```

- claude

  前往 [官网](https://console.anthropic.com) 注册并获取API KEY后进行配置即可

  ```bash
  # 执行下面命令，拷贝一份 .env.example 文件为 .env，如果已存在则忽略此步
  cp .env.example .env

  # 编辑.env文件并添加claude相关配置

  CLAUDE_API_VERSION = '2023-06-01'
  CLAUDE_API_KEY = '你的API KEY'
  CLAUDE_MODEL = 'claude-3-5-sonnet-latest'
  # 系统人设
  CLAUDE_SYSTEM = ''
  ```

- 其他（待实践）理论上使用 openAI 格式的 api，都可以使用，在 env 文件中修改对应的 api_key、model、proxy_url 即可。

## API资源/平台收录

- [gpt4free](https://github.com/xtekky/gpt4free)
- [chatanywhere](https://github.com/chatanywhere/GPT_API_free)

## 开发/使用

检查好自己的开发环境，确保已经安装了 `nodejs` , 版本需要满足 Node.js >= v18.0 ，版本太低会导致运行报错,最好使用 LTS 版本。

### 1. 安装依赖

> 安装依赖时，大陆的朋友推荐切到 taobao 镜像源后再安装，命令： `npm config set registry https://registry.npmmirror.com` 想要灵活切换，推荐使用我的工具 👉🏻 [prm-cli](https://github.com/wangrongding/prm-cli) 快速切换。

```sh
npm i

# 可选：把 wb 注册成本机命令
npm link
```

如果不想执行 `npm link`，下文所有 `wb ...` 都可以替换为：

```sh
npm run start -- ...
```

### 2. 配置 `.env`

```sh
cp .env.example .env
```

最小可用配置：

```env
BOT_NAME='@你的微信昵称'
ALIAS_WHITELIST='好友备注1,好友昵称2'
ROOM_WHITELIST='群名1,群名2'
AUTO_REPLY_PREFIX=''

WECHAT_DATA_DIR='.data/wechat'
WECHAT_STORE_MESSAGES='true'

PI_BIN='pi'
PI_AGENT_ARGS='--print --no-session'
```

### 3. 启动微信 IM

Pi agent 模式：

```sh
wb agent --im wechat --agent pi
```

等价写法：

```sh
wb start --serve pi
npm run agent
npm run start -- start --serve pi
```

传统模型回复模式：

```sh
wb start --serve ollama
wb start --serve ChatGPT
wb start --serve deepseek
```

启动后终端会展示二维码，扫码即可登录微信。登录后，收到的微信消息会追加写入：

```text
.data/wechat/messages.jsonl
```

### 4. 本地微信数据和朋友圈

OpenCLI 的 `wx-cli` 会被 `wb wx ...` 透传调用，用于访问本机微信缓存：

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
wb wx help
```

常用场景：

```sh
# 初始化本地微信数据访问
wb wx init

# 查看最近会话和聊天记录
wb wx sessions
wb wx history

# 查看群成员和聊天统计
wb wx members
wb wx stats

# 查看朋友圈缓存和朋友圈全文搜索
wb wx sns-feed
wb wx sns-search
```

### 5. 群聊 / 好友分析

命令行分析：

```sh
# 只做本地统计，不调用 AI
wb analyze --room "群名" --stats-only
wb analyze --friend "好友备注" --stats-only

# 调用指定服务做深度分析
wb analyze --room "群名" --serve pi
wb analyze --friend "好友备注" --serve ollama
```

微信聊天中的内置命令默认只对联系人白名单或群聊白名单生效：

```text
/统计 群 XX群1
/分析 好友 好友备注
```

`/统计` 只读本地 JSONL，不调用 AI；`/分析` 会把最近消息样本交给当前 `serve` 服务或 agent。处理隐私聊天时，建议优先使用本地模型或本地 Pi 配置。

### 6. 飞书 IM

飞书 IM 通过 `lark-cli` 接入：

```sh
# 生成 device-flow 授权链接/扫码信息
wb lark login --no-wait

# 查看授权状态
wb lark status

# 读取 / 搜索 / 发送消息
wb lark messages --chat-id oc_xxx
wb lark search --query "关键词"
wb lark send --chat-id oc_xxx --text "hello"
```

如果要让 Pi 或其他 provider 通过飞书事件流自动回复，配置：

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

飞书事件链路使用 `lark-cli event consume im.message.receive_v1 --as bot`。私聊默认回复；如果配置了 chat 或 user 白名单，则只回复白名单。群聊需要配置 `LARK_AGENT_CHAT_WHITELIST`，并命中 `LARK_AGENT_REPLY_PREFIX`、`LARK_AGENT_GROUP_MENTION_NAME` 或显式设置 `LARK_AGENT_GROUP_AUTO_REPLY=true`。

使用事件回复前，请确认飞书应用已在开发者后台启用 `im.message.receive_v1` 事件，并开通所需 IM 权限。

### 7. Telegram Bot API

Telegram 使用官方 Bot API long polling：

```env
TELEGRAM_BOT_TOKEN='123456:bot-token'
TELEGRAM_AGENT_CHAT_TYPES='private,group,supergroup'
TELEGRAM_AGENT_CHAT_WHITELIST=''
TELEGRAM_AGENT_USER_WHITELIST=''
TELEGRAM_AGENT_REPLY_PREFIX=''
TELEGRAM_AGENT_GROUP_MENTION_NAME='@your_bot'
TELEGRAM_AGENT_GROUP_AUTO_REPLY='false'
```

启动：

```sh
wb agent --im telegram --agent pi
# 或
wb telegram agent --agent pi
```

私聊默认回复；如果配置了 chat 或 user 白名单，则只回复白名单。群聊和超级群需要配置 chat 白名单，并命中回复前缀、机器人提及名，或显式设置 `TELEGRAM_AGENT_GROUP_AUTO_REPLY=true`。

可以发送测试消息：

```sh
wb telegram send --chat-id 123456 --text "hello"
```

### 8. WhatsApp Cloud API

WhatsApp 使用官方 Cloud API。接收消息需要 webhook，所以本地服务必须通过公开 HTTPS URL 暴露给 Meta。

```env
WHATSAPP_ACCESS_TOKEN='your access token'
WHATSAPP_PHONE_NUMBER_ID='your phone_number_id'
WHATSAPP_VERIFY_TOKEN='your webhook verify token'
WHATSAPP_GRAPH_API_VERSION='v23.0'
WHATSAPP_WEBHOOK_PORT='3000'
WHATSAPP_WEBHOOK_PATH='/webhook/whatsapp'
WHATSAPP_AGENT_REPLY_PREFIX=''
```

启动 webhook server：

```sh
wb agent --im whatsapp --agent pi
# 或
wb whatsapp agent --agent pi
```

在 Meta 后台配置 webhook callback URL：

```text
https://your-public-domain.example/webhook/whatsapp
```

Meta webhook 验证表单里的 verify token 要和 `WHATSAPP_VERIFY_TOKEN` 保持一致。WhatsApp 默认只回复收到的文本消息。

可以发送测试消息：

```sh
wb whatsapp send --to 15551234567 --text "hello"
```

### 9. Pi / OpenCLI 透传

```sh
wb pi -- --help
wb pi -- --print "分析当前项目结构"

wb opencli -- --help
wb opencli -- wx-cli help
```

### 10. 测试

```sh
npm run test:analysis
node ./cli.js --help
node ./cli.js wx help
node ./cli.js pi -- --help
```

如果使用 OpenAI、Claude、Kimi 等云端服务，请确保对应 API Key、余额和网络代理可用。

## 你要修改的

很多人说运行后不会自动收发信息，不是的哈，为了防止给每一条收到的消息都自动回复（太恐怖了），所以加了限制条件。

你要把下面提到的地方自定义修改下：

- `BOT_NAME`：改成你启动机器人账号的微信昵称，格式类似 `@可乐`。
- `ALIAS_WHITELIST`：允许自动回复的好友备注或昵称。
- `ROOM_WHITELIST`：允许自动回复的群聊名称。
- `AUTO_REPLY_PREFIX`：可选，只有匹配指定前缀才自动回复。
- `PI_AGENT_ARGS`：Pi 作为 IM agent 时的参数，默认是 `--print --no-session`。
- 更深入的业务逻辑可以看 `src/wechaty/sendMessage.js` 和 `src/platforms/wechat/commandRouter.js`。

在.env 文件中修改你的配置即可，示例如下

```sh
# 白名单配置
#定义机器人的名称，这里是为了防止群聊消息太多，所以只有艾特机器人才会回复，
#这里不要把@去掉，在@后面加上你启动机器人账号的微信名称
BOT_NAME=@可乐
#联系人白名单
ALIAS_WHITELIST=微信名1,备注名2
#群聊白名单
ROOM_WHITELIST=XX群1,群2
#自动回复前缀匹配，文本消息匹配到指定前缀时，才会触发自动回复，不配或配空串情况下该配置不生效（适用于用大号，不期望每次被@或者私聊时都触发自动回复的人群）
#匹配规则：群聊消息去掉${BOT_NAME}并trim后进行前缀匹配，私聊消息trim后直接进行前缀匹配
AUTO_REPLY_PREFIX=''

# Pi agent
PI_BIN='pi'
PI_AGENT_ARGS='--print --no-session'
```

自动回复不再只限于 `chatgpt`，可以通过 `--serve` 选择不同服务，例如 `pi`、`ollama`、`deepseek`、`claude`、`ChatGPT`。

![](https://github.com/user-attachments/assets/1c312cf4-73d8-44a1-8f36-5ea288ac0aa4)

## 注意项

近期微信审查很严格，大量用户反映弹出外挂警告，由于项目内默认使用的是免费版的 web 协议，所以目前来说很容易会被微信检测到，建议使用 pad 协议，或者自行购买企业版协议，避免被封号。

修改可参考： https://github.com/wangrongding/wechat-bot/pull/263/files 自行购买 pad 协议渠道（wechaty 出的，购买仍需谨慎）：http://pad-local.com 由于底层依赖的 wechaty 本身不怎么维护了，听说是被腾讯告了，所以大家购买也要谨慎，群友分享目前 pad 协议可正常使用(但频繁登录登出也会收到警告)，最好别一次性买太久的。

## 常见问题

以下是我的微信和群二维码，添加的时候记得备注清楚来意。希望可以一起交流探讨相关问题和解决方案。

| <img src="https://github.com/user-attachments/assets/902b1a20-0ea0-4348-9ac1-b9eb6645223c" width="180px"> | <img src="https://raw.githubusercontent.com/wangrongding/image-house/master/WechatIMG173.jpg" width="180px"> |
| --- | --- |

### 运行报错等问题

首先你需要做到以下几点：

- 拉取最新代码，重新安装依赖（删除 lock 文件，删除 node_modules）
- 安装依赖时最好不要设置 npm 镜像
- 遇到 puppeteer 安装失败设置环境变量：

  ```
  # Mac
  export PUPPETEER_SKIP_DOWNLOAD='true'

  # Windows
  SET PUPPETEER_SKIP_DOWNLOAD='true'
  ```

- 如果使用云端模型，确保终端网络可以访问对应模型服务（开全局代理，或者手动设置终端代理）

  ```sh
  # 设置代理
  export https_proxy=http://127.0.0.1:你的代理服务端口号;export http_proxy=http://127.0.0.1:你的代理服务端口号;export all_proxy=socks5://127.0.0.1:你的代理服务端口号
  # 然后执行对应服务测试，或先查看 CLI 是否正常
  node ./cli.js --help
  ```

  ![](https://raw.githubusercontent.com/wangrongding/image-house/master/202403231002859.png)

- 如果使用 OpenAI / Claude / Kimi 等云端模型，确认 API Key、余额、模型名和代理配置正确
- 配置好 `.env` 文件，尤其是 `BOT_NAME`、白名单和当前 `--serve` 服务所需参数
- 执行 `npm run test:analysis` 验证本地分析模块，执行 `node ./cli.js --help` 验证 CLI
- 执行 `wb agent --im wechat --agent pi` 或 `wb start --serve <服务名>` 启动微信扫码
- 执行 `wb agent --im lark --agent pi` 或 `wb lark agent --agent pi` 启动飞书事件回复

也可以参考这条 [issue](https://github.com/wangrongding/wechat-bot/issues/54#issuecomment-1347880291)

- 怎么玩？ 完成自定义修改后，群聊时，在白名单中的群，有人 @你 时会触发自动回复，私聊中，联系人白名单中的人发消息给你时会触发自动回复。
- 运行报错？检查 node 版本是否符合，如果不符合，升级 node 版本即可，检查依赖是否安装完整，如果不完整，大陆推荐切换下 npm 镜像源，然后重新安装依赖即可。（可以用我的 [prm-cli](https://github.com/wangrongding/prm-cli) 工具快速切换）
- 调整对话模式？优先通过 `--serve` 切换服务；需要定制业务逻辑时看 [sendMessage.js](./src/wechaty/sendMessage.js)、[commandRouter.js](./src/platforms/wechat/commandRouter.js) 和对应 provider 实现。

## 使用 Docker 部署

```sh
$ docker build . -t wechat-bot

$ docker run -d --rm --name wechat-bot -v $(pwd)/.env:/app/.env wechat-bot
```

- 如果docker build过程中node反复下载超时，可先下载nodejs镜像到本地镜像库，并将DockerFile中的'node:19'修改为本地nodejs镜像版本

## Star History Chart

该项目于 2023/2/13 日成为 Github Trending 榜首。

[![Star History Chart](https://star-history.dera.page/svg?repos=wangrongding/wechat-bot&type=Date)](https://star-history.dera.page/#wangrongding/wechat-bot&Date)

## License

[MIT](./LICENSE.md).
