import { remark } from 'remark'
import stripMarkdown from 'strip-markdown'
import dotenv from 'dotenv'

const env = dotenv.config().parsed

let getGptReply

// 检查是否设置了OPENAI_API_KEY
if (!env.OPENAI_API_KEY) {
  console.log('OPENAI_API_KEY is not set. Skipping OpenAI API configuration.')
  getGptReply = async (prompt) => {
    console.log('OPENAI_API_KEY is not set. Skipping OpenAI API request.')
    return 'API key is not set. No response generated.'
  }
} else {
  // 动态导入 openai 模块
  ; (async () => {
    const { Configuration, OpenAIApi } = await import('openai')

    // 配置OpenAI API客户端
    let config = {
      apiKey: env.OPENAI_API_KEY,
      organization: '',
    }

    if (env.OPENAI_PROXY_URL) {
      config.basePath = env.OPENAI_PROXY_URL
    }

    const openai = new OpenAIApi(new Configuration(config))
    const chosen_model = env.OPENAI_MODEL || 'gpt-4'

    // 获取GPT回复的函数
    getGptReply = async (prompt) => {
      try {
        console.log('🚀🚀🚀 / prompt', prompt)
        const response = await openai.createChatCompletion({
          model: chosen_model,
          messages: [
            { role: 'system', content: env.OPENAI_SYSTEM_MESSAGE },
            { role: 'user', content: prompt },
          ],
        })
        console.log('🚀🚀🚀 / reply', response.data.choices[0].message.content)
        return `${response.data.choices[0].message.content}\nVia ${chosen_model}`
      } catch (error) {
        console.error('Error generating response:', error)
        throw new Error('Failed to get response from OpenAI API')
      }
    }
  })()
}

// 导出 getGptReply 函数
export { getGptReply }
