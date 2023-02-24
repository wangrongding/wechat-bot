import { WechatyBuilder, ScanStatus, log } from 'wechaty'
import qrTerminal from 'qrcode-terminal'
import { defaultMessage, shardingMessage } from './sendMessage.js'
// 扫码
function onScan(qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    // 在控制台显示二维码
    qrTerminal.generate(qrcode, { small: true })
    const qrcodeImageUrl = ['https://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(qrcode)].join('')
    console.log('onScan:', qrcodeImageUrl, ScanStatus[status], status)
  } else {
    log.info('onScan: %s(%s)', ScanStatus[status], status)
  }
}

// 登录
function onLogin(user) {
  console.log(`${user} has logged in`)
  const date = new Date()
  console.log(`Current time:${date}`)
  console.log(`Automatic robot chat mode has been activated`)
}

// 登出
function onLogout(user) {
  console.log(`${user} has logged out`)
}

// 收到好友请求
async function onFriendShip(friendship) {
  const frienddShipRe = /chatgpt|chat/
  if (friendship.type() === 2) {
    if (frienddShipRe.test(friendship.hello())) {
      await friendship.accept()
    }
  }
}

/**
 * 消息发送
 * @param msg
 * @param isSharding
 * @returns {Promise<void>}
 */
async function onMessage(msg) {
  // 默认消息回复
  await defaultMessage(msg, bot)
  // 消息分片
  // await shardingMessage(msg,bot)
}

// 初始化机器人
const CHROME_BIN = process.env.CHROME_BIN ? { endpoint: process.env.CHROME_BIN } : {}
export const bot = WechatyBuilder.build({
  name: 'WechatEveryDay',
  // puppet: 'wechaty-puppet-wechat4u', // 如果有token，记得更换对应的puppet
  puppet: 'wechaty-puppet-wechat', // 如果 wechaty-puppet-wechat 存在问题，也可以尝试使用上面的 wechaty-puppet-wechat4u ，记得安装 wechaty-puppet-wechat4u
  puppetOptions: {
    uos: true,
    ...CHROME_BIN
  },
})

// 扫码
bot.on('scan', onScan)
// 登录
bot.on('login', onLogin)
// 登出
bot.on('logout', onLogout)
// 收到消息
bot.on('message', onMessage)
// 添加好友
bot.on('friendship', onFriendShip)

// 启动微信机器人
bot
  .start()
  .then(() => console.log('Start to log in wechat...'))
  .catch((e) => console.error(e))
