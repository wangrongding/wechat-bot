import { getFastGPTReply } from './index.js'

// 测试 fastgpt api
async function testMessage() {
  const message = await getFastGPTReply('hello')
  console.log('🌸🌸🌸 / message: ', message)
}

testMessage()
