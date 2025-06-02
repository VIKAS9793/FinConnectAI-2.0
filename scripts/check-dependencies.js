#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Minimum required versions
const MIN_NODE_VERSION = '16.0.0';
const MIN_NPM_VERSION = '7.0.0';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  info: (msg) => console.log(`  ${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`  ${colors.green}✓ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`  ${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`  ${colors.red}✗ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.magenta}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

// Check Node.js version
function checkNodeVersion() {
  const nodeVersion = process.version.replace('v', '');
  const [major, minor] = nodeVersion.split('.').map(Number);
  const [minMajor, minMinor] = MIN_NODE_VERSION.split('.').map(Number);
  
  const isVersionValid = 
    major > minMajor || 
    (major === minMajor && minor >= minMinor);
  
  if (!isVersionValid) {
    log.error(`Node.js ${MIN_NODE_VERSION} or higher is required. Current version: ${nodeVersion}`);
    return false;
  }
  
  log.success(`Node.js version: ${nodeVersion}`);
  return true;
}

// Check npm version
function checkNpmVersion() {
  try {
    const npmVersion = execSync('npm --version', { stdio: 'pipe' }).toString().trim();
    const [major] = npmVersion.split('.').map(Number);
    
    if (major < MIN_NPM_VERSION.split('.')[0]) {
      log.warn(`npm ${MIN_NPM_VERSION} or higher is recommended. Current version: ${npmVersion}`);
      return false;
    }
    
    log.success(`npm version: ${npmVersion}`);
    return true;
  } catch (error) {
    log.warn('Could not determine npm version');
    return false;
  }
}

// Check if a command exists
function commandExists(command) {
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
}

// Check if Yarn is installed
function checkYarn() {
  const hasYarn = commandExists('yarn');
  if (hasYarn) {
    try {
      const yarnVersion = execSync('yarn --version', { stdio: 'pipe' }).toString().trim();
      log.success(`Yarn version: ${yarnVersion}`);
    } catch {
      log.warn('Yarn is installed but could not determine version');
    }
  } else {
    log.warn('Yarn is not installed (optional but recommended)');
  }
  return true;
}

// Check if Git is installed
function checkGit() {
  const hasGit = commandExists('git');
  if (hasGit) {
    try {
      const gitVersion = execSync('git --version', { stdio: 'pipe' }).toString().trim();
      log.success(`Git: ${gitVersion}`);
    } catch {
      log.warn('Git is installed but could not determine version');
    }
  } else {
    log.warn('Git is not installed (required for version control)');
  }
  return true;
}

// Check if .env file exists
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    log.warn('.env file not found. Copy .env.example to .env and update the values');
    return false;
  }
  
  // Check if .env has placeholder values
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasPlaceholders = envContent.includes('your-') || 
                        envContent.includes('example.com') ||
                        envContent.includes('replace-me');
  
  if (hasPlaceholders) {
    log.warn('.env file contains placeholder values. Please update them with your actual configuration');
    return false;
  }
  
  log.success('.env file is properly configured');
  return true;
}

// Check if node_modules exists
function checkNodeModules() {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const serverNodeModulesPath = path.join(process.cwd(), 'server', 'node_modules');
  
  const hasClientModules = fs.existsSync(nodeModulesPath);
  const hasServerModules = fs.existsSync(serverNodeModulesPath);
  
  if (!hasClientModules) {
    log.error('Client dependencies not installed. Run `npm install`');
    return false;
  }
  
  if (!hasServerModules) {
    log.error('Server dependencies not installed. Run `cd server && npm install`');
    return false;
  }
  
  log.success('All dependencies are installed');
  return true;
}

// Main function
function checkDependencies() {
  log.header('🔍 FinConnectAI - Dependency Check');
  
  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  
  const checks = [
    { name: 'Node.js', fn: checkNodeVersion, required: true },
    { name: 'npm', fn: checkNpmVersion, required: false },
    { name: 'Yarn', fn: checkYarn, required: false },
    { name: 'Git', fn: checkGit, required: false },
    { name: 'Environment', fn: checkEnvFile, required: !isDev },
    { name: 'Dependencies', fn: checkNodeModules, required: true },
  ];
  
  if (isDev) {
    log.warn('Running in development mode - some checks may be skipped');
  }
  
  let allPassed = true;
  
  for (const check of checks) {
    log.info(`Checking ${check.name}...`);
    try {
      const result = check.fn();
      if (!result && check.required) {
        allPassed = false;
      }
    } catch (error) {
      log.error(`Error checking ${check.name}: ${error.message}`);
      if (check.required) {
        allPassed = false;
      }
    }
  }
  
  if (allPassed) {
    log.success('\n✅ All checks passed! You\'re ready to start developing.');
    console.log('\nRun the following commands to get started:');
    console.log(`  ${colors.cyan}npm start${colors.reset}       # Start development servers`);
    console.log(`  ${colors.cyan}npm run build${colors.reset}   # Build for production`);
    console.log(`  ${colors.cyan}npm test${colors.reset}        # Run tests\n`);
  } else {
    log.error('\n❌ Some checks failed. Please fix the issues above before continuing.');
    process.exit(1);
  }
}

// Run the check
checkDependencies();
