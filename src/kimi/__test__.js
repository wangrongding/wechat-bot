import { getKimiReply } from './index.js'

// 测试 open ai api
async function test() {
  const message = await getKimiReply('你好!')
  console.log('🌸🌸🌸 / message: ', message)
}
test()
