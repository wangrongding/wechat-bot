import { getGptReply } from '../openai/index.js'
import { getKimiReply } from '../kimi/index.js'
import { getXunfeiReply } from '../xunfei/index.js'
import dotenv from 'dotenv'
import inquirer from 'inquirer'
import { getDeepSeekFreeReply } from '../deepseek-free/index.js'
const env = dotenv.config().parsed // 环境参数

// 控制启动
async function handleRequest(type) {
  console.log('type: ', type)
  switch (type) {
    case 'ChatGPT':
      if (env.OPENAI_API_KEY) {
        const message = await getGptReply('hello')
        console.log('🌸🌸🌸 / reply: ', message)
        return
      }
      console.log('❌ 请先配置.env文件中的 OPENAI_API_KEY')
      break
    case 'Kimi':
      if (env.KIMI_API_KEY) {
        const message = await getKimiReply('你好!')
        console.log('🌸🌸🌸 / reply: ', message)
        return
      }
      console.log('❌ 请先配置.env文件中的 KIMI_API_KEY')
      break
    case 'Xunfei':
      if (env.XUNFEI_APP_ID && env.XUNFEI_API_KEY && env.XUNFEI_API_SECRET) {
        const message = await getXunfeiReply('你好!')
        console.log('🌸🌸🌸 / reply: ', message)
        return
      }
      console.log('❌ 请先配置.env文件中的 XUNFEI_APP_ID，XUNFEI_API_KEY，XUNFEI_API_SECRET')
      break
    case 'deepseek-free':
      if (env.DEEPSEEK_FREE_URL && env.DEEPSEEK_FREE_TOKEN && env.DEEPSEEK_FREE_MODEL) {
        const message = await getDeepSeekFreeReply('你好!')
        console.log('🌸🌸🌸 / reply: ', message)
        return
      }
      console.log('❌ 请先配置.env文件中的 DEEPSEEK_FREE_URL，DEEPSEEK_FREE_TOKEN，DEEPSEEK_FREE_MODEL')
      break
    default:
      console.log('🚀服务类型错误')
  }
}

const serveList = [
  { name: 'ChatGPT', value: 'ChatGPT' },
  { name: 'Kimi', value: 'Kimi' },
  { name: 'Xunfei', value: 'Xunfei' },
  { name: 'deepseek-free', value: 'deepseek-free' },
  // ... 欢迎大家接入更多的服务
]
const questions = [
  {
    type: 'list',
    name: 'serviceType', //存储当前问题回答的变量key，
    message: '请先选择服务类型',
    choices: serveList,
  },
]
function init() {
  inquirer
    .prompt(questions)
    .then((res) => {
      handleRequest(res.serviceType)
    })
    .catch((error) => {
      console.log('🚀error:', error)
    })
}
init()
