const { execSync } = require('child_process');

const runCommand = (command) => {
  try {
    console.log(`\nRunning: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\nError running ${command}:`, error.message);
    process.exit(1);
  }
};

console.log('\n🚀 Starting code quality checks...');

// Run ESLint with fix option
runCommand('npm run lint -- --fix');

// Run Prettier with write option
runCommand('npm run format');

// Run TypeScript compiler
runCommand('npm run build');

// Run tests
runCommand('npm run test');

console.log('\n✅ All checks completed successfully!\n');
