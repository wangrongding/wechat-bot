# WeChat Bot

![](https://assets.fedtop.com/picbed/202212071317377.png)

一个 基于 `chatgpt` + `wechaty` 的微信机器人

可以用来帮助你自动回复微信消息，或者管理微信群/好友.

`简单`，`好用`，`2分钟（4 个步骤）` 就能玩起来了。🌸 如果对您有所帮助，请点个 Star ⭐️ 支持一下。

## 近期的改动

### 12.13 更新

不少人今天运行不了，参考这条 [issue](https://github.com/wangrongding/wechat-bot/issues/54#issuecomment-1347880291) ,暂时这样处理下，有好的方案大家可以提出来，谢谢~

### 12.12 更新

- `OpenAI Chatgpt` 因为一些原因，对接口访问添加了一系列的限制。具体可以看这里：[问题详情](https://github.com/transitive-bullshit/chatgpt-api#update-december-11-2022)，所以我改用官方自己的了，目前机器人可用。

也可以进交流群,一起交流探讨相关问题和解决方案，添加的时候记得备注来意。（如果项目对你有所帮助，也可以请我喝杯咖啡 ☕️ ~）

| <img src="https://assets.fedtop.com/picbed/202302090947704.png" width="180px"> | <img src="https://raw.githubusercontent.com/wangrongding/image-house/master/202303151014249.JPG" width="180px"> | <img src="https://raw.githubusercontent.com/wangrongding/image-house/master/202302092216101.png" width="180px"> |
| --- | --- | --- |

## 开发

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
npm run dev
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
