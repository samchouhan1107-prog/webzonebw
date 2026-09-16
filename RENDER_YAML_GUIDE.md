# 🎯 Render.com YAML Configuration Guide

## 📋 **UNDERSTANDING THE .YAML FILE**

The `render.yaml` file is the **configuration blueprint** for your Render.com deployment. It tells Render exactly how to build, run, and configure your WebZoneBW ER Studio.

---

## 🔧 **YAML FILE EXPLAINED**

### **File Location:**
```
webzonebw-in/
├── render.yaml  ← This file
├── server.js    ← Your Node.js application
├── package.json ← Dependencies
└── .env         ← Environment variables
```

### **Complete YAML Breakdown:**

```yaml
# Comment explaining the file purpose
services:
  - type: web                    # Type of service (web service)
    name: webzonebw-er-studio    # Service name (appears in Render dashboard)
    env: node                    # Runtime environment (Node.js)
    buildCommand: npm install    # Command to install dependencies
    startCommand: node server.js  # Command to start the application
    envVars:                     # Environment variables
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: TRUST_PROXY
        value: true
      # ... more variables
    regions:
      - oregon                   # Deployment region
    healthCheck:                 # Health monitoring
      path: /api/health
      interval: 10
      timeout: 5
      method: GET
      statusCode: 200
    envVarScope: RUN_TIME        # When variables are available
```

---

## 🎯 **KEY CONFIGURATION EXPLAINED**

### **1. Service Configuration**
```yaml
type: web                    # Web service (exposes HTTP/HTTPS)
name: webzonebw-er-studio    # Unique service name
env: node                    # Node.js runtime
```

### **2. Build & Commands**
```yaml
buildCommand: npm install    # Installs dependencies
startCommand: node server.js  # Starts your server
```

### **3. Environment Variables**
```yaml
envVars:
  - key: NODE_ENV
    value: production         # Production mode
  - key: PORT
    value: 10000             # Render's standard port
  - key: TRUST_PROXY
    value: true              # Trust Render's proxy
  - key: PAYPAL_CLIENT_ID
    sync: false              # Secure variable (not in logs)
```

### **4. Security Variables (sync: false)**
```yaml
- key: PAYPAL_CLIENT_ID
  sync: false              # Never shown in logs
- key: PAYPAL_CLIENT_SECRET  
  sync: false              # Secure payment credentials
- key: ADMIN_KEY
  sync: false              # Admin access key
```

### **5. Regions**
```yaml
regions:
  - oregon                 # Oregon, USA (recommended)
```

### **6. Health Check**
```yaml
healthCheck:
  path: /api/health        # Checks this endpoint
  interval: 10            # Every 10 seconds
  timeout: 5               # 5 second timeout
  method: GET              # HTTP method
  statusCode: 200         # Expected status code
```

---

## 🚀 **DEPLOYMENT PROCESS**

### **Step 1: Push to GitHub**
```bash
git add render.yaml
git commit -m "Add Render.com configuration"
git push origin main
```

### **Step 2: Create Render Service**
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`

### **Step 3: Configure Environment Variables**
In Render dashboard, add these variables:

**Public Variables:**
```bash
NODE_ENV=production
PORT=10000
TRUST_PROXY=true
ALLOWED_ORIGINS=https://webzonebw.in,https://www.webzonebw.in
PAYPAL_MODE=live
PAYPAL_CURRENCY=USD
```

**Secret Variables (sync: false):**
```bash
PAYPAL_CLIENT_ID=BAAYC0cx-779OEpb2CDm6bre4HfFFDsAdiZm-8sYWB_lZoAxAR30RYTnA3GTExkYZxtn90nstAQXnmpaj4
PAYPAL_CLIENT_SECRET=REDACTED_SET_IN_RENDER_DASHBOARD
PAYPAL_WEBHOOK_ID=8V4F85QRAC6PQ
ORDER_EMAIL=samchouhan1107@gmail.com
ADMIN_KEY=REDACTED_SET_IN_RENDER_DASHBOARD
SESSION_SECRET=REDACTED_SET_IN_RENDER_DASHBOARD
```

### **Step 4: Deploy**
1. Click "Deploy" in Render dashboard
2. Wait for build completion (2-5 minutes)
3. Monitor logs for any errors
4. Test the deployed service

---

## 🔍 **WHAT TO EXPECT AFTER DEPLOYMENT**

### **Render.com Will:**
1. **Clone your repository**
2. **Run `npm install`** (install dependencies)
3. **Start your server** with `node server.js`
4. **Set environment variables**
5. **Monitor health** via `/api/health`
6. **Provide HTTPS** automatically

### **Your Service Will Be Available At:**
```
https://webzonebw-er-studio.onrender.com
```

### **API Endpoints Will Work:**
```
https://webzonebw-er-studio.onrender.com/api/health
https://webzonebw-er-studio.onrender.com/api/paypal/client-id
https://webzonebw-er-studio.onrender.com/api/order-email
```

---

## 🎯 **KEY DIFFERENCES FROM LOCAL DEVELOPMENT**

### **Local Development:**
```bash
PORT=3000                  # Local port
NODE_ENV=development       # Development mode
TRUST_PROXY=false          # No proxy
```

### **Render Production:**
```bash
PORT=10000                # Render's standard port
NODE_ENV=production       # Production mode
TRUST_PROXY=true          # Trust Render's proxy
HTTPS automatically enabled
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

1. **Build Fails:**
   - Check `package.json` dependencies
   - Verify Node.js version compatibility

2. **Start Fails:**
   - Check `server.js` syntax
   - Verify environment variables

3. **Health Check Fails:**
   - Ensure `/api/health` returns 200
   - Check server is running on port 10000

4. **Environment Variables Missing:**
   - Add all required variables in Render dashboard
   - Check `sync: false` variables are set as secrets

---

## 🎉 **DEPLOYMENT CHECKLIST**

### **Before Deployment:**
- [ ] `render.yaml` is in repository root
- [ ] All environment variables configured
- [ ] PayPal credentials added
- [ ] Health check endpoint working locally
- [ ] Code pushed to GitHub

### **After Deployment:**
- [ ] Service builds successfully
- [ ] Health check passes
- [ ] API endpoints respond
- [ ] PayPal integration works
- [ ] ER Studio upgrades functional

---

## 🎯 **FINAL NOTES**

### **Why This Configuration Works:**
- **Auto-scaling:** Render handles traffic spikes
- **Global CDN:** Fast worldwide delivery
- **HTTPS included:** No SSL certificate needed
- **Health monitoring:** Automatic restart on failures
- **Environment variables:** Secure configuration management

### **Next Steps:**
1. Push the `render.yaml` file
2. Create Render service
3. Configure environment variables
4. Deploy and test

**Your WebZoneBW ER Studio will be production-ready in minutes!** 🚀