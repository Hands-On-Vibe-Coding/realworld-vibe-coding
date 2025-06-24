#!/usr/bin/env node

/**
 * Frontend Fresh Development Server
 * Node.js script to clean up existing processes and start a fresh dev server
 */

const { exec, spawn } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Function to find and kill processes on a specific port
async function killPortProcesses(port, processName) {
  try {
    colorLog('yellow', `🔍 Checking for processes on port ${port}...`);
    
    const { stdout } = await execAsync(`lsof -ti:${port}`, { encoding: 'utf8' });
    const pids = stdout.trim().split('\n').filter(pid => pid);
    
    if (pids.length > 0) {
      colorLog('red', `⚠️  Found ${processName} processes on port ${port}:`);
      
      try {
        await execAsync(`lsof -i:${port}`);
      } catch (error) {
        // Ignore error, just for display purposes
      }
      
      colorLog('yellow', `🔥 Killing processes on port ${port}...`);
      
      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid}`);
        } catch (error) {
          // Process might already be dead
        }
      }
      
      // Wait a moment for processes to die
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if any processes are still running
      try {
        const { stdout: remaining } = await execAsync(`lsof -ti:${port}`, { encoding: 'utf8' });
        if (remaining.trim()) {
          colorLog('red', `❌ Some processes are still running on port ${port}`);
        } else {
          colorLog('green', `✅ Successfully killed all processes on port ${port}`);
        }
      } catch (error) {
        colorLog('green', `✅ Successfully killed all processes on port ${port}`);
      }
    } else {
      colorLog('green', `✅ No processes found on port ${port}`);
    }
  } catch (error) {
    colorLog('green', `✅ No processes found on port ${port}`);
  }
}

// Function to kill node processes by pattern
async function killNodeProcesses(pattern, description) {
  try {
    colorLog('yellow', `🔍 Checking for ${description}...`);
    
    const { stdout } = await execAsync(`ps aux | grep -E "${pattern}" | grep -v grep`, { encoding: 'utf8' });
    const lines = stdout.trim().split('\n').filter(line => line);
    
    if (lines.length > 0) {
      colorLog('red', `⚠️  Found ${description}:`);
      console.log(stdout);
      
      const pids = lines.map(line => line.split(/\s+/)[1]);
      
      colorLog('yellow', `🔥 Killing ${description}...`);
      
      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid}`);
        } catch (error) {
          // Process might already be dead
        }
      }
      
      colorLog('green', `✅ Successfully killed ${description}`);
    } else {
      colorLog('green', `✅ No ${description} found`);
    }
  } catch (error) {
    colorLog('green', `✅ No ${description} found`);
  }
}

// Main cleanup and start function
async function cleanupAndStart() {
  try {
    colorLog('blue', '🚀 Frontend Development Server Cleanup & Start');
    console.log('================================================');
    
    // Kill processes on common development server ports
    await killPortProcesses(5173, 'Vite (5173)');
    await killPortProcesses(5174, 'Vite (5174)');
    await killPortProcesses(3000, 'Alternative dev server (3000)');
    await killPortProcesses(4173, 'Vite preview (4173)');
    
    // Kill node processes that might be running Vite
    await killNodeProcesses('vite|npm.*dev|yarn.*dev', 'Vite/npm dev processes');
    
    // Kill any hanging esbuild processes
    await killNodeProcesses('esbuild', 'esbuild processes');
    
    console.log('');
    colorLog('blue', '🧹 Cleanup completed!');
    console.log('');
    
    // Check if node_modules exists
    const fs = require('fs');
    const path = require('path');
    
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      colorLog('yellow', '📦 node_modules not found, installing dependencies...');
      await execAsync('npm install');
    } else {
      colorLog('green', '✅ node_modules found');
    }
    
    // Start the development server
    console.log('');
    colorLog('green', '🚀 Starting frontend development server...');
    colorLog('blue', '   URL: http://localhost:5173');
    colorLog('blue', '   Press Ctrl+C to stop');
    console.log('');
    
    // Spawn the dev server process
    const devServer = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      colorLog('yellow', '\n🛑 Stopping development server...');
      devServer.kill('SIGTERM');
      process.exit(0);
    });
    
    devServer.on('close', (code) => {
      colorLog('blue', `🏁 Development server exited with code ${code}`);
      process.exit(code);
    });
    
  } catch (error) {
    colorLog('red', `❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Main function for cleanup only
async function cleanupOnly() {
  try {
    colorLog('blue', '🧹 Frontend Process Cleanup');
    console.log('================================');
    
    // Kill processes on common development server ports
    await killPortProcesses(5173, 'Vite (5173)');
    await killPortProcesses(5174, 'Vite (5174)');
    await killPortProcesses(3000, 'Alternative dev server (3000)');
    await killPortProcesses(4173, 'Vite preview (4173)');
    
    // Kill node processes that might be running Vite
    await killNodeProcesses('vite|npm.*dev|yarn.*dev', 'Vite/npm dev processes');
    
    // Kill any hanging esbuild processes
    await killNodeProcesses('esbuild', 'esbuild processes');
    
    console.log('');
    colorLog('green', '🧹 Cleanup completed!');
    colorLog('blue', '   All frontend processes have been terminated.');
    console.log('');
    
  } catch (error) {
    colorLog('red', `❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--cleanup-only') || args.includes('-c')) {
  cleanupOnly();
} else {
  cleanupAndStart();
}