import { Configuration, OpenAIApi } from 'openai'
import dotenv from 'dotenv'
const env = dotenv.config().parsed // 环境参数

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export async function getOpenAiReply(prompt) {
  console.log('🚀🚀🚀 / prompt', prompt)
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: prompt,
    temperature: 0.9,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.6,
    stop: [' Human:', ' AI:'],
  })
  const reply = response.data.choices[0].text
  console.log('🚀🚀🚀 / reply', reply)
  return reply
}
