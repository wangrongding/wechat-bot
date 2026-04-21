/**
 * Kimi 文件上传功能测试用例
 *
 * API 端点: POST https://api.moonshot.cn/v1/files
 * 文档参考: https://platform.moonshot.cn/docs/api-reference
 */

import axios from 'axios'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

const env = dotenv.config().parsed

const KIMI_API_BASE = 'https://api.moonshot.cn'

// ============================================
// 测试工具函数
// ============================================

/**
 * 上传文件到 Kimi
 * @param {string} filePath - 文件路径
 * @param {string} purpose - 用途，默认 'file-extract'
 * @returns {Promise<Object>} 上传结果
 */
export async function uploadFile(filePath, purpose = 'file-extract') {
  const fileStream = fs.createReadStream(filePath)
  const fileName = path.basename(filePath)

  try {
    const response = await axios.post(
      `${KIMI_API_BASE}/v1/files`,
      {
        file: fileStream,
        purpose: purpose,
      },
      {
        headers: {
          Authorization: `Bearer ${env.KIMI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000,
      }
    )
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      statusCode: error.response?.status,
    }
  }
}

/**
 * 获取文件列表
 * @returns {Promise<Object>} 文件列表
 */
export async function listFiles() {
  try {
    const response = await axios.get(`${KIMI_API_BASE}/v1/files`, {
      headers: {
        Authorization: `Bearer ${env.KIMI_API_KEY}`,
      },
    })
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * 获取文件信息
 * @param {string} fileId - 文件ID
 * @returns {Promise<Object>} 文件信息
 */
export async function getFile(fileId) {
  try {
    const response = await axios.get(`${KIMI_API_BASE}/v1/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${env.KIMI_API_KEY}`,
      },
    })
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * 删除文件
 * @param {string} fileId - 文件ID
 * @returns {Promise<Object>} 删除结果
 */
export async function deleteFile(fileId) {
  try {
    const response = await axios.delete(`${KIMI_API_BASE}/v1/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${env.KIMI_API_KEY}`,
      },
    })
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * 获取文件内容
 * @param {string} fileId - 文件ID
 * @returns {Promise<Object>} 文件内容
 */
export async function getFileContent(fileId) {
  try {
    const response = await axios.get(`${KIMI_API_BASE}/v1/files/${fileId}/content`, {
      headers: {
        Authorization: `Bearer ${env.KIMI_API_KEY}`,
      },
    })
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * 带文件的对话
 * @param {string} prompt - 用户问题
 * @param {string[]} fileIds - 文件ID数组
 * @returns {Promise<Object>} 对话结果
 */
export async function getKimiReplyWithFiles(prompt, fileIds = []) {
  try {
    // 构建消息内容，包含文件引用
    const content = []

    // 添加文件引用
    for (const fileId of fileIds) {
      content.push({
        type: 'file',
        file_id: fileId,
      })
    }

    // 添加文本问题
    content.push({
      type: 'text',
      text: prompt,
    })

    const response = await axios.post(
      `${KIMI_API_BASE}/v1/chat/completions`,
      {
        model: 'moonshot-v1-128k',
        messages: [
          {
            role: 'user',
            content: content,
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.KIMI_API_KEY}`,
        },
        timeout: 120000,
      }
    )

    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      statusCode: error.response?.status,
    }
  }
}

// ============================================
// 测试用例
// ============================================

