// import { getChatGPTReply as getReply } from '../chatgpt/index.js'
import { getOpenAiReply as getReply } from '../openai/index.js'

// 测试 open ai api
async function testMessage() {
  const message = await getReply("hello")
  console.log('🌸🌸🌸 / message: ', message)
}

testMessage()