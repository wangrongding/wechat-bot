# WeChat Bot

一个 基于 `chatgpt` + `wechaty` 的微信机器人

可以用来帮助你自动回复微信消息，或者管理微信群/好友.

## 开发

1. 检查好自己的开发环境，确保已经安装了 `nodejs` , 版本需要满足 Node.js >= v16.8 ，版本太低会导致运行报错,太高也不行，最好使用 LTS 版本。
2. 先获取自己的 `chatgpt` token，地址戳这里 👉🏻 ：[https://chat.openai.com/chat](https://chat.openai.com/chat)
3. 登录完了，在控制台把 `token` 复制下来，然后在项目根目录下创建一个 `.env` 文件，内容如下：

```sh
# 执行下面命令，拷贝一份 .env.example 文件
cp .env.example .env
# 完善.env 文件内容
CHATGPT_SESSION_TOKEN='你的token'
```

token 在这里拿到 ↓： ![](https://assets.fedtop.com/picbed/202212071104566.png)

4. 启动服务

```sh
# 安装依赖
npm i
# 启动服务
npm run dev
```

就可以扫码登录，然后根据你的需求，自己修改 `index.js` 文件。

![](https://assets.fedtop.com/picbed/202212071315670.png)

可以看到，自动回复都是基于 `chatgpt` 的，记得要开代理。

![](https://assets.fedtop.com/picbed/202212071317377.png)

## 注意

很多人说运行后不会自动收发信息，其实不是的哈~

[sendMessage.js](./src/sendMessage.js) 文件中这块你们可以根据自己的需求来改的，记得添加好限制条件，要不然谁给你发消息都自动回复，chatgpt 接口可能请求不过来 😅

- 群聊，记得把机器人名称改成你自己微信号的名称，然后添加对应群聊的名称到白名单中，这样就可以自动回复群聊消息了。
- 私聊，记得把需要自动回复的好友名称添加到白名单中，这样就可以自动回复私聊消息了。

![](https://assets.fedtop.com/picbed/202212102344274.png)
