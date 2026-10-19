import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const extensionPath = fileURLToPath(new URL('../pi/parallel-search.js', import.meta.url))
const defaultArgs = ['--print', '--no-session']
const restrictedArgs = new Set(['--no-extensions', '-ne', '--no-mcp', '--no-tools', '-nt', '--no-builtin-tools', '--tools', '-t', '--exclude-tools'])

function hasPiConfiguration(directory) {
  if (['mcp.json', 'extensions'].some((name) => existsSync(join(directory, name)))) return true
  const settingsPath = join(directory, 'settings.json')
  if (!existsSync(settingsPath)) return false
  try {
    const settings = JSON.parse(readFileSync(settingsPath, 'utf8'))
    return ['extensions', 'packages', 'defaultTools', 'noExtensions', 'noMcp'].some((key) => key in settings)
  } catch {
    // Leave malformed or unreadable user configuration to Pi to diagnose.
    return true
  }
}

// Only fresh configurations get an automatic provider. An explicit choice is
// never replaced, and permission flags always win, including in parallel mode.
export function getPiSearchArgs(agentArgs, { config, cwd = process.cwd(), environment = process.env } = {}) {
  const mode = config.webSearch || 'auto'
  if (!['auto', 'parallel', 'off'].includes(mode)) {
    throw new Error('PI_WEB_SEARCH must be auto, parallel, or off')
  }
  if (mode === 'off' || agentArgs.some((arg) => restrictedArgs.has(arg.split('=')[0]))) return []

  if (mode === 'auto') {
    if (agentArgs.length !== defaultArgs.length || agentArgs.some((arg, index) => arg !== defaultArgs[index])) return []
    if (config.npmPackage !== '@earendil-works/pi-coding-agent' || (config.bin && config.bin !== 'pi')) return []
    if (
      Object.entries(environment).some(
        ([key, value]) =>
          value &&
          /^(BRAVE_API_KEY|TAVILY_API_KEY|EXA_API_KEY|PERPLEXITY_API_KEY|SERPAPI_API_KEY|BING_SEARCH_API_KEY|PARALLEL_API_KEY|.*SEARCH_API_KEY)$/.test(
            key,
          ),
      )
    )
      return []

    const home = (process.platform === 'win32' ? environment.USERPROFILE : environment.HOME) || homedir()
    let agentDir = environment.PI_CODING_AGENT_DIR || join(home, '.pi', 'agent')
    if (agentDir === '~') agentDir = home
    else if (agentDir.startsWith('~/') || (process.platform === 'win32' && agentDir.startsWith('~\\'))) {
      agentDir = join(home, agentDir.slice(2))
    } else if (agentDir.startsWith('file://')) {
      try {
        agentDir = fileURLToPath(agentDir)
      } catch {
        return []
      }
    }
    // Pi also translates Windows shell drive paths. Leave those custom paths
    // alone in auto mode rather than inspect a different native directory.
    if (process.platform === 'win32' && agentDir.startsWith('/')) return []
    agentDir = resolve(cwd, agentDir)
    if (hasPiConfiguration(agentDir)) return []
    let directory = resolve(cwd)
    while (true) {
      if (hasPiConfiguration(join(directory, '.pi'))) return []
      const parent = dirname(directory)
      if (parent === directory) break
      directory = parent
    }
  }

  return ['--extension', extensionPath]
}
