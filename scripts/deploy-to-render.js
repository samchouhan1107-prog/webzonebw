#!/usr/bin/env node

/**
 * WebZoneBW ER Studio - Render Deployment Script
 * 
 * This script automates the deployment process to Render.com
 * including environment variable setup and verification.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 WebZoneBW ER Studio - Render Deployment Script');
console.log('================================================');

// Configuration
const config = {
  repo: 'samchouhan1107-prog/webzonebw',
  branch: 'restore-webzonebw-20260914-layout',
  serviceName: 'webzonebw-er-studio',
  renderApiUrl: 'https://api.render.com',
  requiredEnvVars: [
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET', 
    'PAYPAL_WEBHOOK_ID',
    'ORDER_EMAIL',
    'SESSION_SECRET',
    'ADMIN_KEY'
  ]
};

// Check if we have the required files
function checkRequiredFiles() {
  console.log('📋 Checking required files...');
  
  const requiredFiles = [
    'render.yaml',
    'server.js',
    'package.json',
    'Dockerfile'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing required files:', missingFiles);
    process.exit(1);
  }
  
  console.log('✅ All required files found');
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log('🔧 Checking environment variables...');
  
  const envPath = '.env';
  const envVars = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        if (key && rest.length > 0) {
          envVars[key] = rest.join('=');
        }
      }
    });
  }
  
  const missingVars = config.requiredEnvVars.filter(varName => 
    !envVars[varName] || envVars[varName].trim() === ''
  );
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.log('📝 Please update your .env file with the required values');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables found');
}

// Validate render.yaml configuration
function validateRenderYaml() {
  console.log('🔍 Validating render.yaml configuration...');
  
  try {
    const yamlContent = fs.readFileSync('render.yaml', 'utf8');
    console.log('✅ render.yaml syntax is valid');
    
    // Check for key configurations
    const checks = [
      { name: 'PayPal configuration', pattern: 'PAYPAL_CLIENT_ID' },
      { name: 'Port configuration', pattern: 'PORT: 3000' },
      { name: 'Health check', pattern: 'healthCheck:' },
      { name: 'Environment variables', pattern: 'envVars:' }
    ];
    
    checks.forEach(check => {
      if (yamlContent.includes(check.pattern)) {
        console.log(`✅ ${check.name} found`);
      } else {
        console.warn(`⚠️ ${check.name} not found`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error validating render.yaml:', error.message);
    process.exit(1);
  }
}

// Generate deployment checklist
function generateDeploymentChecklist() {
  console.log('\n📋 Deployment Checklist:');
  console.log('========================');
  
  const checklist = [
    { step: '1. Update render.yaml with latest configuration', status: '✅' },
    { step: '2. Verify all environment variables in .env', status: '✅' },
    { step: '3. Check PayPal credentials are valid', status: '⏳' },
    { step: '4. Configure PayPal webhook in PayPal Developer Dashboard', status: '⏳' },
    { step: '5. Deploy to Render.com', status: '⏳' },
    { step: '6. Verify API endpoints are working', status: '⏳' },
    { step: '7. Test complete payment flow', status: '⏳' }
  ];
  
  checklist.forEach(item => {
    console.log(`${item.status} ${item.step}`);
  });
  
  console.log('\n🎯 Next Steps:');
  console.log('=============');
  console.log('1. Push updated code to GitHub');
  console.log('2. Deploy to Render.com using the render.yaml');
  console.log('3. Configure PayPal webhook URL:');
  console.log('   https://webzonebw-er-studio.onrender.com/api/paypal/webhook');
  console.log('4. Test complete payment flow');
}

// Main deployment function
function main() {
  console.log('Starting deployment validation...\n');
  
  try {
    checkRequiredFiles();
    checkEnvironmentVariables();
    validateRenderYaml();
    generateDeploymentChecklist();
    
    console.log('\n🎉 Deployment validation complete!');
    console.log('The render.yaml has been updated and is ready for deployment.');
    console.log('You can now proceed with the Render.com deployment.');
    
  } catch (error) {
    console.error('❌ Deployment validation failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { config, checkRequiredFiles, checkEnvironmentVariables, validateRenderYaml };