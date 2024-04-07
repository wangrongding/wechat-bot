import { getXunfeiReply } from './index.js'

// 测试 科大讯飞 api
async function testMessage() {
  const message = await getXunfeiReply('秦始皇的儿子是谁?')
  console.log('🌸🌸🌸 / message: ', message)
}

testMessage()
