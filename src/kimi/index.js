import axios from 'axios'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import FormData from 'form-data'

const env = dotenv.config().parsed // 环境参数

const domain = 'https://api.moonshot.cn'
const server = {
  chat: `${domain}/v1/chat/completions`,
  models: `${domain}/v1/models`,
  files: `${domain}/v1/files`,
  token: `${domain}/v1/tokenizers/estimate-token-count`,
}

// 默认请求头配置
const getHeaders = (contentType = 'application/json') => ({
  'Content-Type': contentType,
  Authorization: `Bearer ${env.KIMI_API_KEY}`,
})

// ==================== 统一返回格式 ====================

/**
 * 创建成功响应
 * @param {any} data - 返回数据
 * @returns {Object} - 统一格式响应
 */
function success(data) {
  return { success: true, data, error: null }
}

/**
 * 创建失败响应
 * @param {string} code - 错误代码
 * @param {string} message - 错误信息
 * @returns {Object} - 统一格式响应
 */
function failure(code, message) {
  return { success: false, data: null, error: { code, message } }
}

// 错误代码常量
export const ErrorCodes = {
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_EMPTY: 'FILE_EMPTY',
  INVALID_PARAMS: 'INVALID_PARAMS',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  API_ERROR: 'API_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
}

// 文件大小限制 (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024

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
    否则我们服务会返回不合法的输入参数（ invalid_request_error ），并拒绝回答。如果您希望获得"输入的精确 token 数"，可以使用下面的"计算 Token" API 使用我们的计算器获得计数。
  */
  max_tokens: 5000,
  /*
    是否流式返回, 默认 false, 可选 true
  */
  stream: true,
}

/**
 * 获取 Kimi 回复
 * @param {string} prompt - 用户输入
 * @returns {Promise<Object>} - 统一格式响应 { success, data, error }
 */
export async function getKimiReply(prompt) {
  try {
    const res = await axios.post(
      server.chat,
      {
        ...configuration,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'moonshot-v1-128k',
      },
      {
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.KIMI_API_KEY}`,
        },
      },
    )
    if (!configuration.stream) {
      return success(res.data.choices[0].message.content)
    }

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
    return success(result)
  } catch (error) {
    return parseError(error)
  }
}

// ==================== 文件操作 API ====================

/**
 * 验证文件是否有效
 * @param {string} filePath - 文件路径
 * @returns {Object|null} - 验证失败返回错误对象，成功返回 null
 */
function validateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return failure(ErrorCodes.FILE_NOT_FOUND, `文件不存在: ${filePath}`)
  }

  const stats = fs.statSync(filePath)
  if (stats.size === 0) {
    return failure(ErrorCodes.FILE_EMPTY, `文件为空: ${filePath}`)
  }

  if (stats.size > MAX_FILE_SIZE) {
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
    return failure(ErrorCodes.FILE_TOO_LARGE, `文件大小 ${sizeMB}MB 超过限制 50MB: ${filePath}`)
  }

  return null
}

/**
 * 上传文件到 Kimi 服务器
 * @param {string} filePath - 本地文件路径
 * @param {string} purpose - 文件用途，默认为 'file-extract'（文件内容提取），可选 'retrieval'（检索增强）
 * @returns {Promise<Object>} - 统一格式响应 { success, data, error }
 */
export async function uploadFile(filePath, purpose = 'file-extract') {
  try {
    // 客户端文件验证
    const validationError = validateFile(filePath)
    if (validationError) return validationError

    const formData = new FormData()
    formData.append('file', fs.createReadStream(filePath))
    formData.append('purpose', purpose)

    const res = await axios.post(server.files, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${env.KIMI_API_KEY}`,
      },
      timeout: 60000,
    })

    console.log('📤 文件上传成功:', res.data.id)
    return success(res.data)
  } catch (error) {
    return parseError(error, ErrorCodes.UPLOAD_FAILED)
  }
}

/**
 * 获取文件列表
 * @param {string} purpose - 筛选文件用途，可选 'file-extract' 或 'retrieval'
 * @returns {Promise<Object>} - 统一格式响应 { success, data, error }
 */
export async function listFiles(purpose = null) {
  try {
    const params = purpose ? { purpose } : {}
    const res = await axios.get(server.files, {
      params,
      headers: getHeaders(),
      timeout: 30000,
    })

    const files = res.data.data || []
    console.log('📋 获取文件列表成功，共', files.length, '个文件')
    return success(files)
  } catch (error) {
    return parseError(error)
  }
}

