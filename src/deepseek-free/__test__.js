import { getDeepSeekFreeReply } from './index.js'

// 测试 open ai api
async function testMessage() {
  const message = await getDeepSeekFreeReply('hello')
  console.log('🌸🌸🌸 / message: ', message)
}

testMessage()
