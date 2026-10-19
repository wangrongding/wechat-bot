import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import test from 'node:test'
import { getPiSearchArgs } from './piSearch.js'

const config = { bin: '', npmPackage: '@earendil-works/pi-coding-agent', webSearch: 'auto' }
const args = ['--print', '--no-session']

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'wechat-pi-search-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const cwd = join(root, 'project')
  mkdirSync(cwd)
  const environment = { HOME: root, USERPROFILE: root }
  return { root, cwd, environment, config }
}

test('fresh Pi gets the packaged extension without changing arguments', (t) => {
  const options = fixture(t)
  const original = [...args]
  const result = getPiSearchArgs(args, options)
  assert.equal(result[0], '--extension')
  assert.match(result[1], /src[/\\]pi[/\\]parallel-search\.js$/)
  assert.deepEqual(args, original)
})

test('saved MCP, extensions, settings and parent project configuration win', (t) => {
  const options = fixture(t)
  const agentDir = join(options.root, 'custom-agent')
  mkdirSync(agentDir)
  options.environment.PI_CODING_AGENT_DIR = agentDir
  for (const name of ['mcp.json', 'extensions']) {
    writeFileSync(join(agentDir, name), '{}')
    assert.deepEqual(getPiSearchArgs(args, options), [])
    rmSync(join(agentDir, name))
  }
  for (const key of ['defaultTools', 'extensions', 'packages', 'noExtensions', 'noMcp']) {
    writeFileSync(join(agentDir, 'settings.json'), JSON.stringify({ [key]: [] }))
    assert.deepEqual(getPiSearchArgs(args, options), [])
  }
  writeFileSync(join(agentDir, 'settings.json'), '{broken')
  assert.deepEqual(getPiSearchArgs(args, options), [])
  writeFileSync(join(agentDir, 'settings.json'), JSON.stringify({ model: 'custom-model' }))
  assert.equal(getPiSearchArgs(args, options)[0], '--extension')
  mkdirSync(join(options.root, '.pi'))
  writeFileSync(join(options.root, '.pi', 'mcp.json'), '{}')
  assert.deepEqual(getPiSearchArgs(args, options), [])
})

test('custom runtime, arguments and configured search credentials win', (t) => {
  const options = fixture(t)
  for (const changed of [{ bin: 'custom-pi' }, { npmPackage: 'another-agent' }]) {
    assert.deepEqual(getPiSearchArgs(args, { ...options, config: { ...config, ...changed } }), [])
  }
  assert.deepEqual(getPiSearchArgs([...args, '--model', 'custom'], options), [])
  for (const key of ['TAVILY_API_KEY', 'BRAVE_API_KEY', 'EXA_API_KEY', 'PARALLEL_API_KEY', 'BING_SEARCH_API_KEY']) {
    assert.deepEqual(getPiSearchArgs(args, { ...options, environment: { ...options.environment, [key]: 'configured' } }), [])
  }
})

test('custom agent directories use Pi tilde, URL and child working-directory semantics', (t) => {
  const options = fixture(t)
  const customDir = join(options.root, '.pi', 'custom')
  mkdirSync(customDir, { recursive: true })
  writeFileSync(join(customDir, 'mcp.json'), '{}')
  for (const directory of ['~/.pi/custom', '../.pi/custom', pathToFileURL(customDir).href]) {
    assert.deepEqual(getPiSearchArgs(args, { ...options, environment: { ...options.environment, PI_CODING_AGENT_DIR: directory } }), [])
  }
  writeFileSync(join(options.root, 'mcp.json'), '{}')
  assert.deepEqual(getPiSearchArgs(args, { ...options, environment: { ...options.environment, PI_CODING_AGENT_DIR: '~' } }), [])
  assert.deepEqual(getPiSearchArgs(args, { ...options, environment: { ...options.environment, PI_CODING_AGENT_DIR: 'file:///%' } }), [])
})

test('off and tool permission flags win even with explicit parallel selection', (t) => {
  const options = fixture(t)
  assert.deepEqual(getPiSearchArgs(args, { ...options, config: { ...config, webSearch: 'off' } }), [])
  for (const flag of ['--no-mcp', '--no-extensions', '-ne', '--no-tools', '-nt', '--tools=read', '-t', '--exclude-tools', '--no-builtin-tools']) {
    assert.deepEqual(getPiSearchArgs([...args, flag], { ...options, config: { ...config, webSearch: 'parallel' } }), [])
  }
})

test('explicit parallel keeps customized arguments and invalid modes are diagnosed', (t) => {
  const options = fixture(t)
  assert.equal(getPiSearchArgs(['--print', '--model', 'custom'], { ...options, config: { ...config, webSearch: 'parallel' } })[0], '--extension')
  assert.throws(() => getPiSearchArgs(args, { ...options, config: { ...config, webSearch: 'typo' } }), /PI_WEB_SEARCH/)
})
