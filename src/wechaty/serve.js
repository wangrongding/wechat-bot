function lazyServe(loader, exportName) {
  return async (...args) => {
    const module = await loader()
    return module[exportName](...args)
  }
}

/**
 * 获取 AI 服务
 * @param serviceType 服务类型
 * @returns {Function}
 */
export function getServe(serviceType) {
  switch (serviceType) {
    case 'ChatGPT':
      return lazyServe(() => import('../openai/index.js'), 'getGptReply')
    case 'doubao':
      return lazyServe(() => import('../doubao/index.js'), 'getDoubaoReply')
    case 'deepseek':
      return lazyServe(() => import('../deepseek/index.js'), 'getDeepseekReply')
    case 'Kimi':
      return lazyServe(() => import('../kimi/index.js'), 'getKimiReply')
    case 'Xunfei':
      return lazyServe(() => import('../xunfei/index.js'), 'getXunfeiReply')
    case 'deepseek-free':
      return lazyServe(() => import('../deepseek-free/index.js'), 'getDeepSeekFreeReply')
    case '302AI':
      return lazyServe(() => import('../302ai/index.js'), 'get302AiReply')
    case 'dify':
      return lazyServe(() => import('../dify/index.js'), 'getDifyReply')
    case 'ollama':
      return lazyServe(() => import('../ollama/index.js'), 'getOllamaReply')
    case 'tongyi':
      return lazyServe(() => import('../tongyi/index.js'), 'getTongyiReply')
    case 'claude':
      return lazyServe(() => import('../claude/index.js'), 'getClaudeReply')
    case 'pi':
      return lazyServe(() => import('../pi/index.js'), 'getPiReply')
    case 'Gemini':
      return lazyServe(() => import('../Gemini/index.js'), 'getGeminiReply')
    default:
      return lazyServe(() => import('../openai/index.js'), 'getGptReply')
  }
}
