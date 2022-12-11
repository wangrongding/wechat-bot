# WeChat Bot

一个 基于 `chatgpt` + `wechaty` 的微信机器人

可以用来帮助你自动回复微信消息，或者管理微信群/好友.

## 开发

1. 检查好自己的开发环境，确保已经安装了 `nodejs` , 版本需要满足 Node.js >= v16.8 ，版本太低会导致运行报错,最好使用 LTS 版本。
2. 先获取自己的 `chatgpt` token，地址戳这里 👉🏻 ：[https://chat.openai.com/chat](https://chat.openai.com/chat)
3. 登录完了，在控制台把 `token` 复制下来，然后在项目根目录下创建一个 `.env` 文件，内容如下：

```sh
# 执行下面命令，拷贝一份 .env.example 文件
cp .env.example .env
# 完善.env 文件内容
CHATGPT_SESSION_TOKEN='你的token'
```

token 在这里拿到 ↓：

![](https://assets.fedtop.com/picbed/202212071104566.png)

4. 运行服务

```sh
# 安装依赖
npm i
# 启动服务
npm run dev
```

就可以扫码登录了，然后根据你的需求，自己修改相关逻辑文件。

![](https://assets.fedtop.com/picbed/202212071315670.png)

## 你要修改的

很多人说运行后不会自动收发信息，不是的哈，为了防止给每一条收到的消息都自动回复（太恐怖了），所以加了限制条件。

你要把下面提到的地方自定义修改下。

- 群聊，记得把机器人名称改成你自己微信号的名称，然后添加对应群聊的名称到白名单中，这样就可以自动回复群聊消息了。
- 私聊，记得把需要自动回复的好友名称添加到白名单中，这样就可以自动回复私聊消息了。

文件是 👉🏻 [sendMessage.js](./src/sendMessage.js)

![](https://assets.fedtop.com/picbed/202212110942315.png)

可以看到，自动回复都是基于 `chatgpt` 的，记得要开代理。

![](https://assets.fedtop.com/picbed/202212071317377.png)
