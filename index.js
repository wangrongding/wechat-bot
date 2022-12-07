import { WechatyBuilder, ScanStatus, log } from "wechaty";
import { ChatGPTAPI } from "chatgpt";
import pTimeout from "p-timeout";
import qrTerminal from "qrcode-terminal";
import dotenv from "dotenv";

// 定义ChatGPT的配置
const config = {
  MakeFriend: true,
  AutoReply: true, // 是否自动回复
  ChatGPTSessionToken: dotenv.config().parsed.CHATGPT_SESSION_TOKEN, // ChatGPT的sessionToken
};

// 获取 chatGPT 的回复
async function getChatGPTReply(content) {
  const api = new ChatGPTAPI({ sessionToken: config.ChatGPTSessionToken });
  await api.ensureAuth();
  // 调用ChatGPT的接口
  const response = await pTimeout(api.sendMessage(content), {
    // 设置超时时间
    milliseconds: 3 * 60 * 1000,
    // 超时的错误信息
    message: "ChatGPT 请求超时！最好开下全局代理。",
  });
  // 返回的是一个 markdown 格式的字符串，你可以根据自己的需求进行处理
  return response;
}

// 扫码
function onScan(qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    // 在控制台显示二维码
    qrTerminal.generate(qrcode, { small: true });
    const qrcodeImageUrl = [
      "https://api.qrserver.com/v1/create-qr-code/?data=",
      encodeURIComponent(qrcode),
    ].join("");
    console.log("onScan:", qrcodeImageUrl, ScanStatus[status], status);
  } else {
    log.info("onScan: %s(%s)", ScanStatus[status], status);
  }
}

// 登录
function onLogin(user) {
  console.log(`${user} has logged in`);
  const date = new Date();
  console.log(`Current time:${date}`);
  if (config.AutoReply) {
    console.log(`Automatic robot chat mode has been activated`);
  }
}

// 登出
function onLogout(user) {
  console.log(`${user} has logged out`);
}

// 收到好友请求
async function onFriendShip(friendship) {
  const frienddShipRe = /chatgpt|chat/;
  if (friendship.type() === 2) {
    if (frienddShipRe.test(friendship.hello())) {
      await friendship.accept();
    }
  }
}

// 收到消息
async function onMessage(msg) {
  const contact = msg.talker(); // 发消息人
  const receiver = msg.to(); // 消息接收人
  const content = msg.text(); // 消息内容
  const room = msg.room(); // 是否是群消息
  const alias = (await contact.alias()) || (await contact.name()); // 发消息人昵称
  const isText = msg.type() === bot.Message.Type.Text; // 消息类型是否为文本
  // TODO 你们可以根据自己的需求修改这里的逻辑，测试记得加限制，我这边消息太多了，这里只处理指定的人的消息
  if (alias === "好友备注名" && isText) {
    // console.log("🚀🚀🚀 / msg", msg);
    // console.log("🚀🚀🚀 / contact", contact);
    // console.log("🚀🚀🚀 / receiver", receiver);
    // console.log("🚀🚀🚀 / room", room);
    // console.log("🚀🚀🚀 / alias", alias);
    // console.log("🚀🚀🚀 / isText", isText);
    console.log("🚀🚀🚀 / content", content);
    const reply = await getChatGPTReply(content);
    console.log("🚀🚀🚀 / reply", reply);
    try {
      await contact.say(reply);
    } catch (e) {
      console.error(e);
    }
    return;
  }
}

// 初始化机器人
const bot = WechatyBuilder.build({
  name: "WechatEveryDay",
  puppet: "wechaty-puppet-wechat", // 如果有token，记得更换对应的puppet
  puppetOptions: {
    uos: true,
  },
});

// 扫码
bot.on("scan", onScan);
// 登录
bot.on("login", onLogin);
// 登出
bot.on("logout", onLogout);
// 收到消息
bot.on("message", onMessage);
// 添加好友
if (config.MakeFriend) {
  bot.on("friendship", onFriendShip);
}

// 启动微信机器人
bot
  .start()
  .then(() => console.log("Start to log in wechat..."))
  .catch((e) => console.error(e));
