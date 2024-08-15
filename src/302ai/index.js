import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()
const env = dotenv.config().parsed
const key = env._302AI_API_KEY
const model = env._302AI_MODEL ? env._302AI_MODEL : 'gpt-4o-mini'

function setConfig(prompt) {
  return {
    method: 'post',
    url: 'https://api.302.ai/v1/chat/completions',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${key}`,
      'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  }
}

export async function get302AiReply(prompt) {
  try {
    const config = setConfig(prompt)
    const response = await axios(config)
    const { choices } = response.data
    return choices[0].message.content
  } catch (error) {
    console.error(error.code)
    console.error(error.message)
  }
}
