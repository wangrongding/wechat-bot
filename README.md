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

## 注意

很多人说运行后不会自动收发信息，其实不是的哈~

[wechaty.js](./src/wechaty.js) 文件中这块你们可以根据自己的需求来改的，我这里设置的是，指定备注名的好友，要不然消息太多了，非常恐怖，会给所有给你发消息的人都回复。😅

![](https://assets.fedtop.com/picbed/202212071716514.png)
