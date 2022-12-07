import { ChatGPTAPI } from "chatgpt";
import pTimeout from "p-timeout";
import dotenv from "dotenv";

// 定义ChatGPT的配置
const config = {
  markdown: true, // 返回的内容是否需要markdown格式
  AutoReply: true, // 是否自动回复
  sessionToken: dotenv.config().parsed.CHATGPT_SESSION_TOKEN, // ChatGPT的sessionToken
};

// 获取 chatGPT 的回复
export async function getChatGPTReply(content) {
  const api = new ChatGPTAPI(config);
  await api.ensureAuth();
  // 调用ChatGPT的接口
  return await pTimeout(api.sendMessage(content), {
    // 设置超时时间
    milliseconds: 60 * 1000,
    // 超时的错误信息
    message: "ChatGPT 请求超时！最好开下全局代理。",
  });
}
