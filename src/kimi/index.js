import axios from 'axios'
import dotenv from 'dotenv'
const env = dotenv.config().parsed // 环境参数

const domain = 'https://api.moonshot.cn'
const server = {
  chat: `${domain}/v1/chat/completions`,
  models: `${domain}/v1/models`,
  files: `${domain}/v1/files`,
  token: `${domain}/v1/tokenizers/estimate-token-count`,
  // 这块还可以实现上传文件让 kimi 读取并交互等操作
  // 具体参考文档： https://platform.moonshot.cn/docs/api-reference#api-%E8%AF%B4%E6%98%8E
  // 由于我近期非常忙碌，这块欢迎感兴趣的同学提 PR ，我会很快合并
}

const configuration = {
  // 参数详情请参考 https://platform.moonshot.cn/docs/api-reference#%E5%AD%97%E6%AE%B5%E8%AF%B4%E6%98%8E
  /* 
    Model ID, 可以通过 List Models 获取
    目前可选 moonshot-v1-8k | moonshot-v1-32k | moonshot-v1-128k
  */
  model: 'moonshot-v1-8k',
  /* 
    使用什么采样温度，介于 0 和 1 之间。较高的值（如 0.7）将使输出更加随机，而较低的值（如 0.2）将使其更加集中和确定性。
    如果设置，值域须为 [0, 1] 我们推荐 0.3，以达到较合适的效果。
  */
  temperature: 0.3,
  /* 
    聊天完成时生成的最大 token 数。如果到生成了最大 token 数个结果仍然没有结束，finish reason 会是 "length", 否则会是 "stop"
    这个值建议按需给个合理的值，如果不给的话，我们会给一个不错的整数比如 1024。特别要注意的是，这个 max_tokens 是指您期待我们返回的 token 长度，而不是输入 + 输出的总长度。
    比如对一个 moonshot-v1-8k 模型，它的最大输入 + 输出总长度是 8192，当输入 messages 总长度为 4096 的时候，您最多只能设置为 4096，
    否则我们服务会返回不合法的输入参数（ invalid_request_error ），并拒绝回答。如果您希望获得“输入的精确 token 数”，可以使用下面的“计算 Token” API 使用我们的计算器获得计数。
  */
  max_tokens: 5000,
  /* 
    是否流式返回, 默认 false, 可选 true
  */
  stream: true,
}

export async function getKimiReply(prompt) {
  try {
    const res = await axios.post(
      server.chat,
      Object.assign(configuration, {
        /* 
        包含迄今为止对话的消息列表。
        要保持对话的上下文，需要将之前的对话历史并入到该数组
        这是一个结构体的列表，每个元素类似如下：{"role": "user", "content": "你好"} role 只支持 system,user,assistant 其一，content 不得为空
      */
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'moonshot-v1-128k',
      }),
      {
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.KIMI_API_KEY}`,
        },
        // pass a http proxy agent
        // proxy: {
        //   host: 'localhost',
        //   port: 7890,
        // }
      },
    )
    if (!configuration.stream) return res.data.choices[0].message.content

    let result = ''
    const lines = res.data.split('\n').filter((line) => line.trim() !== '')
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const messageObj = line.substring(6)
        if (messageObj === '[DONE]') break
        const message = JSON.parse(messageObj)
        if (message.choices && message.choices[0].delta && message.choices[0].delta.content) {
          result += message.choices[0].delta.content
        }
      }
    }
    return result
  } catch (error) {
    console.log('Kimi 错误对应详情可参考官网： https://platform.moonshot.cn/docs/api-reference#%E9%94%99%E8%AF%AF%E8%AF%B4%E6%98%8E')
    console.log('常见的 401 一般意味着你鉴权失败, 请检查你的 API_KEY 是否正确。')
    console.log('常见的 429 一般意味着你被限制了请求频次，请求频率过高，或 kimi 服务器过载，可以适当调整请求频率，或者等待一段时间再试。')
    console.error(error.code)
    console.error(error.message)
  }
}
