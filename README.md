# WeChat Bot

一个 基于 `chatgpt` + `wechaty` 的微信机器人

可以用来帮助你自动回复微信消息，或者管理微信群/好友.

`简单`，`好用`，`2分钟（4 个步骤）` 就能玩起来了。🌸 如果对您有所帮助，请点个 Star ⭐️ 支持一下。

## 使用前需要配置的 AI 服务（目前支持 3 种，可任选其一）

- 科大讯飞

  新增科大讯飞，去这里申请一个 key：[科大讯飞](https://console.xfyun.cn/services/bm35)，每个模型都有 200 万的免费 token ，感觉很难用完。  
  注意： 讯飞的配置文件几个 key，别填反了，很多人找到我说为什么不回复，都是填反了。  
  而且还有一个好处就是，接口不会像 Kimi 一样限制请求频次，相对来说稳定很多。

- Kimi （请求限制较严重）

  可以去 ： [kimi apikey](https://platform.moonshot.cn/console/api-keys) 获取你的 key  
  最近比较忙，大家感兴趣可以提交 PR，我会尽快合并。目前 Kimi 刚刚集成，还可以实现上传文件等功能，然后有其它较好的服务也可以提交 PR 。

- ChatGPT

  先获取自己的 `api key`，地址戳这里 👉🏻 ：[创建你的 api key](https://beta.openai.com/account/api-keys)

  创建完了，复制下来，然后在项目根目录下新建一个 `.env` 文件，具体步骤如下：

  ```sh
  # 执行下面命令，拷贝一份 .env.example 文件为 .env
  cp .env.example .env
  # 填写完善 .env 文件中的内容
  OPENAI_API_KEY='你的key'
  ```
## 开发/使用

检查好自己的开发环境，确保已经安装了 `nodejs` , 版本需要满足 Node.js >= v18.0 ，版本太低会导致运行报错,最好使用 LTS 版本。

1. 安装依赖

> 安装依赖时，大陆的朋友推荐切到 taobao 镜像源后再安装，命令：  
> `npm config set registry https://registry.npmmirror.com`  
> 想要灵活切换，推荐使用我的工具 👉🏻 [prm-cli](https://github.com/wangrongding/prm-cli) 快速切换。

```sh
# 安装依赖
npm i
yarn
# 推荐用 pnpm 吧，npm 安装有时会遇到 wechaty 内部依赖安装失败的问题
pnpm i
```

2. 运行服务

```sh
# 启动服务
npm run start
# 启动服务
yarn start # 或者 yarn start
# 启动服务
pnpm start
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

文件是 👉🏻 [sendMessage.js](./config.js)
## 如果你使用 Docker

```sh
$ docker build . -t wechat-bot

$ docker run -d --rm --name wechat-bot -v $(pwd)/config.js:/app/config.js -v $(pwd)/.env:/app/.env wechat-bot
```

## License

[MIT](./LICENSE).
