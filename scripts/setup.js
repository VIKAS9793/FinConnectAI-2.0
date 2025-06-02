#!/usr/bin/env node
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

// Helper function to log messages
const log = {
  info: (msg) => console.log(`  ${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`  ${colors.green}✓ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`  ${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`  ${colors.red}✗ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.magenta}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

// Check if a command exists
const commandExists = (command) => {
  try {
    if (os.platform() === 'win32') {
      execSync(`where ${command}`, { stdio: 'ignore' });
    } else {
      execSync(`command -v ${command}`, { stdio: 'ignore' });
    }
    return true;
  } catch {
    return false;
  }
};

// Execute a command with better error handling and output
const runCommand = (command, options = {}) => {
  return new Promise((resolve) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, { 
      stdio: 'inherit',
      shell: true,
      ...options 
    });

    child.on('close', (code) => {
      if (code !== 0) {
        log.error(`Command failed: ${command}`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

// Create .env file if it doesn't exist
const setupEnvFile = () => {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  if (!fs.existsSync(envPath)) {
    log.info('Creating .env file from .env.example');
    try {
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        log.success('Created .env file with default values');
      } else {
        log.warn('.env.example not found. Creating an empty .env file');
        fs.writeFileSync(envPath, '# Environment variables\n');
      }
    } catch (error) {
      log.error(`Failed to create .env file: ${error.message}`);
      return false;
    }
  } else {
    log.info('.env file already exists');
  }
  return true;
};

// Generate demo data
const generateDemoData = async () => {
  log.info('Generating demo data...');
  try {
    const { execSync } = require('child_process');
    execSync('node scripts/generate-demo-data.js', { stdio: 'inherit' });
    log.success('Demo data generated successfully');
    return true;
  } catch (error) {
    log.error(`Failed to generate demo data: ${error.message}`);
    return false;
  }
};

// Main setup function
const setup = async () => {
  log.header('🚀 FinConnectAI 2.0 - Setup');
  
  // Check for Node.js version
  const nodeVersion = process.version;
  const requiredNodeVersion = '16.0.0';
  const semver = require('semver');
  
  log.info(`Node.js version: ${nodeVersion}`);
  
  if (semver.lt(nodeVersion, requiredNodeVersion)) {
    log.warn(`This project requires Node.js ${requiredNodeVersion} or higher`);
    log.warn('Some features may not work as expected');
  }
  
  // Check for npm/yarn
  const packageManager = commandExists('yarn') ? 'yarn' : 'npm';
  log.info(`Package manager: ${packageManager}`);
  
  // Create .env file
  log.header('🔧 Environment Setup');
  if (!setupEnvFile()) {
    throw new Error('Failed to set up environment variables');
  }
  
  // Install dependencies
  log.header('📦 Installing Dependencies');
  log.info('Installing frontend dependencies...');
  
  const installCmd = packageManager === 'yarn' 
    ? 'yarn install --frozen-lockfile' 
    : 'npm install';
    
  if (!(await runCommand(installCmd))) {
    throw new Error('Failed to install frontend dependencies');
  }
  
  // Install server dependencies
  log.info('Installing server dependencies...');
  process.chdir('server');
  
  if (!(await runCommand(installCmd))) {
    process.chdir('..');
    throw new Error('Failed to install server dependencies');
  }
  
  process.chdir('..');
  
  // Generate demo data
  log.header('📊 Generating Demo Data');
  await generateDemoData();
  
  // Show completion message
  log.header('✨ Setup Completed Successfully!');
  console.log(`
  ${colors.bright}${colors.green}FinConnectAI is ready to use!${colors.reset}
`);
  
  console.log(`${colors.bright}Next steps:${colors.reset}`);
  console.log(`  1. Start the development server: ${colors.cyan}npm start${colors.reset}`);
  console.log(`  2. Open your browser to: ${colors.cyan}http://localhost:3000${colors.reset}`);
  console.log(`  3. Explore the demo dashboard at: ${colors.cyan}http://localhost:3000/demo${colors.reset}\n`);
  
  console.log(`${colors.bright}Available scripts:${colors.reset}`);
  console.log(`  ${colors.cyan}npm start${colors.reset}       - Start both frontend and backend`);
  console.log(`  ${colors.cyan}npm run dev${colors.reset}     - Start only the frontend`);
  console.log(`  ${colors.cyan}npm run server${colors.reset} - Start only the backend`);
  console.log(`  ${colors.cyan}npm run build${colors.reset}  - Build for production`);
  console.log(`  ${colors.cyan}npm run test${colors.reset}   - Run tests\n`);
  
  console.log(`${colors.bright}Need help?${colors.reset}`);
  console.log(`  - Check the README.md for documentation`);
  console.log(`  - Open an issue on GitHub for support\n`);
};

// Run the setup
process.on('unhandledRejection', (error) => {
  log.error('Unhandled rejection during setup:');
  console.error(error);
  process.exit(1);
});

setup().catch(error => {
  log.error(`\nSetup failed: ${error.message}`);
  console.log('\nIf you need help, please check the documentation or open an issue.');
  process.exit(1);
});
