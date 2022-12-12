import { getChatGPTReply } from '../chatgpt/index.js'
import { botName, roomWhiteList, aliasWhiteList, botWechatName } from '../../config.js'

console.log(botWechatName)
console.log(botName)
console.log(roomWhiteList)
console.log(aliasWhiteList)

/**
 * 默认消息发送
 * @param msg
 * @param bot
 * @returns {Promise<void>}
 */
export async function defaultMessage(msg, bot) {
  const contact = msg.talker() // 发消息人
  const receiver = msg.to() // 消息接收人
  const content = msg.text() // 消息内容
  const room = msg.room() // 是否是群消息

  let roomName = (await room?.topic()) || null // 群名称
  const alias = (await contact.alias()) || (await contact.name()) // 发消息人昵称
  const isText = msg.type() === bot.Message.Type.Text // 消息类型是否为文本
  const isRoom = roomWhiteList.includes(roomName) && RegExp(`^@${botName}`).test(content) // 是否在群聊白名单内并且艾特了机器人
  const isAlias = aliasWhiteList.includes(alias) && RegExp(`^${botName}`).test(content) // 是否在联系人白名单内且提到机器人
  const isBotSelf = room
    ? false
    : alias == botWechatName && aliasWhiteList.includes((await receiver.alias()) || (await receiver.name())) && RegExp(`^${botName}`).test(content) // 发送方为机器人微信号，接收方在白名单内

  if (isText && ((!isRoom && (isAlias || isBotSelf)) || isRoom)) {
    console.log('🚀🚀🚀 / content', content)
    let reply = '我好像运行崩溃了🥲'
    try {
      reply = await getChatGPTReply(content.replace(RegExp(`^@?${botName}\s*`), ''))
    } catch (e) {
      console.error(e)
    }
    console.log('🤖🤖🤖 / reply', reply)
    try {
      // 区分群聊和私聊
      if (room) {
        // Room chat
        await room.say(reply)
      } else {
        // personal chat
        if (RegExp(`^${botName}`).test(reply)) {
          // in case of answer loop
          reply = ' ' + reply
        }

        if (alias == botWechatName) {
          // sender is bot itself
          await receiver.say(reply)
        } else {
          await contact.say(reply)
        }
      }
    } catch (e) {
      console.error(e)
    }
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
