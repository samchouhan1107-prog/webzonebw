#!/usr/bin/env node

/**
 * WebZoneBW Analytics Redeployment Script
 * 
 * This script helps redeploy the updated server with analytics support
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 WebZoneBW Analytics Redeployment Script');
console.log('==========================================');

// Check if required files exist
const requiredFiles = [
    'server.js',
    'analytics.html',
    'data/analytics.json',
    'render.yaml'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
    console.error('❌ Missing required files:', missingFiles);
    process.exit(1);
}

console.log('✅ All required files found');

// Check analytics.html route in server.js
const serverContent = fs.readFileSync('server.js', 'utf8');
if (!serverContent.includes('app.get("/analytics.html"')) {
    console.log('⚠️  Analytics route not found in server.js');
    console.log('🔧 Adding analytics route...');
    
    // Add analytics route
    const analyticsRoute = `
app.get("/analytics.html", (req, res) => {
    const analyticsDashboard = path.join(__dirname, "analytics.html");
    if (!fs.existsSync(analyticsDashboard)) {
        return res.status(404).send("Analytics dashboard not found");
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    return res.sendFile(analyticsDashboard, (error) => {
        if (error) next(error);
    });
});
`;
    
    // Insert the route before the client-side routing fallback
    const insertPosition = serverContent.indexOf('app.use((req, res, next) => {');
    if (insertPosition === -1) {
        console.error('❌ Could not find insertion point for analytics route');
        process.exit(1);
    }
    
    const newServerContent = serverContent.slice(0, insertPosition) + analyticsRoute + '\n\n' + serverContent.slice(insertPosition);
    
    fs.writeFileSync('server.js', newServerContent);
    console.log('✅ Analytics route added to server.js');
} else {
    console.log('✅ Analytics route already exists in server.js');
}

// Check if data directory exists
if (!fs.existsSync('data')) {
    fs.mkdirSync('data', { recursive: true });
    console.log('✅ Created data directory');
}

// Check if analytics.json exists
if (!fs.existsSync('data/analytics.json')) {
    const initialAnalytics = {
        page_views: 0,
        unique_visitors: 0,
        performance_metrics: [],
        user_agents: {},
        ip_addresses: {},
        timestamps: []
    };
    fs.writeFileSync('data/analytics.json', JSON.stringify(initialAnalytics, null, 2));
    console.log('✅ Created initial analytics.json');
}

// Check render.yaml configuration
const renderContent = fs.readFileSync('render.yaml', 'utf8');
if (!renderContent.includes('port: 10000')) {
    console.log('⚠️  Port configuration not found in render.yaml');
    console.log('🔧 Adding port configuration...');
    
    // Add port configuration if not present
    if (!renderContent.includes('port:')) {
        const insertPosition = renderContent.indexOf('buildCommand:');
        if (insertPosition !== -1) {
            const newRenderContent = renderContent.slice(0, insertPosition) + '    port: 10000\n' + renderContent.slice(insertPosition);
            fs.writeFileSync('render.yaml', newRenderContent);
            console.log('✅ Added port configuration to render.yaml');
        }
    }
} else {
    console.log('✅ Port configuration found in render.yaml');
}

// Generate deployment instructions
console.log('\n📋 Deployment Instructions:');
console.log('============================');

console.log('1. Commit the changes to GitHub:');
console.log('   git add .');
console.log('   git commit -m "Add analytics dashboard and API endpoints"');
console.log('   git push origin restore-webzonebw-20260914-layout');

console.log('\n2. Redeploy to Render.com:');
console.log('   - Go to: https://dashboard.render.com');
console.log('   - Select webzonebw-er-studio service');
console.log('   - Click "Deploy" button');
console.log('   - Wait for deployment to complete');

console.log('\n3. Test the analytics dashboard:');
console.log('   - URL: https://webzonebw.onrender.com/analytics.html');
console.log('   - Should show analytics dashboard with monetization scripts');

console.log('\n4. Verify API endpoints:');
console.log('   - POST: https://webzonebw.onrender.com/api/analytics');
console.log('   - GET: https://webzonebw.onrender.com/api/analytics');

console.log('\n🎯 Expected Results:');
console.log('===================');
console.log('✅ Analytics dashboard loads successfully');
console.log('✅ Monetization scripts load with user consent');
console.log('✅ Performance metrics are tracked');
console.log('✅ Cookie consent banner appears');
console.log('✅ API endpoints respond correctly');

console.log('\n🚀 Redeployment Ready!');
console.log('=====================');
console.log('Your analytics system is ready for deployment!');