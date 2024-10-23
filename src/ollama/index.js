import axios from 'axios'
import dotenv from 'dotenv'
// 加载环境变量
dotenv.config()
const env = dotenv.config().parsed // 环境参数
const url = env.OLLAMA_URL
const bot_name = env.BOT_NAME
const model_name = env.OLLAMA_MODEL
function createRequest(prompt) {
  return {
    method: 'post',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    data: JSON.stringify({
      model: model_name,
      messages: [
        {
          role: 'system',
          content: env.OLLAMA_SYSTEM_MESSAGE,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: false,
    }),
  }
}

export async function getOllamaReply(prompt) {
  try {
    console.log('=============== ollama request start ======================')
    const request = createRequest(prompt)
    const res = await axios(request)
    console.log('=============== ollama request finished ======================')
    return res.data.message.content
  } catch (error) {
    console.error(error.code)
    console.error(error.message)
  }
}
