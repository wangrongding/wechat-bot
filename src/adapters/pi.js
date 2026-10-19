import { getPiRuntimeConfig } from '../config/env.js'
import { splitCommand, runCommand, streamCommand } from '../utils/process.js'
import { getPiSearchArgs } from './piSearch.js'

export function resolvePiCommand() {
  const config = getPiRuntimeConfig()
  const configured = splitCommand(config.bin)
  if (configured.length) {
    return {
      command: configured[0],
      args: configured.slice(1),
    }
  }

  return {
    command: 'npx',
    args: ['--yes', config.npmPackage],
  }
}

export async function runPi(args = []) {
  const base = resolvePiCommand()
  return streamCommand(base.command, [...base.args, ...args])
}

export async function askPi(prompt, options = {}) {
  const base = resolvePiCommand()
  const config = getPiRuntimeConfig()
  const agentArgs = splitCommand(options.agentArgs || config.agentArgs)
  const cwd = options.cwd || process.cwd()
  const searchArgs = getPiSearchArgs(agentArgs, { config, cwd })
  const result = await runCommand(base.command, [...base.args, ...agentArgs, ...searchArgs, prompt], {
    cwd,
  })

  if (result.code !== 0) {
    const detail = result.stderr || result.stdout || `exit code ${result.code}`
    throw new Error(`pi failed: ${detail}`)
  }

  return (result.stdout || result.stderr || '').trim()
}
