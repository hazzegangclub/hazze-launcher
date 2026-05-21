'use strict'
/**
 * Launcher start script.
 *
 * IMPORTANT: ELECTRON_RUN_AS_NODE=1 in the environment causes Electron to run
 * as a plain Node.js process with no GUI and no electron API. We must remove
 * it before spawning the Electron binary.
 */

const { execFileSync, spawnSync } = require('child_process')
const path = require('path')

const ROOT        = path.join(__dirname, '..')
const electronBin = require(path.join(ROOT, 'node_modules', 'electron'))

// Build steps
console.log('► Building renderer...')
execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit', shell: true })
console.log('► Bundling main process...')
execFileSync('npm', ['run', 'build:main'], { cwd: ROOT, stdio: 'inherit', shell: true })

// Remove ELECTRON_RUN_AS_NODE so Electron starts in GUI mode
const env = { ...process.env, NODE_ENV: 'production' }
delete env.ELECTRON_RUN_AS_NODE

console.log('► Starting Electron...')
const result = spawnSync(electronBin, [ROOT], { stdio: 'inherit', env })
process.exit(result.status ?? 0)
