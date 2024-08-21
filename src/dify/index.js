import axios from 'axios'
import dotenv from 'dotenv'
// 加载环境变量
dotenv.config()
const env = dotenv.config().parsed // 环境参数
const token = env.DIFY_API_KEY
const url = env.DIFY_URL
const bot_name = env.BOT_NAME
function setConfig(prompt) {
  return {
    method: 'post',
    url: `${url}/chat-messages`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    data: JSON.stringify({
      inputs: {},
      query: prompt,
      response_mode: 'blocking',
      user: bot_name,
      files: [],
    }),
  }
}

export async function getDifyReply(prompt) {
  try {
    const config = setConfig(prompt)
    console.log('🌸🌸🌸 / config: ', config)
    const response = await axios(config)
    console.log('🌸🌸🌸 / response: ', response)
    return response.data.answer
  } catch (error) {
    console.error(error.code)
    console.error(error.message)
  }
}
