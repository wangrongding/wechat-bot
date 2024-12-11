import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()
const env = dotenv.config().parsed
const key = env.CLAUDE_API_KEY || ''
const model = env.CLAUDE_MODEL ? env.CLAUDE_MODEL : 'claude-3-5-sonnet-latest'
const system = env.CLAUDE_SYSTEM || ''
const apiVersion = env.CLAUDE_API_VERSION || '2023-06-01'

function claudeConfig(prompt) {
  const body = {
    model: model,
    temperature: 0.4,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  }
  if (system !== '') {
    body.system = system
  }
  return {
    method: 'post',
    url: 'https://api.anthropic.com/v1/messages',
    headers: {
      'x-api-key': key,
      'anthropic-version': apiVersion,
      'Content-Type': 'application/json',
    },
    data: body,
  }
}
export async function getClaudeReply(prompt) {
  try {
    const claude = claudeConfig(prompt)
    const reply = await axios(claude)
    return reply.data.content[0].text || ''
  } catch (error) {
    console.error(error)
  }
}
