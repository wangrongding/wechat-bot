import { Command } from 'commander'
import inquirer from 'inquirer'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { env, getWechatRuntimeConfig } from './config/env.js'
import { analyzeWechatMessages } from './analysis/wechatAnalyzer.js'
import { larkListMessages, larkLogin, larkSearchMessages, larkSendText, larkStatus } from './adapters/lark.js'
import { runOpenCli, runWxCli } from './adapters/opencli.js'
import { runPi } from './adapters/pi.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const { version, name } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'))

export const serveList = [
  { name: 'ChatGPT', value: 'ChatGPT' },
  { name: 'doubao', value: 'doubao' },
  { name: 'deepseek', value: 'deepseek' },
  { name: 'Kimi', value: 'Kimi' },
  { name: 'Xunfei', value: 'Xunfei' },
  { name: 'deepseek-free', value: 'deepseek-free' },
  { name: '302AI', value: '302AI' },
  { name: 'dify', value: 'dify' },
  { name: 'ollama', value: 'ollama' },
  { name: 'tongyi', value: 'tongyi' },
  { name: 'claude', value: 'claude' },
  { name: 'pi', value: 'pi' },
  { name: 'Gemini', value: 'Gemini' },
]

function getMissingConfig(type) {
  switch (type) {
    case 'ChatGPT':
      return env.OPENAI_API_KEY ? [] : ['OPENAI_API_KEY']
    case 'doubao':
      return env.DOUBAO_API_KEY ? [] : ['DOUBAO_API_KEY']
    case 'deepseek':
      return env.DEEPSEEK_API_KEY ? [] : ['DEEPSEEK_API_KEY']
    case 'Kimi':
      return env.KIMI_API_KEY ? [] : ['KIMI_API_KEY']
    case 'Xunfei':
      return env.XUNFEI_APP_ID && env.XUNFEI_API_KEY && env.XUNFEI_API_SECRET ? [] : ['XUNFEI_APP_ID', 'XUNFEI_API_KEY', 'XUNFEI_API_SECRET']
    case 'deepseek-free':
      return env.DEEPSEEK_FREE_URL && env.DEEPSEEK_FREE_TOKEN && env.DEEPSEEK_FREE_MODEL
        ? []
        : ['DEEPSEEK_FREE_URL', 'DEEPSEEK_FREE_TOKEN', 'DEEPSEEK_FREE_MODEL']
    case '302AI':
      return env._302AI_API_KEY ? [] : ['_302AI_API_KEY']
    case 'dify':
      return env.DIFY_API_KEY && env.DIFY_URL ? [] : ['DIFY_API_KEY', 'DIFY_URL']
    case 'ollama':
      return env.OLLAMA_URL && env.OLLAMA_MODEL ? [] : ['OLLAMA_URL', 'OLLAMA_MODEL']
    case 'tongyi':
      return env.TONGYI_URL && env.TONGYI_MODEL ? [] : ['TONGYI_URL', 'TONGYI_MODEL']
    case 'claude':
      return env.CLAUDE_API_KEY && env.CLAUDE_MODEL ? [] : ['CLAUDE_API_KEY', 'CLAUDE_MODEL']
    case 'pi':
      return []
    case 'Gemini':
      return env.GEMINI_API_KEY && env.GEMINI_MODEL ? [] : ['GEMINI_API_KEY', 'GEMINI_MODEL']
    default:
      return ['SERVICE_TYPE']
  }
}

async function startWechat(type) {
  const serviceType = type || env.SERVICE_TYPE
  if (!serveList.find((item) => item.value === serviceType)) {
    console.log('服务类型错误，目前支持：' + serveList.map((item) => item.value).join(' | '))
    return
  }

  const missing = getMissingConfig(serviceType)
  if (missing.length) {
    console.log(`请先配置 .env 文件中的 ${missing.join('，')}`)
    return
  }

  console.log('service type:', serviceType)
  const { startWechatBot } = await import('./platforms/wechat/bot.js')
  startWechatBot({ serviceType })
}

async function promptAndStart() {
  if (env.SERVICE_TYPE) {
    await startWechat(env.SERVICE_TYPE)
    return
  }

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'serviceType',
      message: '请先选择服务类型',
      choices: serveList,
    },
  ])

  await startWechat(answer.serviceType)
}

function printAnalysisResult(result) {
  console.log(`分析对象：${result.target}`)
  console.log(JSON.stringify(result.stats, null, 2))
  if (result.analysis) {
    console.log('\n分析结果：')
    console.log(result.analysis)
  }
}

const program = new Command(name)
program.alias('we').description('一个基于 WeChaty 结合 AI 服务实现的微信机器人。').version(version, '-v, --version, -V')

program.option('-s, --serve <type>', '跳过交互，直接设置启动的服务类型').action(async () => {
  const { serve } = program.opts()
  if (serve) {
    await startWechat(serve)
    return
  }
  await promptAndStart()
})

