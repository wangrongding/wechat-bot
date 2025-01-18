import CryptoJS from "crypto-js";
import dotenv from "dotenv";
import WebSocket from "ws";

const env = dotenv.config().parsed; // 环境参数

// APPID，APISecret，APIKey在 https://console.xfyun.cn/services/cbm 获取
const appID = env.XUNFEI_APP_ID;
const apiKey = env.XUNFEI_API_KEY;
const apiSecret = env.XUNFEI_API_SECRET;

// 地址必须填写，代表着大模型的版本号
const modelVersion = env.XUNFEI_MODEL_VERSION || "v4.0"; // 默认值 "v4.0"
const httpUrl = new URL(`https://spark-api.xf-yun.com/${modelVersion}/chat`);

// 判断 prompt 是否存在，如果不存在则使用默认值
const prompt = env.XUNFEI_PROMPT || "你是一个专业的智能助手";

// 动态映射模型版本到 domain 的逻辑
const modelVersionMap = {
  "v1.1": "general",
  "v2.1": "generalv2",
  "v3.1": "generalv3",
  "v3.5": "generalv3.5",
  "pro-128k": "pro-128k",
  "max-32k": "max-32k",
  "v4.0": "4.0Ultra",
};

// 获取模型域名
function getModelDomain(httpUrl) {
  try {
    const modelPath = httpUrl.pathname.split("/")[1]; // 提取版本号或模型路径
    return modelVersionMap[modelPath] || "unknown"; // 如果没有匹配，返回 "unknown"
  } catch (error) {
    console.error("获取模型域名失败:", error);
    return "unknown";
  }
}

let modelDomain = getModelDomain(httpUrl);

// 签名生成逻辑（可复用）
function generateSignature(httpUrl, apiKey, apiSecret) {
  const host = "localhost:8080";
  const date = new Date().toGMTString();
  const algorithm = "hmac-sha256";
  const headers = "host date request-line";

  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${httpUrl.pathname} HTTP/1.1`;
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);

  const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);

  const url = `wss://${httpUrl.host}${httpUrl.pathname}?authorization=${authorization}&date=${date}&host=${host}`;
  return url;
}

// 获取 WebSocket 地址
function authenticate() {
  return new Promise((resolve, reject) => {
    try {
      const url = generateSignature(httpUrl, apiKey, apiSecret);
      resolve(url);
    } catch (error) {
      console.error("认证失败:", error);
      reject(error);
    }
  });
}

// 发送消息并处理 WebSocket 逻辑
export async function xunfeiSendMsg(inputVal) {
  // 获取请求地址
  let myUrl = await authenticate();
  let socket = new WebSocket(String(myUrl));
  let total_res = ""; // 清空回答历史

  // 创建一个Promise
  let messagePromise = new Promise((resolve, reject) => {
    socket.addEventListener("open", () => {
      const params = {
        header: {
          app_id: appID,
          uid: "fd3f47e4-d",
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
            text: [
              { role: "system", content: prompt },
              { role: "user", content: inputVal }, // 最新的问题
            ],
          },
        },
      };
      socket.send(JSON.stringify(params));
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(String(event.data));
      if (data.header.code !== 0) {
        console.error("Socket 出错:", data.header.code, data.header.message);
        socket.close();
        reject("");
      } else if (data.payload.choices.text && data.header.status === 2) {
        total_res += data.payload.choices.text[0].content;
        setTimeout(() => {
          socket.close();
        }, 1000);
      }
    });

    socket.addEventListener("close", () => {
      resolve(total_res);
    });

    socket.addEventListener("error", (event) => {
      console.error("Socket 连接错误:", event);
      reject("");
    });
  });

  return await messagePromise;
}
