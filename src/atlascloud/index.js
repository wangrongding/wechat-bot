import OpenAI from 'openai'
import dotenv from 'dotenv'
const env = dotenv.config().parsed // 环境参数
import fs from 'fs'
import path from 'path'

const __dirname = path.resolve()
// 判断是否有 .env 文件, 没有则报错
const envPath = path.join(__dirname, '.env')
if (!fs.existsSync(envPath)) {
  console.log('❌ 请先根据文档，创建并配置.env文件！')
  process.exit(1)
}

let config = {
  apiKey: env.ATLASCLOUD_API_KEY,
  baseURL: env.ATLASCLOUD_URL ? env.ATLASCLOUD_URL : 'https://api.atlascloud.ai/v1',
}
const openai = new OpenAI(config)
const chosen_model = env.ATLASCLOUD_MODEL ? env.ATLASCLOUD_MODEL : 'deepseek-ai/deepseek-v4-pro'

export async function getAtlasCloudReply(prompt) {
  console.log('🚀🚀🚀 / prompt', prompt)
  const messages = []
  if (env.ATLASCLOUD_SYSTEM_MESSAGE) {
    messages.push({ role: 'system', content: env.ATLASCLOUD_SYSTEM_MESSAGE })
  }
  messages.push({ role: 'user', content: prompt })

  const response = await openai.chat.completions.create({
    messages,
    model: chosen_model,
  })
  console.log('🚀🚀🚀 / reply', response.choices[0].message.content)
  return `${response.choices[0].message.content}`
}
