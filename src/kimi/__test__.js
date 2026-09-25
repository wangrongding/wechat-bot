import { getKimiReply, uploadFile, listFiles, getFile, deleteFile, getFileContent, chatWithFile, chatWithMultipleFiles, ErrorCodes } from './index.js'

// 测试 Kimi API
async function test() {
  console.log('========== 测试 Kimi 基础对话 ==========')
  const result = await getKimiReply('你好!')
  if (result.success) {
    console.log('🌸🌸🌸 / message: ', result.data)
  } else {
    console.log('❌ 错误:', result.error)
  }
  return result
}

// 测试文件上传功能
async function testFileUpload() {
  console.log('\n========== 测试文件上传 ==========')

  // 创建一个临时测试文件
  const testFilePath = './test-upload-file.txt'
  const fs = await import('fs')
  fs.writeFileSync(testFilePath, '这是一个测试文件的内容，用于测试 Kimi 文件上传功能。\n\n测试时间: ' + new Date().toISOString())

  const result = await uploadFile(testFilePath)
  if (result.success) {
    console.log('✅ 上传成功:', result.data)
  } else {
    console.log('❌ 上传失败:', result.error)
  }

  // 清理临时文件
  fs.unlinkSync(testFilePath)

  return result
}

// 测试获取文件列表
async function testListFiles() {
  console.log('\n========== 测试获取文件列表 ==========')
  const result = await listFiles()
  if (result.success) {
    console.log('✅ 文件列表:', result.data.length, '个文件')
    console.log(result.data)
  } else {
    console.log('❌ 获取失败:', result.error)
  }
  return result
}

// 测试获取文件信息
async function testGetFile(fileId) {
  console.log('\n========== 测试获取文件信息 ==========')
  const result = await getFile(fileId)
  if (result.success) {
    console.log('✅ 文件信息:', result.data)
  } else {
    console.log('❌ 获取失败:', result.error)
  }
  return result
}

// 测试获取文件内容
async function testGetFileContent(fileId) {
  console.log('\n========== 测试获取文件内容 ==========')
  const result = await getFileContent(fileId)
  if (result.success) {
    console.log('✅ 文件内容:', result.data)
  } else {
    console.log('❌ 获取失败:', result.error)
  }
  return result
}

// 测试删除文件
async function testDeleteFile(fileId) {
  console.log('\n========== 测试删除文件 ==========')
  const result = await deleteFile(fileId)
  if (result.success) {
    console.log('✅ 删除成功:', result.data)
  } else {
    console.log('❌ 删除失败:', result.error)
  }
  return result
}

// 测试文件验证（空文件）
async function testEmptyFile() {
  console.log('\n========== 测试空文件验证 ==========')
  const testFilePath = './test-empty-file.txt'
  const fs = await import('fs')
  fs.writeFileSync(testFilePath, '') // 空文件

  const result = await uploadFile(testFilePath)
  if (!result.success && result.error.code === ErrorCodes.FILE_EMPTY) {
    console.log('✅ 正确检测到空文件')
  } else {
    console.log('❌ 未正确检测空文件:', result)
  }

  fs.unlinkSync(testFilePath)
  return result
}

// 测试文件验证（大文件 - 模拟）
async function testLargeFileValidation() {
  console.log('\n========== 测试大文件验证 ==========')
  // 不实际创建大文件，只测试逻辑
  const result = { success: true } // 跳过实际大文件测试
  console.log('⏭️ 跳过大文件测试（需要实际大文件）')
  return result
}

// 测试不存在的文件
async function testNonExistentFile() {
  console.log('\n========== 测试不存在的文件 ==========')
  const result = await uploadFile('./non-existent-file.txt')
  if (!result.success && result.error.code === ErrorCodes.FILE_NOT_FOUND) {
    console.log('✅ 正确检测到文件不存在')
  } else {
    console.log('❌ 未正确检测文件不存在:', result)
  }
  return result
}

// 测试无效参数
async function testInvalidParams() {
  console.log('\n========== 测试无效参数 ==========')

  // 测试空 fileId
  const result1 = await getFile(null)
  if (!result1.success && result1.error.code === ErrorCodes.INVALID_PARAMS) {
    console.log('✅ 正确检测到无效参数 (getFile)')
  } else {
    console.log('❌ 未正确检测无效参数:', result1)
  }

  // 测试空文件列表
  const result2 = await chatWithMultipleFiles([], 'test')
  if (!result2.success && result2.error.code === ErrorCodes.INVALID_PARAMS) {
    console.log('✅ 正确检测到无效参数 (chatWithMultipleFiles)')
  } else {
    console.log('❌ 未正确检测无效参数:', result2)
  }
}

// 测试带文件的对话
async function testChatWithFile() {
  console.log('\n========== 测试带文件的对话 ==========')

  // 创建一个临时测试文件
  const testFilePath = './test-chat-file.txt'
  const fs = await import('fs')
  fs.writeFileSync(testFilePath, '这是测试文档的内容。\n\n产品名称：测试产品\n版本：1.0.0\n功能：这是一个用于测试文件对话功能的示例文档。')

  const result = await chatWithFile(testFilePath, '请总结一下这个文件的内容')
  if (result.success) {
    console.log('✅ 对话结果:', result.data)
  } else {
    console.log('❌ 对话失败:', result.error)
  }

  // 清理临时文件
  fs.unlinkSync(testFilePath)

  return result
}

// 测试多文件对话
async function testChatWithMultipleFiles() {
  console.log('\n========== 测试多文件对话 ==========')

  const fs = await import('fs')

  // 创建多个测试文件
  const files = [
    { path: './test-file-1.txt', content: '第一个文件：产品介绍 - 这是一个优秀的产品。' },
    { path: './test-file-2.txt', content: '第二个文件：技术规格 - CPU: 8核, RAM: 16GB' },
  ]

  files.forEach((f) => fs.writeFileSync(f.path, f.content))

  const result = await chatWithMultipleFiles(
    files.map((f) => f.path),
    '请对比总结这两个文件的内容'
  )
  if (result.success) {
    console.log('✅ 多文件对话结果:', result.data)
  } else {
    console.log('❌ 多文件对话失败:', result.error)
  }

  // 清理临时文件
  files.forEach((f) => fs.unlinkSync(f.path))

  return result
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始运行 Kimi 文件上传功能测试...\n')
  console.log('注意：请确保已配置 KIMI_API_KEY 环境变量\n')

  try {
    // 测试基础对话
    await test()

    // 测试文件验证
    await testNonExistentFile()
    await testEmptyFile()
    await testLargeFileValidation()
    await testInvalidParams()

    // 测试文件上传
    const uploadResult = await testFileUpload()

    if (uploadResult.success && uploadResult.data?.id) {
      const fileId = uploadResult.data.id
      // 等待文件处理完成
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // 测试获取文件信息
      await testGetFile(fileId)

      // 测试获取文件内容
      await testGetFileContent(fileId)

      // 测试删除文件
      await testDeleteFile(fileId)
    }

    // 测试获取文件列表
    await testListFiles()

    console.log('\n✅ 所有基础测试完成!')

    // 可选：测试带文件的对话（需要更长时间）
    // await testChatWithFile()
    // await testChatWithMultipleFiles()

  } catch (error) {
    console.error('❌ 测试出错:', error)
  }
}

// 运行测试
runAllTests()
