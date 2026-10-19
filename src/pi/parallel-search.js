// Pi owns MCP transport, tool dispatch, cancellation, and per-session state.
// In particular, do not set a process-wide Parallel session_id here.
export default function parallelSearch(pi) {
  if (typeof pi.registerMcpServer !== 'function') {
    console.error('Parallel search requires Pi 1.3.0 or newer. Update Pi or set PI_WEB_SEARCH=off.')
    return
  }
  if (pi.getMcpServers().some((server) => server.name === 'parallel')) return
  pi.registerMcpServer('parallel', {
    url: 'https://search.parallel.ai/mcp',
    headers: {
      'User-Agent': 'wechat-bot/1.0.2 (https://github.com/wangrongding/wechat-bot)',
    },
    description: 'Search the web and read web pages with Parallel.',
    exposure: 'direct',
    timeout: 30,
  })
}
