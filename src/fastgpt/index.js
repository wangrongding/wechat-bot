// 参考：https://github.com/labring/fastgpt
import axios from 'axios'
import dotenv from 'dotenv'
const env = dotenv.config().parsed // 环境参数

const domain = env.FASTGPT_API_URL || 'https://cloud.fastgpt.cn'
const server = {
  chat: `${domain}/api/v1/chat/completions`,
}

const configuration = {
  model: env.FASTGPT_MODEL || 'Qwen-turbo',
  temperature: 0.3,
  max_tokens: 5000,
  stream: false,
}

// sample request: curl --location --request POST 'http://localhost:3000/api/v1/chat/completions' \
// --header 'Authorization: Bearer fastgpt-xxxxxx' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "chatId": "my_chatId",
//     "stream": false,
//     "detail": false,
//     "responseChatItemId": "my_responseChatItemId",
//     "variables": {
//         "uid": "asdfadsfasfd2323",
//         "name": "张三"
//     },
//     "messages": [
//         {
//             "role": "user",
//             "content": "导演是谁"
//         }
//     ]
// }'
export async function getFastGPTReply(prompt) {
  try {
    console.log('🚀🚀🚀 / prompt', prompt)
    const res = await axios.post(
      server.chat,
      {
        chatId: 'default_chat_id',
        stream: configuration.stream,
        detail: false,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${env.FASTGPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )

    const { choices } = res.data
    return `${choices[0].message.content}`
  } catch (error) {
    console.log('FastGPT Error:', error.message)
    console.log('请检查你的 API_KEY 和 API_URL 配置是否正确')
    throw error
  }
}
