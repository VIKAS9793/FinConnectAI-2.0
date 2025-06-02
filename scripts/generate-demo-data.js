const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const faker = require('faker');

// Ensure faker is installed
const ensureFaker = () => {
  try {
    require('faker');
  } catch (error) {
    console.log('Installing faker package...');
    require('child_process').execSync('npm install faker@5.5.3 --save-dev', { stdio: 'inherit' });
  }
};

// Generate demo transactions
const generateTransactions = (count = 50) => {
  const transactions = [];
  const statuses = ['completed', 'pending', 'failed', 'suspicious'];
  const categories = ['Shopping', 'Food & Dining', 'Transfer', 'Bills', 'Entertainment', 'Travel'];
  
  for (let i = 0; i < count; i++) {
    const amount = parseFloat((Math.random() * 1000).toFixed(2));
    const isFraudulent = Math.random() > 0.9; // 10% chance of being fraudulent
    const status = isFraudulent ? 'suspicious' : statuses[Math.floor(Math.random() * (statuses.length - 1))];
    
    transactions.push({
      id: uuidv4(),
      amount,
      currency: 'USD',
      merchant: faker.company.companyName(),
      category: categories[Math.floor(Math.random() * categories.length)],
      location: `${faker.address.city()}, ${faker.address.country()}`,
      timestamp: faker.date.recent(30).toISOString(),
      status,
      isFraudulent,
      riskScore: isFraudulent ? 
        Math.floor(Math.random() * 30) + 70 : // High risk for fraudulent
        Math.floor(Math.random() * 60),      // Low to medium risk for normal
      details: {
        ipAddress: faker.internet.ip(),
        deviceId: faker.datatype.uuid(),
        userAgent: faker.internet.userAgent()
      }
    });
  }
  
  return transactions;
};

// Generate demo users
const generateUsers = (count = 5) => {
  const users = [];
  const roles = ['admin', 'analyst', 'viewer'];
  
  for (let i = 0; i < count; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    
    users.push({
      id: uuidv4(),
      email: faker.internet.email(firstName, lastName).toLowerCase(),
      name: `${firstName} ${lastName}`,
      role: roles[i % roles.length],
      lastLogin: faker.date.recent(30).toISOString(),
      isActive: true,
      avatar: `https://i.pravatar.cc/150?u=${faker.datatype.uuid()}`
    });
  }
  
  return users;
};

// Save data to file
const saveData = (filename, data) => {
  const dir = path.join(__dirname, '..', 'public', 'demo-data');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Generated ${filePath}`);
};

// Main function
const main = () => {
  ensureFaker();
  
  console.log('Generating demo data...');
  
  // Generate and save data
  const transactions = generateTransactions(100);
  const users = generateUsers(5);
  
  // Calculate some statistics
  const stats = {
    totalTransactions: transactions.length,
    suspiciousTransactions: transactions.filter(t => t.status === 'suspicious').length,
    totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2),
    usersCount: users.length,
    generatedAt: new Date().toISOString()
  };
  
  // Save all data
  saveData('transactions.json', transactions);
  saveData('users.json', users);
  saveData('stats.json', stats);
  
  console.log('\nDemo data generation complete!');
  console.log(`- ${stats.totalTransactions} transactions generated`);
  console.log(`- ${stats.suspiciousTransactions} suspicious transactions`);
  console.log(`- ${users.length} demo users created`);
  console.log(`\nData saved to: ${path.join(process.cwd(), 'public', 'demo-data')}`);
};

// Run the generator
main();
