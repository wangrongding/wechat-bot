import axios from 'axios'
import { botName, roomWhiteList, aliasWhiteList } from '../../config.js'
import { getServe } from './serve.js'
import { FileBox } from 'file-box'
import puppeteer from 'puppeteer'
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
})
let avlist = []
axios.interceptors.request.use(config => {
  if (/get/i.test(config.method)) { //判断get请求
    config.params = config.params || {};
    config.params.t = Date.parse(new Date()) / 1000; //添加时间戳
  }
  return config;
}, error => {
  return Promise.reject(error);
})
/**
 * 默认消息发送
 * @param msg
 * @param bot
 * @param ServiceType 服务类型 'GPT' | 'Kimi'
 * @returns {Promise<void>}
 */
export async function defaultMessage(msg, bot, ServiceType = 'GPT') {
  const getReply = getServe(ServiceType)
  const contact = msg.talker() // 发消息人
  const receiver = msg.to() // 消息接收人
  const content = msg.text() // 消息内容
  const room = msg.room() // 是否是群消息
  const roomName = (await room?.topic()) || null // 群名称
  const alias = (await contact.alias()) || (await contact.name()) // 发消息人昵称
  const remarkName = await contact.alias() // 备注名称
  const name = await contact.name() // 微信名称
  const isText = msg.type() === bot.Message.Type.Text // 消息类型是否为文本
  const isRoom = roomWhiteList.includes(roomName) //&& content.includes(`${botName}`) // 是否在群聊白名单内并且艾特了机器人
  const isAlias = aliasWhiteList.includes(remarkName) || aliasWhiteList.includes(name) // 发消息的人是否在联系人白名单内
  const isBotSelf = botName === remarkName || botName === name // 是否是机器人自己
  // TODO 你们可以根据自己的需求修改这里的逻辑
  if (isBotSelf || !isText) return // 如果是机器人自己发送的消息或者消息类型不是文本则不处理
  try {
    // 区分群聊和私聊
    if (isRoom && room) {
      const question = await msg.mentionText()
      console.log('🌸🌸🌸 / question: ', question)
      // const response = await getReply(question)
      const members = await room.memberList()
      const regexVideo = /烧鸡/;
      const regexIamge = /涩图/
      // const mentionText = members.map(member => `@${member.name()}`).join(' ');
      if (question === '五排') {
        await room.say(`五排有无?`, ...members)
      }
      if (regexVideo.test(question)) {
        axios('https://api.qtkj.love/api/qttj.php', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        }).then(async (res) => {
          const url = res
          const fileBox = FileBox.fromUrl(url.request.res.responseUrl)
          await room.say(fileBox)

        })
        // fetch("https://api.qtkj.love/api/qttj.php", {
        //   method: "GET",
        // }).then(async (res) => {
        //   const url = await res;
        //   const fileBox = FileBox.fromUrl(url.url)
        //   `await room.say(fileBox)`
        // })
      }
      if (regexIamge.test(question)) {
        axios('https://api.lolicon.app/setu/v2?r18=1&excludeAI=true', {
          method: 'GET',
        }).then(async res => {
          const url = res
          // console.log(url.data.data[0].urls.original)
          const fileBox = FileBox.fromUrl(url.data.data[0].urls.original)
          await room.say(fileBox)
        })
        // const fileBox = FileBox.fromUrl('https://image.anosu.top/pixiv/direct?r18=1')
        // await room.say('https://image.anosu.top/pixiv/direct?r18=1')
      }
      if (question === '每日推荐') {
        if (avlist.length == 0) {
          avlist = await onPy()
        }
        const random = Math.floor(Math.random() * 13)
        const fileBoxUrl = FileBox.fromUrl(avlist[random].img)
        await room.say(fileBoxUrl)
        await room.say(`标题：${avlist[random].title}\n链接：${avlist[random].link}`)
      }
    }
    // 私人聊天，白名单内的直接发送
    if (isAlias && !room) {
      console.log('🌸🌸🌸 / content: ', content)
      // const response = await getReply(content)
      await contact.say('你好')
    }
  } catch (e) {
    console.error(e)
  }

}

/**
 * 分片消息发送
 * @param message
 * @param bot
 * @returns {Promise<void>}
 */
export async function shardingMessage(message, bot) {
  const talker = message.talker()
  const isText = message.type() === bot.Message.Type.Text // 消息类型是否为文本
  if (talker.self() || message.type() > 10 || (talker.name() === '微信团队' && isText)) {
    return
  }
  const text = message.text()
  const room = message.room()
  if (!room) {
    console.log(`Chat GPT Enabled User: ${talker.name()}`)
    const response = await getChatGPTReply(text)
    await trySay(talker, response)
    return
  }
  let realText = splitMessage(text)
  // 如果是群聊但不是指定艾特人那么就不进行发送消息
  if (text.indexOf(`${botName}`) === -1) {
    return
  }
  realText = text.replace(`${botName}`, '')
  const topic = await room.topic()
  const response = await getChatGPTReply(realText)
  const result = `${realText}\n ---------------- \n ${response}`
  await trySay(room, result)
}

// 分片长度
const SINGLE_MESSAGE_MAX_SIZE = 500

/**
 * 发送
 * @param talker 发送哪个  room为群聊类 text为单人
 * @param msg
 * @returns {Promise<void>}
 */
async function trySay(talker, msg) {
  const messages = []
  let message = msg
  while (message.length > SINGLE_MESSAGE_MAX_SIZE) {
    messages.push(message.slice(0, SINGLE_MESSAGE_MAX_SIZE))
    message = message.slice(SINGLE_MESSAGE_MAX_SIZE)
  }
  messages.push(message)
  for (const msg of messages) {
    await talker.say(msg)
  }
}

/**
 * 分组消息
 * @param text
 * @returns {Promise<*>}
 */
async function splitMessage(text) {
  let realText = text
  const item = text.split('- - - - - - - - - - - - - - -')
  if (item.length > 1) {
    realText = item[item.length - 1]
  }
  return realText
}
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
async function onPy() {
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36");
  await page.goto('https://missav.com/dm229/cn/today-hot');
  await sleep(3000)
  await page.waitForSelector('.grid', { timeout: 0 });
  const av = await page.$eval('.grid', el => {
    return [...el.querySelectorAll('.thumbnail')].map(item => {
      return {
        title: item.querySelector('a').querySelector('img')?.alt,
        img: item.querySelector('a').querySelector('img')?.src,
        link: item.querySelector('a').href
      }
    })
  });
  return av
}
