import { getDifyReply } from './index.js'

// 测试 dify api
async function testMessage() {
  const message = await getDifyReply('hello')
  console.log('🌸🌸🌸 / message: ', message)
}

testMessage()
