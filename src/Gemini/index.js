import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv'
const env = dotenv.config().parsed // 环境参数
import fs from 'fs'
import path from 'path'

const __dirname = path.resolve()
// 判断是否有 .env 文件, 没有则报错
const envPath = path.join(__dirname, '.env')
if (!fs.existsSync(envPath)) {
  console.log('❌ 请先根据文档，创建并配置.env文件！')
  process.exit(1)
}

if (!env.GEMINI_API_KEY) {
    console.log('❌ 请先根据文档，配置GEMINI_API_KEY!')
    process.exit(1)
}

let config = {
  apiKey: env.GEMINI_API_KEY,
  // 如果没有配置model，则默认使用gemini-2.5-flash
  baseModel: env.GEMINI_MODEL ? env.GEMINI_MODEL : "gemini-2.5-flash"
}

const gemini = new GoogleGenAI(config)

export async function getGeminiReply(prompt) {
    if (!prompt) {
        console.warn('⚠️ Warning: Received empty prompt.');
        return '';
    }
    console.log('🚀🚀🚀 / prompt', prompt)
    try {
        const response = await gemini.models.generateContent({
            model: config.baseModel,
            contents: prompt,
        });
        if (!response || !response.text) {
            console.warn('⚠️ Warning: Empty response from Gemini (possibly blocked by safety settings).');
            return '';
        }
        console.log('🚀🚀🚀 / reply', response.text);
        return `${response.text}`
    } catch (error){ 
        console.error('❌ Gemini API Error:', error.message);
        return '';
    }
}