/**
 * 获取文件信息
 * @param {string} fileId - 文件ID
 * @returns {Promise<Object>} - 统一格式响应 { success, data, error }
 */
export async function getFile(fileId) {
  try {
    if (!fileId) {
      return failure(ErrorCodes.INVALID_PARAMS, 'fileId 不能为空')
    }

    const res = await axios.get(`${server.files}/${fileId}`, {
      headers: getHeaders(),
      timeout: 30000,
    })

    return success(res.data)
  } catch (error) {
    return parseError(error)
  }
}

/**
 * 删除文件
 * @param {string} fileId - 文件ID
 * @returns {Promise<Object>} - 统一格式响应 { success, data, error }
 */
export async function deleteFile(fileId) {
  try {
    if (!fileId) {
      return failure(ErrorCodes.INVALID_PARAMS, 'fileId 不能为空')
    }

    const res = await axios.delete(`${server.files}/${fileId}`, {
      headers: getHeaders(),
      timeout: 30000,
    })

    console.log('🗑️ 文件删除成功:', fileId)
    return success(res.data.deleted || true)
  } catch (error) {
    return parseError(error)
  }
}

/**
 * 获取文件内容
 * @param {string} fileId - 文件ID
 * @returns {Promise<Object>} - 统一格式响应 { success, data, error }
 */
export async function getFileContent(fileId) {
  try {
    if (!fileId) {
      return failure(ErrorCodes.INVALID_PARAMS, 'fileId 不能为空')
    }

    const res = await axios.get(`${server.files}/${fileId}/content`, {
      headers: getHeaders(),
      timeout: 30000,
    })

    return success(res.data.content || res.data)
  } catch (error) {
    return parseError(error)
  }
}

// ==================== 带文件的对话功能 ====================

/**
 * 上传文件并进行对话
 * @param {string} filePath - 本地文件路径
 * @param {string} prompt - 用户提问
 * @param {Object} options - 可选配置
 * @returns {Promise<Object>} - 统一格式响应 { success, data, error }
 */
export async function chatWithFile(filePath, prompt, options = {}) {
  try {
    // 1. 上传文件
    const uploadResult = await uploadFile(filePath, 'file-extract')
    if (!uploadResult.success) {
      return uploadResult
    }
    const fileInfo = uploadResult.data

    // 2. 等待文件处理完成（轮询检查状态）
    let fileStatus = fileInfo.status
    let attempts = 0
    const maxAttempts = options.maxAttempts || 30
    const pollInterval = options.pollInterval || 2000

    while (fileStatus !== 'processed' && attempts < maxAttempts) {
      await sleep(pollInterval)
      const fileResult = await getFile(fileInfo.id)
      if (!fileResult.success) {
        return failure(ErrorCodes.PROCESSING_FAILED, '获取文件状态失败')
      }
      fileStatus = fileResult.data.status
      attempts++
      console.log(`⏳ 文件处理中... 状态: ${fileStatus}, 尝试: ${attempts}/${maxAttempts}`)
    }

    if (fileStatus !== 'processed') {
      return failure(ErrorCodes.TIMEOUT, '文件处理超时')
    }

    // 3. 发起带文件的对话请求
    const res = await axios.post(
      server.chat,
      {
        model: options.model || configuration.model,
        messages: [
          {
            role: 'system',
            content: '你是一个有帮助的助手，可以根据用户上传的文件内容回答问题。',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'file', file_id: fileInfo.id },
            ],
          },
        ],
        temperature: options.temperature || configuration.temperature,
        max_tokens: options.max_tokens || configuration.max_tokens,
        stream: false,
      },
      {
        headers: getHeaders(),
        timeout: 120000,
      },
    )

    const result = res.data.choices[0].message.content

    // 4. 清理：删除上传的文件（可选）
    if (options.autoDelete !== false) {
      await deleteFile(fileInfo.id)
    }

    return success(result)
  } catch (error) {
    return parseError(error)
  }
}

/**
 * 批量上传多个文件并对话
 * @param {Array<string>} filePaths - 文件路径数组
 * @param {string} prompt - 用户提问
 * @param {Object} options - 可选配置
 * @returns {Promise<Object>} - 统一格式响应 { success, data, error }
 */