const testCases = {
  /**
   * TC-01: 正常上传 PDF 文件
   */
  'TC-01': {
    name: '正常上传 PDF 文件',
    description: '验证 PDF 文件可以正常上传',
    category: '正向测试',
    priority: 'P0',
    steps: [
      '准备一个有效的 PDF 文件 (大小 < 100MB)',
      '调用 uploadFile API 上传文件',
      '验证返回状态码为 200',
      '验证返回数据包含 file_id',
      '验证文件状态为 processed',
    ],
    expected: {
      statusCode: 200,
      hasFileId: true,
      status: 'processed',
    },
  },

  /**
   * TC-02: 上传 TXT 文本文件
   */
  'TC-02': {
    name: '上传 TXT 文本文件',
    description: '验证 TXT 文件可以正常上传',
    category: '正向测试',
    priority: 'P0',
    steps: [
      '准备一个有效的 TXT 文件',
      '调用 uploadFile API 上传文件',
      '验证上传成功',
    ],
    expected: { statusCode: 200, hasFileId: true },
  },

  /**
   * TC-03: 上传 DOCX 文档文件
   */
  'TC-03': {
    name: '上传 DOCX 文档文件',
    description: '验证 DOCX 文件可以正常上传',
    category: '正向测试',
    priority: 'P1',
    steps: [
      '准备一个有效的 DOCX 文件',
      '调用 uploadFile API 上传文件',
      '验证上传成功',
    ],
    expected: { statusCode: 200, hasFileId: true },
  },

  /**
   * TC-04: 上传 Markdown 文件
   */
  'TC-04': {
    name: '上传 Markdown 文件',
    description: '验证 MD 文件可以正常上传',
    category: '正向测试',
    priority: 'P1',
    steps: [
      '准备一个有效的 .md 文件',
      '调用 uploadFile API 上传文件',
      '验证上传成功',
    ],
    expected: { statusCode: 200, hasFileId: true },
  },

  /**
   * TC-05: 上传超大文件
   */
  'TC-05': {
    name: '上传超大文件 (>50MB)',
    description: '验证超过大小限制的文件被正确拒绝 (限制为 50MB)',
    category: '边界测试',
    priority: 'P0',
    steps: [
      '准备一个超过 50MB 的文件',
      '调用 uploadFile API 上传文件',
      '验证返回错误码',
    ],
    expected: {
      statusCode: 400,
      errorCode: 'file_too_large',
    },
  },

  /**
   * TC-06: 上传空文件
   */
  'TC-06': {
    name: '上传空文件',
    description: '验证空文件的处理',
    category: '边界测试',
    priority: 'P1',
    steps: [
      '准备一个 0 字节的空文件',
      '调用 uploadFile API 上传文件',
      '验证返回结果',
    ],
    expected: {
      statusCode: 400,
      errorCode: 'invalid_file',
    },
  },

  /**
   * TC-07: 上传不支持的文件格式
   */
  'TC-07': {
    name: '上传不支持的文件格式',
    description: '验证不支持的格式被正确拒绝',
    category: '负向测试',
    priority: 'P0',
    steps: [
      '准备一个 .exe 或 .zip 文件',
      '调用 uploadFile API 上传文件',
      '验证返回错误码',
    ],
    expected: {
      statusCode: 400,
      errorCode: 'unsupported_file_type',
    },
  },

  /**
   * TC-08: 无 API Key 上传
   */
  'TC-08': {
    name: '无认证上传文件',
    description: '验证缺少认证信息的请求被拒绝',
    category: '安全测试',
    priority: 'P0',
    steps: [
      '不携带 Authorization header',
      '调用 uploadFile API',
      '验证返回 401 错误',
    ],
    expected: {
      statusCode: 401,
      errorCode: 'unauthorized',
    },
  },

  /**
   * TC-09: 无效 API Key 上传
   */
  'TC-09': {
    name: '无效 API Key 上传',
    description: '验证无效认证信息被拒绝',
    category: '安全测试',
    priority: 'P0',
    steps: [
      '使用无效的 API Key',
      '调用 uploadFile API',
      '验证返回 401 错误',
    ],
    expected: {
      statusCode: 401,
      errorCode: 'invalid_api_key',
    },
  },

  /**
   * TC-10: 连续上传多个文件
   */
  'TC-10': {
    name: '连续上传多个文件',
    description: '验证批量上传功能',
    category: '功能测试',
    priority: 'P1',
    steps: [
      '准备 5 个不同格式的有效文件',
      '依次调用 uploadFile API',
      '验证所有文件都上传成功',
      '验证返回的 file_id 各不相同',
    ],
    expected: {
      allSuccess: true,
      uniqueFileIds: true,
    },
  },

  /**
   * TC-11: 获取文件列表
   */
  'TC-11': {
    name: '获取文件列表',
    description: '验证文件列表接口',
    category: '功能测试',
    priority: 'P0',
    steps: [
      '调用 listFiles API',
      '验证返回数据格式正确',
      '验证包含已上传的文件',
    ],
    expected: {
      statusCode: 200,
      hasData: true,
      hasFileList: true,
    },
  },

  /**
   * TC-12: 获取单个文件信息
   */
  'TC-12': {
    name: '获取单个文件信息',
    description: '验证文件详情接口',
    category: '功能测试',
    priority: 'P0',
    steps: [
      '上传一个文件获取 file_id',
      '调用 getFile API',
      '验证返回文件信息正确',
    ],
    expected: {
      statusCode: 200,
      hasFileInfo: true,
    },
  },

  /**
   * TC-13: 删除文件
   */
  'TC-13': {
    name: '删除文件',
    description: '验证文件删除功能',
    category: '功能测试',
    priority: 'P0',
    steps: [
      '上传一个文件',
      '调用 deleteFile API',
      '验证删除成功',
      '再次获取该文件验证已删除',
    ],
    expected: {
      deleteStatusCode: 200,
      getAfterDelete: 404,
    },
  },

  /**
   * TC-14: 获取不存在的文件
   */
  'TC-14': {
    name: '获取不存在的文件',
    description: '验证无效文件 ID 的处理',
    category: '负向测试',
    priority: 'P1',
    steps: [
      '使用不存在的 file_id',
      '调用 getFile API',
      '验证返回 404 错误',
    ],
    expected: {
      statusCode: 404,
      errorCode: 'file_not_found',
    },
  },

  /**
   * TC-15: 上传同名文件
   */
  'TC-15': {
    name: '上传同名文件',
    description: '验证同名文件的处理',
    category: '功能测试',
    priority: 'P1',
    steps: [
      '上传文件 A.txt',
      '再次上传同名文件 A.txt',
      '验证两个文件都有独立的 file_id',
    ],
    expected: {
      bothSuccess: true,
      differentFileIds: true,
    },
  },

  /**
   * TC-16: 网络超时重试
   */
  'TC-16': {
    name: '网络超时重试',
    description: '验证超时后的重试机制',
    category: '可靠性测试',
    priority: 'P2',
    steps: [
      '模拟网络超时场景',
      '验证是否有重试机制',
      '验证最终结果正确',
    ],
    expected: {
      hasRetry: true,
      eventualSuccess: true,
    },
  },

  /**
   * TC-17: 上传损坏的文件
   */
  'TC-17': {
    name: '上传损坏的文件',
    description: '验证损坏文件的处理',
    category: '负向测试',
    priority: 'P2',
    steps: [
      '准备一个损坏的 PDF 文件',
      '调用 uploadFile API',
      '验证错误处理',
    ],
    expected: {
      statusCode: 400,
      errorCode: 'invalid_file',
    },
  },

  /**
   * TC-18: 特殊字符文件名
   */
  'TC-18': {
    name: '特殊字符文件名',
    description: '验证特殊字符文件名的处理',
    category: '边界测试',
    priority: 'P2',
    steps: [
      '准备文件名包含特殊字符的文件',
      '调用 uploadFile API',
      '验证上传结果',
    ],
    expected: {
      handled: true,
      noError: true,
    },
  },

  /**
   * TC-19: 中文文件名
   */
  'TC-19': {
    name: '中文文件名',
    description: '验证中文文件名的处理',
    category: '边界测试',
    priority: 'P1',
    steps: [
      '准备中文命名的文件',
      '调用 uploadFile API',
      '验证上传成功',
    ],
    expected: { statusCode: 200, hasFileId: true },
  },

  /**
   * TC-20: 并发上传
   */
  'TC-20': {
    name: '并发上传多个文件',
    description: '验证并发上传的稳定性',
    category: '性能测试',
    priority: 'P2',
    steps: [
      '准备 10 个文件',
      '同时发起 10 个上传请求',
      '验证所有请求都正确处理',
    ],
    expected: {
      allHandled: true,
      noErrors: true,
    },
  },

  /**
   * TC-21: 单文件对话
   */
  'TC-21': {
    name: '单文件对话',
    description: '验证上传文件后可以进行对话',
    category: '功能测试',
    priority: 'P0',
    steps: [
      '上传一个 PDF 文件',
      '获取 file_id',
      '调用 getKimiReplyWithFiles 传入 file_id',
      '提问关于文件内容的问题',
      '验证 AI 回答与文件内容相关',
    ],
    expected: {
      uploadSuccess: true,
      replyRelevant: true,
    },
  },

  /**
   * TC-22: 多文件引用对话
   */
  'TC-22': {
    name: '多文件引用对话',
    description: '验证多个文件可以同时作为对话上下文',
    category: '功能测试',
    priority: 'P1',
    steps: [
      '上传 2-3 个不同文件',
      '调用 getKimiReplyWithFiles 传入多个 file_id',
      '提问需要综合多个文件的问题',
      '验证 AI 能正确引用多个文件内容',
    ],
    expected: {
      multiFileSuccess: true,
      correctReference: true,
    },
  },

  /**
   * TC-23: 无效 file_id 对话
   */
  'TC-23': {
    name: '无效 file_id 对话',
    description: '验证使用无效 file_id 进行对话的错误处理',
    category: '负向测试',
    priority: 'P0',
    steps: [
      '使用不存在的 file_id',
      '调用 getKimiReplyWithFiles',
      '验证返回错误信息',
    ],
    expected: {
      statusCode: 404,
      errorCode: 'file_not_found',
    },
  },
}

