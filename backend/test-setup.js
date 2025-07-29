import { createRequire } from 'module';
const require = createRequire(import.meta.url);

console.log('🔍 Testing backend setup...\n');

// Test environment variables
console.log('📋 Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
console.log(`   PORT: ${process.env.PORT || 'Not set'}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'Set ✅' : 'Not set ❌'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'Set ✅' : 'Not set ❌'}`);
console.log(`   OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? 'Set ✅' : 'Not set ❌'}`);
console.log(`   REDIS_URL: ${process.env.REDIS_URL || 'Not set'}`);

console.log('\n📦 Dependencies Check:');

const dependencies = [
  'express',
  'mongoose',
  'bcryptjs',
  'jsonwebtoken',
  'cors',
  'helmet',
  'dotenv',
  'redis',
  'axios',
  'archiver',
  'uuid'
];

dependencies.forEach(dep => {
  try {
    require(dep);
    console.log(`   ${dep}: ✅`);
  } catch (error) {
    console.log(`   ${dep}: ❌ (${error.message})`);
  }
});

console.log('\n🏗️  Project Structure:');
import fs from 'fs';
import path from 'path';

const checkDirectory = (dirPath, label) => {
  const exists = fs.existsSync(dirPath);
  console.log(`   ${label}: ${exists ? '✅' : '❌'}`);
  return exists;
};

checkDirectory('./src', 'src/');
checkDirectory('./src/controllers', 'src/controllers/');
checkDirectory('./src/models', 'src/models/');
checkDirectory('./src/routes', 'src/routes/');
checkDirectory('./src/middleware', 'src/middleware/');
checkDirectory('./src/services', 'src/services/');
checkDirectory('./src/utils', 'src/utils/');

console.log('\n📄 Key Files:');
const checkFile = (filePath, label) => {
  const exists = fs.existsSync(filePath);
  console.log(`   ${label}: ${exists ? '✅' : '❌'}`);
  return exists;
};

checkFile('./src/server.js', 'server.js');
checkFile('./src/models/User.js', 'User.js');
checkFile('./src/models/Session.js', 'Session.js');
checkFile('./src/routes/auth.js', 'auth.js');
checkFile('./src/routes/sessions.js', 'sessions.js');
checkFile('./src/routes/ai.js', 'ai.js');
checkFile('./src/routes/components.js', 'components.js');
checkFile('./src/services/aiService.js', 'aiService.js');
checkFile('./.env', '.env');

console.log('\n✅ Backend setup verification complete!');
console.log('\n📝 Next steps:');
console.log('   1. Update .env file with your actual values');
console.log('   2. Start MongoDB and Redis services');
console.log('   3. Run: npm run dev');
console.log('   4. Test API endpoints at http://localhost:5000/health');