export async function chatWithMultipleFiles(filePaths, prompt, options = {}) {
  try {
    if (!filePaths || filePaths.length === 0) {
      return failure(ErrorCodes.INVALID_PARAMS, '文件路径列表不能为空')
    }

    // 1. 批量上传文件
    const uploadPromises = filePaths.map((filePath) => uploadFile(filePath, 'file-extract'))
    const uploadResults = await Promise.all(uploadPromises)

    const failedUploads = uploadResults.filter((result) => !result.success)
    if (failedUploads.length > 0) {
      console.warn(`⚠️ ${failedUploads.length} 个文件上传失败`)
    }

    const successfulUploads = uploadResults.filter((result) => result.success)
    if (successfulUploads.length === 0) {
      return failure(ErrorCodes.UPLOAD_FAILED, '所有文件上传失败')
    }

    // 2. 等待所有文件处理完成
    const fileIds = successfulUploads.map((result) => result.data.id)
    const waitResult = await waitForFilesProcessed(fileIds, options)
    if (!waitResult.success) {
      return waitResult
    }

    // 3. 构建消息内容
    const content = [{ type: 'text', text: prompt }]
    fileIds.forEach((fileId) => {
      content.push({ type: 'file', file_id: fileId })
    })

    // 4. 发起对话请求
    const res = await axios.post(
      server.chat,
      {
        model: options.model || configuration.model,
        messages: [
          {
            role: 'system',
            content: '你是一个有帮助的助手，可以根据用户上传的多个文件内容回答问题。',
          },
          { role: 'user', content },
        ],
        temperature: options.temperature || configuration.temperature,
        max_tokens: options.max_tokens || configuration.max_tokens,
        stream: false,
      },
      {
        headers: getHeaders(),
        timeout: 120000,
      },
    )

    const result = res.data.choices[0].message.content

    // 5. 清理：删除上传的文件
    if (options.autoDelete !== false) {
      await Promise.all(fileIds.map((fileId) => deleteFile(fileId)))
    }

    return success(result)
  } catch (error) {
    return parseError(error)
  }
}

// ==================== 辅助函数 ====================

/**
 * 等待文件处理完成
 * @param {Array<string>} fileIds - 文件ID数组
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} - 统一格式响应
 */
async function waitForFilesProcessed(fileIds, options = {}) {
  const maxAttempts = options.maxAttempts || 30
  const pollInterval = options.pollInterval || 2000

  for (const fileId of fileIds) {
    let status = 'pending'
    let attempts = 0

    while (status !== 'processed' && attempts < maxAttempts) {
      await sleep(pollInterval)
      const fileResult = await getFile(fileId)
      if (fileResult.success) {
        status = fileResult.data.status
      }
      attempts++
    }

    if (status !== 'processed') {
      return failure(ErrorCodes.TIMEOUT, `文件 ${fileId} 处理超时`)
    }
  }

  return success(true)
}

/**
 * 延迟函数
 * @param {number} ms - 延迟毫秒数
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 解析错误并返回统一格式
 * @param {Error} error - 错误对象
 * @param {string} defaultCode - 默认错误代码
 * @returns {Object} - 统一格式错误响应
 */
function parseError(error, defaultCode = ErrorCodes.API_ERROR) {
  let code = defaultCode
  let message = error.message || '未知错误'

  // 根据 HTTP 状态码映射错误类型
  if (error.response) {
    const status = error.response.status
    if (status === 401) {
      code = ErrorCodes.AUTH_ERROR
      message = '鉴权失败，请检查 API_KEY 是否正确'
    } else if (status === 429) {
      code = ErrorCodes.RATE_LIMIT
      message = '请求频率过高，请稍后重试'
    } else if (status === 408 || error.code === 'ECONNABORTED') {
      code = ErrorCodes.TIMEOUT
      message = '请求超时'
    } else if (error.response.data?.error?.message) {
      message = error.response.data.error.message
    }
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    code = ErrorCodes.NETWORK_ERROR
    message = '网络连接失败'
  } else if (error.code === 'ECONNABORTED') {
    code = ErrorCodes.TIMEOUT
    message = '请求超时'
  }

  console.error(`[Kimi Error] ${code}: ${message}`)
  return failure(code, message)
}
