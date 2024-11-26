# WeChat Bot

一个 基于 `chatgpt` + `wechaty` 的微信机器人

可以用来帮助你自动回复微信消息，或者管理微信群/好友.

`简单`，`好用`，`2分钟（4 个步骤）` 就能玩起来了。🌸 如果对您有所帮助，请点个 Star ⭐️ 支持一下。

<div align='center'>
  <a href="https://trendshift.io/repositories/11077" target="_blank"><img src="https://trendshift.io/api/badge/repositories/11077" alt="wangrongding%2Fwechat-bot | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>
</div>

## 贡献者们

<a href="https://github.com/wangrongding/wechat-bot/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=wangrongding/wechat-bot&columns=20" />
</a>

欢迎大家提交 PR 接入更多的 ai 服务(比如扣子等...)，积极贡献更好的功能实现，让 wechat-bot 变得更强！

## 使用前需要配置的 AI 服务（目前支持 8 种，可任选其一）

- ChatGPT

  先获取自己的 `api key`，地址戳这里 👉🏻 ：[创建你的 api key](https://beta.openai.com/account/api-keys)

  **注意：这个是需要去付费购买的，很多人过来问为什么请求不通，请确保终端走了代理，并且付费购买了它的服务**

  ```sh
  # 执行下面命令，拷贝一份 .env.example 文件为 .env
  cp .env.example .env
  # 填写完善 .env 文件中的内容
  OPENAI_API_KEY='你的key'
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

- deepseek 获取自己的 `api key`，地址戳这里 👉🏻 ：[deepseek 开放平台](https://platform.deepseek.com/usage)  
  将获取到的`api key`填入 `.evn` 文件中的 `DEEPSEEK_FREE_TOKEN` 中。

- 科大讯飞

  新增科大讯飞，去这里申请一个 key：[科大讯飞](https://console.xfyun.cn/services/bm35)，每个模型都有 200 万的免费 token ，感觉很难用完。  
  注意： 讯飞的配置文件几个 key，别填反了，很多人找到我说为什么不回复，都是填反了。  
  而且还有一个好处就是，接口不会像 Kimi 一样限制请求频次，相对来说稳定很多。  
  服务出错可参考： [issues/170](https://github.com/wangrongding/wechat-bot/issues/170), [issues/180](https://github.com/wangrongding/wechat-bot/issues/180)

- Kimi （请求限制较严重）

  可以去 ： [kimi apikey](https://platform.moonshot.cn/console/api-keys) 获取你的 key  
  最近比较忙，大家感兴趣可以提交 PR，我会尽快合并。目前 Kimi 刚刚集成，还可以实现上传文件等功能，然后有其它较好的服务也可以提交 PR 。

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

- 其他  
  （待实践）理论上使用 openAI 格式的 api，都可以使用，在 env 文件中修改对应的 api_key、model、proxy_url 即可。

## API资源/平台收录

- [gpt4free](https://github.com/xtekky/gpt4free)
- [chatanywhere](https://github.com/chatanywhere/GPT_API_free)

## 赞助商

<p align="center">
  <a href="https://gpt302.saaslink.net/hqRIfk" target="_blank">
    <img src="./sponsors/302AI.png" alt="Hi" width="200" />
  </a>
</p>

> 302.AI 是一个按需付费的一站式 AI 应用平台，为用户解决 AI 用于实践的最后一公里问题。 [产品链接](https://gpt302.saaslink.net/hqRIfk) | [网站介绍](https://gpt302.saaslink.net/hqRIfk)

目前该项目流量较大，已经上过 27 次 [Github Trending 榜](https://github.com/trending)，如果您的公司或者产品需要推广，可以在下方二维码处联系我，我会在项目中加入您的广告，帮助您的产品获得更多的曝光。

## 开发/使用

检查好自己的开发环境，确保已经安装了 `nodejs` , 版本需要满足 Node.js >= v18.0 ，版本太低会导致运行报错,最好使用 LTS 版本。

1. 安装依赖

> 安装依赖时，大陆的朋友推荐切到 taobao 镜像源后再安装，命令：  
> `npm config set registry https://registry.npmmirror.com`  
> 想要灵活切换，推荐使用我的工具 👉🏻 [prm-cli](https://github.com/wangrongding/prm-cli) 快速切换。

```sh
# 安装依赖
npm i
# 推荐用 yarn 吧，npm 安装有时会遇到 wechaty 内部依赖安装失败的问题
yarn
```

2. 运行服务

```sh
# 启动服务
npm run dev # 或者 npm run start
# 启动服务
yarn dev # 或者 yarn start
```

然后就可以扫码登录了，然后根据你的需求，自己修改相关逻辑文件。

![](https://assets.fedtop.com/picbed/202403261420468.png)

![](https://assets.fedtop.com/picbed/202212071315670.png)

为了兼容 docker 部署，避免不必要的选择交互，新增指定服务运行

```sh
# 运行指定服务 （ 目前支持 ChatGPT | Kimi | Xunfei ）
npm run start -- --serve Kimi
# 交互选择服务，仍然保持原有的逻辑
npm run start
```

3. 测试

安装完依赖后，运行 `npm run dev` 前，可以先测试下 openai 的接口是否可用，运行 `npm run test` 即可。

遇到 timeout 问题需要自行解决。（一般就是代理未成功，或者你的梯子限制了调 openai api 的服务）

## 你要修改的

很多人说运行后不会自动收发信息，不是的哈，为了防止给每一条收到的消息都自动回复（太恐怖了），所以加了限制条件。

你要把下面提到的地方自定义修改下。

- 群聊，记得把机器人名称改成你自己微信号的名称，然后添加对应群聊的名称到白名单中，这样就可以自动回复群聊消息了。
- 私聊，记得把需要自动回复的好友名称添加到白名单中，这样就可以自动回复私聊消息了。
- 更深入的可以通过修改 `src/wechaty/sendMessage.js` 文件来满足你自己的业务场景。（大多人反馈可能无法自动回复，也可以通过调试这个文件来排查具体原因）

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
```

可以看到，自动回复都是基于 `chatgpt` 的，记得要开代理，或者填写代理地址。

![](https://github.com/user-attachments/assets/1c312cf4-73d8-44a1-8f36-5ea288ac0aa4)

## 常见问题

可以进交流群,一起交流探讨相关问题和解决方案，添加的时候记得备注来意。（如果项目对你有所帮助，也可以请我喝杯咖啡 ☕️ ~）

| <img src="https://github.com/user-attachments/assets/902b1a20-0ea0-4348-9ac1-b9eb6645223c" width="180px"> | <img src="https://raw.githubusercontent.com/wangrongding/image-house/master/202303151014249.JPG" width="180px"> |
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

- 确保你们的终端走了代理 (开全局梯子，或者手动设置终端走代理)

  ```sh
  # 设置代理
  export https_proxy=http://127.0.0.1:你的代理服务端口号;export http_proxy=http://127.0.0.1:你的代理服务端口号;export all_proxy=socks5://127.0.0.1:你的代理服务端口号
  # 然后再执行 npm run test
  npm run test
  ```

  ![](https://raw.githubusercontent.com/wangrongding/image-house/master/202403231002859.png)

- 确保你的 openai key 有余额
- 配置好 .env 文件
- 执行 npm run test 能成功拿到 openai 的回复(设置完代理后，仍然请求不通？ 可以参考： https://medium.com/@chanter2d/%E5%85%B3%E4%BA%8E%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8clash%E5%AE%9E%E7%8E%B0%E7%9C%9F%E6%AD%A3%E7%9A%84%E5%85%A8%E5%B1%80%E4%BB%A3%E7%90%86-385b2d745871)
- 执行 npm run dev 愉快的玩耍吧~ 🎉

也可以参考这条 [issue](https://github.com/wangrongding/wechat-bot/issues/54#issuecomment-1347880291)

- 怎么玩？ 完成自定义修改后，群聊时，在白名单中的群，有人 @你 时会触发自动回复，私聊中，联系人白名单中的人发消息给你时会触发自动回复。
- 运行报错？检查 node 版本是否符合，如果不符合，升级 node 版本即可，检查依赖是否安装完整，如果不完整，大陆推荐切换下 npm 镜像源，然后重新安装依赖即可。（可以用我的 [prm-cli](https://github.com/wangrongding/prm-cli) 工具快速切换）
- 调整对话模式？可以修改[openai/index.js](./src/openai/index.js) ,具体可以根据官方文档给出的示例（非常多，自己对应调整参数即可） ：https://beta.openai.com/examples

## 使用 Docker 部署

```sh
$ docker build . -t wechat-bot

$ docker run -d --rm --name wechat-bot -v $(pwd)/.env:/app/.env wechat-bot
```

## Star History Chart

该项目于 2023/2/13 日成为 Github Trending 榜首。

[![Star History Chart](https://api.star-history.com/svg?repos=wangrongding/wechat-bot&type=Date)](https://star-history.com/#wangrongding/wechat-bot&Date)

## License

[MIT](./LICENSE).
