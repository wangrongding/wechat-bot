import { xunfeiSendMsg } from './xunfei.js'

export async function getXunfeiReply(prompt, name) {
  console.log('🚀🚀🚀 / prompt', prompt)
  let reply = await xunfeiSendMsg(prompt)

  if (typeof name != 'undefined') reply = `@${name}\n ${reply}`
  return `${reply}`
}
