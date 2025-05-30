const { execSync } = require('child_process');

console.log('\n🔍 Checking project dependencies...');

try {
  // Check for outdated packages
  console.log('\n🔍 Checking for outdated packages...');
  execSync('npm outdated', { stdio: 'inherit' });

  // Check for vulnerabilities
  console.log('\n🔍 Checking for vulnerabilities...');
  execSync('npm audit', { stdio: 'inherit' });

  // Check browserslist status
  console.log('\n🔍 Checking browserslist status...');
  execSync('npx update-browserslist-db@latest', { stdio: 'inherit' });

  console.log('\n✅ Dependency checks completed successfully!\n');
} catch (error) {
  console.error('\n❌ Error during dependency checks:', error.message);
  process.exit(1);
}
