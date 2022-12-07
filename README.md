# WeChat Bot

一个 基于 `chatgpt` + `wechaty` 的微信机器人

可以用来帮助你自动回复微信消息，或者管理微信群/好友.

## 开发

1. 检查好自己的开发环境，确保已经安装了 `nodejs` ,版本最好使用 LTS 版本，我本地试了下 `v16.16.0`和 `v18.9.0`，都正常，版本太低会导致运行报错。
2. 先获取自己的 `chatgpt` token，地址戳这里 👉🏻 ：[https://chat.openai.com/chat](https://chat.openai.com/chat)
3. 登录完了，在控制台把 `token` 复制下来，然后在项目根目录下创建一个 `.env` 文件，内容如下：

```sh
# 执行下面命令，拷贝一份 .env.example 文件
cp .env.example .env
```

```sh
# 完善.env 文件内容
CHATGPT_SESSION_TOKEN='你的token'
```

token 在这里拿到 ↓：
![](https://assets.fedtop.com/picbed/202212071104566.png)

4. 启动服务

```sh
npm run dev
```

就可以扫码登录，然后根据你的需求，自己修改 `index.js` 文件。

![](https://assets.fedtop.com/picbed/202212071315670.png)

可以看到，自动回复都是基于 `chatgpt` 的，记得要开代理。

![](https://assets.fedtop.com/picbed/202212071317377.png)
