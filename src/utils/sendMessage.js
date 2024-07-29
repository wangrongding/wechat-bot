import dotenv from 'dotenv'
import CryptoJS from 'crypto-js'
import nodemailer from 'nodemailer'

const env = dotenv.config().parsed // 环境参数

export function sendMessage(resultText, messageType = 'qr') {
  if (checkDate()) {
    return false
  }
  try {
    switch (messageType) {
      case 'qr':
        sendMail(resultText, messageType)
        dingSend(resultText, 'markdown')
        break
      case 'error':
        sendMail(resultText, messageType)
        dingSend(resultText, 'text')
        break
      default:
        sendMail(resultText)
        dingSend(resultText)
    }
  } catch (e) {
    console.log(e)
  }
}

export function sendMail(resultText, messageType = 'text') {
  // 环境变量判空
  if (!env.MAIL_HOST || !env.MAIL_USERNAME || !env.MAIL_PASSWORD || !env.MAIL_TO) {
    return false
  }
  // 创建一个SMTP传输器
  const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST, // QQ邮箱的SMTP服务器地址
    port: env.MAIL_HOST || 465, // 通常SMTP服务器使用的端口是465（SSL）或587（TLS）
    secure: env.MAIL_HOST.toString() === '465', // 如果端口是465，则设置为true
    auth: {
      user: env.MAIL_USERNAME, // 你的邮箱地址
      pass: env.MAIL_PASSWORD, // 你的邮箱密码或授权码
    },
  })
  // 假设你有一个包含多个邮箱地址的字符串，用分号分隔
  const emailString = env.MAIL_TO
  // 使用分号将字符串分割成数组
  const emailAddresses = emailString.split(';')

  // 设置邮件选项
  let mailOptions = {
    from: env.MAIL_USERNAME, // 发件人邮箱地址
    to: emailAddresses, // 收件人邮箱地址
    subject: 'wechat-bot通知', // 邮件主题
  }
  if (messageType === 'text') {
    mailOptions.text = `【wechat-bot】：${resultText}`
  } else if (messageType === 'error') {
    mailOptions.html = `【wechat-bot报错】：${resultText}`
  } else if (messageType === 'qr') {
    mailOptions.html = `<p>【wechat-bot】微信扫码登录</p><img src="${resultText}" alt="Network Image" />`
  }

  // 发送邮件
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

// 钉钉机器人
export async function dingSend(resultText, msgtype = 'text') {
  // 环境变量判空
  if (!env.DING_TOKEN) {
    return false
  }
  // 发送钉钉消息
  try {
    const timestamp = new Date().getTime() // 时间戳
    const secret = env.DING_SIGN // 钉钉机器人密钥
    let stringToSign = `${timestamp}\n${secret}`
    let signature = CryptoJS.HmacSHA256(stringToSign, secret)
    const hashInBase64 = CryptoJS.enc.Base64.stringify(signature) //base64加密
    const encodesign = encodeURI(hashInBase64) //解密
    // 钉钉机器人地址
    let url = `https://oapi.dingtalk.com/robot/send?access_token=${env.DING_TOKEN}&timestamp=${timestamp}&sign=${encodesign}`
    // 钉钉消息内容
    let text = {
      msgtype: msgtype,
      text: {
        content: resultText,
      },
      markdown: {
        title: 'QR Code for your URL',
        text: `### 【wechat-bot】微信扫码登录\n\n![Base64 Image](${resultText})`,
      },
    }
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(text),
    })
    let responseData = await response.json()
    if (response.ok) {
      console.log('钉钉消息发送成功，返回信息:', responseData)
    } else {
      console.log('钉钉消息发送失败', responseData)
    }
  } catch (error) {
    console.log('钉钉消息发送失败', error)
  }
}

// 检测目录下是否有date.json文件，没有则创建，读取其中的date时间，超过30分钟则返回true
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
function checkDate() {
  let massageInterval
  try {
    massageInterval = Number(env.MASSAGE_INTERVAL) || 30 // 默认30分钟
  } catch (e) {
    massageInterval = 30 // 默认30分钟
  }
  let date = new Date().getTime() // 当前时间
  const fileDir = path.resolve(__dirname, 'date.json') // 文件路径
  const dirPath = path.dirname(fileDir) // 获取目录路径

  // 确保目录存在
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  if (fs.existsSync(fileDir)) {
    // 读取文件内容
    const data = fs.readFileSync(fileDir, 'utf-8')
    const jsonData = JSON.parse(data)
    console.log('读取到date.json文件，内容为：', jsonData)
    return (date - jsonData.time) / 60000 > massageInterval
  } else {
    // 创建date.json文件
    const obj = { time: date }
    fs.writeFileSync(fileDir, JSON.stringify(obj), 'utf-8')
    return true
  }
}

// 示例调用
console.log(checkDate())
