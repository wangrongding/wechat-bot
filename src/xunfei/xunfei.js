import CryptoJS from 'crypto-js'
import dotenv from 'dotenv'
import WebSocket from 'ws'

const env = dotenv.config().parsed // 环境参数
// APPID，APISecret，APIKey在https://console.xfyun.cn/services/cbm这里获取
// 星火认知大模型WebAPI文档:https://www.xfyun.cn/doc/spark/Web.html
// SDK&API错误码查询:https://www.xfyun.cn/document/error-code?code=
const appID = env.XUNFEI_APP_ID
const apiKey = env.XUNFEI_API_KEY
const apiSecret = env.XUNFEI_API_SECRET
// 地址必须填写，代表着大模型的版本号！！！！！！！！！！！！！！！！
const httpUrl = new URL('https://spark-api.xf-yun.com/v3.5/chat')

let modelDomain // V1.1-V3.5动态获取，高于以上版本手动指定
function authenticate() {
  // console.log(httpUrl.pathname)
  // 动态获取domain信息
  switch (httpUrl.pathname) {
    case '/v1.1/chat':
      modelDomain = 'general'
      break
    case '/v2.1/chat':
      modelDomain = 'generalv2'
      break
    case '/v3.1/chat':
      modelDomain = 'generalv3'
      break
    case '/v3.5/chat':
      modelDomain = 'generalv3.5'
      break
  }

  return new Promise((resolve, reject) => {
    let url = 'wss://' + httpUrl.host + httpUrl.pathname

    let host = 'localhost:8080'
    let date = new Date().toGMTString()
    let algorithm = 'hmac-sha256'
    let headers = 'host date request-line'
    let signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${httpUrl.pathname} HTTP/1.1`
    let signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
    let signature = CryptoJS.enc.Base64.stringify(signatureSha)
    let authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
    let authorization = btoa(authorizationOrigin)
    url = `${url}?authorization=${authorization}&date=${date}&host=${host}`
    resolve(url)
  })
}

export async function xunfeiSendMsg(inputVal) {
  // 获取请求地址
  let myUrl = await authenticate()
  let socket = new WebSocket(String(myUrl))
  let total_res = '' // 请空回答历史

  // 创建一个Promise
  let messagePromise = new Promise((resolve, reject) => {
    // 监听websocket的各阶段事件 并做相应处理
    socket.addEventListener('open', (event) => {
      // console.log('socket开启连接', event);
      // 发送消息
      let params = {
        header: {
          app_id: appID,
          uid: 'fd3f47e4-d',
        },
        parameter: {
          chat: {
            domain: modelDomain,
            temperature: 0.8,
            max_tokens: 1024,
          },
        },
        payload: {
          message: {
            // 如果想获取结合上下文的回答，需要开发者每次将历史问答信息一起传给服务端，如下示例
            // 注意：text里面的所有content内容加一起的tokens需要控制在8192以内，开发者如有较长对话需求，需要适当裁剪历史信息
            text: [
              { role: 'user', content: '你是谁' }, //# 用户的历史问题
              { role: 'assistant', content: '你是一个专业的智能助手' }, //# AI的历史回答结果
              // ....... 省略的历史对话
              { role: 'user', content: inputVal }, //# 最新的一条问题，如无需上下文，可只传最新一条问题
            ],
          },
        },
      }
      socket.send(JSON.stringify(params))
    })

    socket.addEventListener('message', (event) => {
      let data = JSON.parse(String(event.data))
      total_res += data.payload.choices.text[0].content
      if (data.header.code !== 0) {
        console.log('socket出错了', data.header.code, ':', data.header.message)
        // 出错了"手动关闭连接"
        socket.close()
        reject('')
      }
      if (data.header.code === 0) {
        // 对话已经完成
        if (data.payload.choices.text && data.header.status === 2) {
          total_res += data.payload.choices.text[0].content
          setTimeout(() => {
            // "对话完成，手动关闭连接"
            socket.close()
          }, 1000)
        }
      }
    })

    socket.addEventListener('close', (event) => {
      console.log('socket 连接关闭')
      // 对话完成后socket会关闭，将聊天记录换行处理
      resolve(total_res)
    })

    socket.addEventListener('error', (event) => {
      console.log('socket连接错误', event)
      reject('')
    })
  })

  return await messagePromise
}
