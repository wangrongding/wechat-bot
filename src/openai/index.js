import { remark } from 'remark'
import stripMarkdown from 'strip-markdown'
import { Configuration, OpenAIApi } from 'openai'
import dotenv from 'dotenv'
const env = dotenv.config().parsed // 环境参数

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export async function getGptReply(prompt) {
  console.log('🚀🚀🚀 / prompt', prompt)
  //let chosen_model = 'text-davinci-003'
  let chosen_model = 'gpt-3.5-turbo'
  let reply = ''
  //'gpt-3.5-turbo',
  if (chosen_model == 'text-davinci-003') {
    console.log('🚀🚀🚀 / Using model', chosen_model)
    const response = await openai.createCompletion({
      model: chosen_model,
      prompt: prompt,
      temperature: 0.8, // 每次返回的答案的相似度0-1（0：每次都一样，1：每次都不一样）
      max_tokens: 4_000,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.6,
      stop: [' Human:', ' AI:'],
    })

    reply = markdownToText(response.data.choices[0].text)
  } else if (chosen_model == 'gpt-3.5-turbo') {
    console.log('🚀🚀🚀 / Using model', chosen_model)
    const response = await openai.createChatCompletion({
      model: chosen_model,
      messages: [
        { "role": "system", content: "You are a personal assistant." },
        { "role": "user", content: prompt }
      ]
    })

    reply = markdownToText(response.data.choices[0].message.content)
  }
  console.log('🚀🚀🚀 / reply', reply)
  return `${reply}\nVia ${chosen_model}`
}

function markdownToText(markdown) {
  return remark()
    .use(stripMarkdown)
    .processSync(markdown ?? '')
    .toString()
}


