import { ChatGPTAPI } from 'chatgpt'
import dotenv from 'dotenv'

// 定义ChatGPT的配置
const config = {
  markdown: true, // 返回的内容是否需要markdown格式
  AutoReply: true, // 是否自动回复
  clearanceToken: dotenv.config().parsed.CHATGPT_CLEARANCE,// ChatGPT的clearance，从cookie取值
  sessionToken: dotenv.config().parsed.CHATGPT_SESSION_TOKEN, // ChatGPT的sessionToken
  userAgent: dotenv.config().parsed.CHATGPT_USER_AGENT, // User-Agent
  accessToken:dotenv.config().parsed.CHATGPT_ACCESS_TOKEN// 在用户授权情况下，访问https://chat.openai.com/api/auth/session，获取accesstoken
}
const api = new ChatGPTAPI(config)

// 获取 chatGPT 的回复
export async function getChatGPTReply(content) {
  await api.ensureAuth()
  console.log('🚀🚀🚀 / content', content)
  // 调用ChatGPT的接口
  const reply = await api.sendMessage(content, {
    //  "ChatGPT 请求超时！最好开下全局代理。"
    timeoutMs: 2 * 60 * 1000,
  })
  console.log('🚀🚀🚀 / reply', reply)
  return reply

  // // 如果你想要连续语境对话，可以使用下面的代码
  // const conversation = api.getConversation();
  // return await conversation.sendMessage(content, {
  //   //  "ChatGPT 请求超时！最好开下全局代理。"
  //   timeoutMs: 2 * 60 * 1000,
  // });
}
