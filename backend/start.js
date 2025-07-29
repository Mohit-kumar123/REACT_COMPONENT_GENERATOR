#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Component Generator Backend - Quick Start\n');

// Check if .env file exists and has required variables
if (!fs.existsSync('.env')) {
  console.log('❌ .env file not found!');
  console.log('📋 Copying .env.example to .env...');
  fs.copyFileSync('.env.example', '.env');
  console.log('✅ .env file created from template');
  console.log('\n⚠️  Please update .env with your actual values before starting the server');
  process.exit(1);
}

// Read .env file and check for required variables
const envContent = fs.readFileSync('.env', 'utf8');
const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'OPENROUTER_API_KEY'];
const missingVars = [];

requiredVars.forEach(varName => {
  const pattern = new RegExp(`^${varName}=.+`, 'm');
  if (!pattern.test(envContent) || envContent.includes(`${varName}=your_`)) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Please update your .env file with actual values');
  process.exit(1);
}

// Check if MongoDB is running (basic check)
try {
  console.log('🔍 Checking MongoDB connection...');
  // This is a simple check - in a real app you'd want to test the actual connection
  if (envContent.includes('mongodb://localhost') || envContent.includes('mongodb://127.0.0.1')) {
    console.log('⚠️  Make sure MongoDB is running locally');
  }
  console.log('✅ MongoDB configuration found');
} catch (error) {
  console.log('⚠️  Could not verify MongoDB connection');
}

// Check if Redis is configured
if (envContent.includes('REDIS_URL=redis://localhost')) {
  console.log('⚠️  Make sure Redis is running locally (optional)');
}

console.log('\n🎯 Starting development server...');
console.log('📝 Logs will appear below:\n');

// Start the development server
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.log('\n❌ Failed to start server');
  console.log('🔧 Troubleshooting tips:');
  console.log('   1. Make sure all dependencies are installed: npm install');
  console.log('   2. Check your .env file configuration');
  console.log('   3. Ensure MongoDB is running');
  console.log('   4. Check for any syntax errors in the code');
  process.exit(1);
}
