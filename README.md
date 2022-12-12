# WeChat Bot

一个 基于 `chatgpt` + `wechaty` 的微信机器人

可以用来帮助你自动回复微信消息，或者管理微信群/好友.

`简单`，`好用`，`2分钟` 就能玩起来了。🌸 如果对您有所帮助，请点个 Star ⭐️ 支持一下。

## 12.12 更新

- `OpenAI Chatgpt` 因为一些原因，对接口访问添加了一系列的限制。具体可以看这里：[问题详情](https://github.com/transitive-bullshit/chatgpt-api#update-december-11-2022)

所以补充了以下配置：

```sh
# .env文件

# ChatGPT的sessionToken, 从cookie取值
CHATGPT_SESSION_TOKEN=''
#  ChatGPT的clearance，从cookie取值
CHATGPT_CLEARANCE=''
# ChatGPT的user-agent，从浏览器取值,或者替换为与你的真实浏览器的User-Agent相匹配的值
CHATGPT_USER_AGENT=''
# 在用户授权情况下，访问https://chat.openai.com/api/auth/session，获取accesstoken
CHATGPT_ACCESS_TOKEN=''
```

## 开发

1. 检查好自己的开发环境，确保已经安装了 `nodejs` , 版本需要满足 Node.js >= v18.0 ，版本太低会导致运行报错,最好使用 LTS 版本。
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

## 常见问题

- 怎么玩？ 完成自定义修改后，群聊时，在白名单中的群，有人 @你 时会触发自动回复，私聊中，联系人白名单中的人发消息给你时会触发自动回复。
- ChatGPT Token 会过期，自动回复报错后，检查下是否为 token 的问题，如果是，重新获取 token 即可。（目前官方这个库还不支持用户名密码或者 key 的方式登录）
- 运行报错？检查 node 版本是否符合，如果不符合，升级 node 版本即可，检查依赖是否安装完整，如果不完整，大陆推荐切换下 npm 镜像源，然后重新安装依赖即可。（可以用我的 [prm-cli](https://github.com/wangrongding/prm-cli) 工具快速切换）
