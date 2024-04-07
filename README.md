# WeChat Bot

一个 基于 `chatgpt` + `wechaty` 的微信机器人

可以用来帮助你自动回复微信消息，或者管理微信群/好友.

`简单`，`好用`，`2分钟（4 个步骤）` 就能玩起来了。🌸 如果对您有所帮助，请点个 Star ⭐️ 支持一下。

## 近期的改动

### 2024.04.08

新增科大讯飞，去这里申请一个 key：[科大讯飞](https://console.xfyun.cn/services/bm35)，每个模型都有 200 万的免费 token ，感觉很难用完。

而且还有一个好处就是，接口不会像 Kimi 一样限制请求频次，相对来说稳定很多。

![](https://assets.fedtop.com/picbed/202404080142590.png)

### 2024.03.26

#### 1. 新增服务类型可选交互

![](https://assets.fedtop.com/picbed/202403261420468.png)

#### 2. 新增国产 ai 服务 Kimi

看到最近 Kimi 爆火，遂集成进来，正好也解决了很多国内小伙伴经常反馈 openai 的接口请求不通需要代理对新手不友好等问题。

可以去 ： [kimi apikey](https://platform.moonshot.cn/console/api-keys) 获取你的 key

最近比较忙，大家感兴趣可以提交 PR，我会尽快合并。目前 Kimi 刚刚集成，还可以实现上传文件等功能，然后有其它较好的服务也可以提交 PR 。

### 2024.03.23

近期老有人问为什么所有都配置好后，`npm run test` 请求不通？

首先，确保你按照 2024.03.07 更新的步骤配置好了

然后，确保你的终端走了代理。以我的 mac 为例，我需要先这样设置：

```sh
# 设置代理
export https_proxy=http://127.0.0.1:你的代理服务端口号;export http_proxy=http://127.0.0.1:你的代理服务端口号;export all_proxy=socks5://127.0.0.1:你的代理服务端口号
# 然后再执行 npm run test
npm run test
```

![](https://raw.githubusercontent.com/wangrongding/image-house/master/202403231002859.png)

### 2024.03.07 更新

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
- 确保你的 openai key 有余额
- 配置好 config.js 和 .env 文件
- 执行 npm run test 能成功拿到 openai 的回复
- 执行 npm run dev 愉快的玩耍吧~ 🎉

### 2024.01.17 更新

安装完依赖后，运行 `npm run dev` 前，可以先测试下 openai 的接口是否可用，运行 `npm run test` 即可。

遇到 timeout 问题需要自行解决。（一般就是代理未成功，或者你的梯子限制了调 openai api 的服务）

### 12.13 更新

不少人今天运行不了，参考这条 [issue](https://github.com/wangrongding/wechat-bot/issues/54#issuecomment-1347880291) ,暂时这样处理下，有好的方案大家可以提出来，谢谢~

### 12.12 更新

- `OpenAI Chatgpt` 因为一些原因，对接口访问添加了一系列的限制。具体可以看这里：[问题详情](https://github.com/transitive-bullshit/chatgpt-api#update-december-11-2022)，所以我改用官方自己的了，目前机器人可用。

也可以进交流群,一起交流探讨相关问题和解决方案，添加的时候记得备注来意。（如果项目对你有所帮助，也可以请我喝杯咖啡 ☕️ ~）

| <img src="https://assets.fedtop.com/picbed/202302090947704.png" width="180px"> | <img src="https://raw.githubusercontent.com/wangrongding/image-house/master/202303151014249.JPG" width="180px"> |
| --- | --- |

## 开发及使用指南

1. 检查好自己的开发环境，确保已经安装了 `nodejs` , 版本需要满足 Node.js >= v18.0 ，版本太低会导致运行报错,最好使用 LTS 版本。
2. 先获取自己的 `api key`，地址戳这里 👉🏻 ：[创建你的 api key](https://beta.openai.com/account/api-keys)

![](https://assets.fedtop.com/picbed/202212121817351.png)

3. 创建完了， 复制下来，然后在项目根目录下创建一个 `.env` 文件，内容如下：

```sh
# 执行下面命令，拷贝一份 .env.example 文件
cp .env.example .env
# 完善.env 文件内容
OPENAI_API_KEY='你的key'
```

4. 运行服务

> 安装依赖时，大陆的朋友推荐切到 taobao 镜像源后再安装，要不然可能会因为依赖安装不完整导致出错， 推荐使用我的工具 👉🏻 [prm-cli](https://github.com/wangrongding/prm-cli) 快速切换。

```sh
# 安装依赖
npm i
# 启动服务
npm run dev # 或者 npm run start
```

然后就可以扫码登录了，然后根据你的需求，自己修改相关逻辑文件。

![](https://assets.fedtop.com/picbed/202212071315670.png)

## 你要修改的

很多人说运行后不会自动收发信息，不是的哈，为了防止给每一条收到的消息都自动回复（太恐怖了），所以加了限制条件。

你要把下面提到的地方自定义修改下。

- 群聊，记得把机器人名称改成你自己微信号的名称，然后添加对应群聊的名称到白名单中，这样就可以自动回复群聊消息了。
- 私聊，记得把需要自动回复的好友名称添加到白名单中，这样就可以自动回复私聊消息了。

文件是 👉🏻 [sendMessage.js](./src/wechaty/sendMessage.js)

![](https://assets.fedtop.com/picbed/202212110942315.png)

可以看到，自动回复都是基于 `chatgpt` 的，记得要开代理。

![](https://assets.fedtop.com/picbed/202212131123257.png)

## 常见问题

- 怎么玩？ 完成自定义修改后，群聊时，在白名单中的群，有人 @你 时会触发自动回复，私聊中，联系人白名单中的人发消息给你时会触发自动回复。
- 运行报错？检查 node 版本是否符合，如果不符合，升级 node 版本即可，检查依赖是否安装完整，如果不完整，大陆推荐切换下 npm 镜像源，然后重新安装依赖即可。（可以用我的 [prm-cli](https://github.com/wangrongding/prm-cli) 工具快速切换）
- 调整对话模式？可以修改[openai/index.js](./src/openai/index.js) ,具体可以根据官方文档给出的示例（非常多，自己对应调整参数即可） ：https://beta.openai.com/examples

## 如果你使用 Docker

```sh
$ docker build . -t wechat-bot

$ docker run -d --rm --name wechat-bot -v $(pwd)/config.js:/app/config.js -v $(pwd)/.env:/app/.env wechat-bot
```

## Star History Chart

该项目于 2023/2/13 日成为 Github Trending 榜首。

[![Star History Chart](https://api.star-history.com/svg?repos=wangrongding/wechat-bot&type=Date)](https://star-history.com/#wangrongding/wechat-bot&Date)