program
  .command('start')
  .description('启动微信 IM，终端展示二维码扫码登录')
  .option('-s, --serve <type>', '跳过交互，直接设置启动的服务类型')
  .action(async (options) => {
    if (options.serve) {
      await startWechat(options.serve)
      return
    }
    await promptAndStart()
  })

program
  .command('agent')
  .description('启动外部 IM 通道，并使用指定 agent 处理消息')
  .option('--im <channel>', '外部通信渠道：wechat', 'wechat')
  .option('--agent <agent>', '消息处理 agent：pi 或其他 serve 类型', 'pi')
  .action(async (options) => {
    if (options.im !== 'wechat') {
      console.log('当前 agent 命令只支持 --im wechat。飞书可先使用 wb lark login/send/messages/search。')
      return
    }

    await startWechat(options.agent)
  })

program
  .command('analyze')
  .description('分析本地捕获的微信聊天记录')
  .option('--room <name>', '按群聊名称分析')
  .option('--friend <name>', '按好友昵称或备注分析')
  .option('--query <keyword>', '只分析包含关键词的消息')
  .option('--start <iso>', '开始时间 ISO 8601')
  .option('--end <iso>', '结束时间 ISO 8601')
  .option('--limit <number>', '最多读取最近 N 条本地消息', '5000')
  .option('-s, --serve <type>', '用于生成深度分析的 AI 服务', env.SERVICE_TYPE || 'ChatGPT')
  .option('--stats-only', '只输出统计，不调用 AI 服务')
  .action(async (options) => {
    const config = getWechatRuntimeConfig()
    const result = await analyzeWechatMessages({
      ...options,
      serviceType: options.serve,
      dataDir: config.dataDir,
      limit: Number(options.limit),
    })
    printAnalysisResult(result)
  })

const lark = program.command('lark').description('飞书 IM 登录、发消息和读取消息')

lark
  .command('login')
  .description('使用 lark-cli device flow 登录飞书 IM')
  .option('--scope <scope>', '指定 scope，例：im:message:readonly')
  .option('--domain <domain>', '按 domain 授权', 'im')
  .option('--no-wait', '只生成授权链接/扫码信息，不阻塞等待授权完成')
  .option('--device-code <code>', '继续完成上一次 --no-wait 返回的 device_code')
  .action(async (options) => {
    await larkLogin(options)
  })

lark
  .command('status')
  .description('查看当前飞书授权状态')
  .action(async () => {
    await larkStatus()
  })

lark
  .command('send')
  .description('发送飞书 IM 文本消息')
  .option('--as <identity>', 'user 或 bot', 'user')
  .option('--chat-id <chatId>', '群聊 ID，oc_xxx')
  .option('--user-id <userId>', '用户 open_id，ou_xxx')
  .requiredOption('--text <text>', '文本内容')
  .action(async (options) => {
    await larkSendText(options)
  })

lark
  .command('messages')
  .description('读取某个飞书群聊或 P2P 会话消息')
  .option('--as <identity>', 'user 或 bot', 'user')
  .option('--chat-id <chatId>', '群聊 ID，oc_xxx')
  .option('--user-id <userId>', '用户 open_id，ou_xxx')
  .option('--start <iso>', '开始时间 ISO 8601')
  .option('--end <iso>', '结束时间 ISO 8601')
  .option('--page-size <number>', '分页大小', '50')
  .option('--format <format>', 'json | pretty | table | ndjson | csv', 'pretty')
  .action(async (options) => {
    await larkListMessages(options)
  })

lark
  .command('search')
  .description('搜索飞书 IM 消息')
  .option('--query <keyword>', '搜索关键词')
  .option('--chat-id <chatId>', '限制群聊 ID')
  .option('--chat-type <type>', 'group 或 p2p')
  .option('--start <iso>', '开始时间 ISO 8601')
  .option('--end <iso>', '结束时间 ISO 8601')
  .option('--page-all', '自动翻页')
  .option('--page-limit <number>', '最多翻页数', '20')
  .option('--format <format>', 'json | pretty | table | ndjson | csv', 'pretty')
  .action(async (options) => {
    await larkSearchMessages(options)
  })

program
  .command('opencli')
  .description('透传调用 OpenCLI，用于本地微信、朋友圈或其他本机工具')
  .allowUnknownOption(true)
  .argument('[args...]')
  .action(async (args) => {
    await runOpenCli(args)
  })

program
  .command('wx')
  .description('通过 OpenCLI wx-cli 访问本地微信聊天、联系人、群成员和朋友圈缓存')
  .allowUnknownOption(true)
  .argument('[args...]')
  .action(async (args) => {
    await runWxCli(args)
  })

program
  .command('pi')
  .description('透传调用 Pi coding agent')
  .allowUnknownOption(true)
  .argument('[args...]')
  .action(async (args) => {
    await runPi(args)
  })

program.parseAsync().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
