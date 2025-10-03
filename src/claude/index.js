import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()
const env = dotenv.config().parsed

/**
 * 用于规整env文件中配置的url到标准格式
 */
function normalizeClaudeBaseUrl(url) {
  if (!url) {
    return 'https://api.anthropic.com/v1/messages'
  }
  
  let normalizedUrl = url.replace(/\/$/, '')
  
  if (normalizedUrl.includes('/v1/messages')) {
    return normalizedUrl
  }
  
  if (normalizedUrl.includes('/v1') && !normalizedUrl.includes('/messages')) {
    return `${normalizedUrl}/messages`
  }
  
  if (normalizedUrl.includes('/messages') && !normalizedUrl.includes('/v1')) {
    return normalizedUrl.replace('/messages', '/v1/messages')
  }
  
  return `${normalizedUrl}/v1/messages`
}

const key = env.CLAUDE_API_KEY || ''
const model = env.CLAUDE_MODEL ? env.CLAUDE_MODEL : 'claude-3-5-sonnet-latest'
const baseUrl = normalizeClaudeBaseUrl(env.CLAUDE_BASE_URL)  
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
    url: baseUrl,
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
