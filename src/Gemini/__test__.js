import { getGeminiReply } from './index.js'

// 测试 Gemini api
async function testMessage() {
  let message
  message = await getGeminiReply('Hello')
  console.log('🌸🌸🌸 / message: ', message)
}

testMessage()