// ============================================
// 测试运行器
// ============================================

/**
 * 运行单个测试
 */
async function runTest(testId) {
  const testCase = testCases[testId]
  if (!testCase) {
    console.log(`测试用例 ${testId} 不存在`)
    return
  }

  console.log(`\n========== ${testId}: ${testCase.name} ==========`)
  console.log(`分类: ${testCase.category}`)
  console.log(`优先级: ${testCase.priority}`)
  console.log(`描述: ${testCase.description}`)
  console.log(`预期结果:`, testCase.expected)
  console.log('测试步骤:')
  testCase.steps.forEach((step, index) => {
    console.log(`  ${index + 1}. ${step}`)
  })
}

/**
 * 运行所有测试用例
 */
async function runAllTests() {
  console.log('========================================')
  console.log('Kimi 文件上传功能 - 测试用例设计')
  console.log('========================================')
  console.log(`总用例数: ${Object.keys(testCases).length}`)

  // 统计
  const stats = {
    P0: 0,
    P1: 0,
    P2: 0,
    正向测试: 0,
    负向测试: 0,
    边界测试: 0,
    安全测试: 0,
    功能测试: 0,
    性能测试: 0,
    可靠性测试: 0,
  }

  Object.values(testCases).forEach((tc) => {
    stats[tc.priority]++
    stats[tc.category]++
  })

  console.log('\n优先级分布:')
  console.log(`  P0 (核心): ${stats.P0} 个`)
  console.log(`  P1 (重要): ${stats.P1} 个`)
  console.log(`  P2 (一般): ${stats.P2} 个`)

  console.log('\n类型分布:')
  console.log(`  正向测试: ${stats['正向测试']} 个`)
  console.log(`  负向测试: ${stats['负向测试']} 个`)
  console.log(`  边界测试: ${stats['边界测试']} 个`)
  console.log(`  安全测试: ${stats['安全测试']} 个`)
  console.log(`  功能测试: ${stats['功能测试']} 个`)
  console.log(`  性能测试: ${stats['性能测试']} 个`)
  console.log(`  可靠性测试: ${stats['可靠性测试']} 个`)

  // 打印所有测试用例
  for (const testId of Object.keys(testCases)) {
    await runTest(testId)
  }
}

// 执行测试
runAllTests()

export { testCases }
