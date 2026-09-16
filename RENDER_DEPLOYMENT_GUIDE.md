# 🚀 WebZoneBW ER Studio - Render.com Deployment Guide

## 📋 PRE-DEPLOYMENT CHECKLIST ✅

All configuration files are ready:
- ✅ `render.yaml` - Render service configuration
- ✅ `.env.render` - Environment variables template  
- ✅ `js/er-license.js` - Updated API_BASE to use `window.location.origin`
- ✅ `DEPLOYMENT.md` - Detailed deployment instructions
- ✅ `scripts/deploy-to-render.js` - Deployment helper script

---

## 🔧 STEP-BY-STEP DEPLOYMENT PROCESS

### Step 1: Push to GitHub
```bash
# Add all files
git add .

# Commit changes
git commit -m "Ready for Render deployment - Complete configuration"

# Push to GitHub
git push origin main
```

### Step 2: Create Render Service
1. Go to [render.com](https://render.com)
2. Sign in or create account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select the `webzonebw-in` repository
6. Click "Advanced settings"

### Step 3: Configure Render Service
**Service Details:**
- **Name**: `webzonebw-er-studio`
- **Region**: `Oregon` (or closest to your users)
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Environment Variables:**
Add these variables in the Render dashboard:

```bash
NODE_ENV=production
PORT=10000
TRUST_PROXY=true
ALLOWED_ORIGINS=https://webzonebw.in,https://www.webzonebw.in

# PayPal Credentials (from your PayPal Developer Dashboard)
PAYPAL_CLIENT_ID=BAAYC0cx-779OEpb2CDm6bre4HfFFDsAdiZm-8sYWB_lZoAxAR30RYTnA3GTExkYZxtn90nstAQXnmpaj4
PAYPAL_CLIENT_SECRET=REDACTED_SET_IN_RENDER_DASHBOARD
PAYPAL_MODE=live
PAYPAL_CURRENCY=USD
PAYPAL_WEBHOOK_ID=https://sandbox.paypal.com/ncp/payment/8Z5ZEYF8DKVVY
ORDER_EMAIL=samchouhan1107@gmail.com
ADMIN_KEY=REDACTED_SET_IN_RENDER_DASHBOARD
SESSION_SECRET=REDACTED_SET_IN_RENDER_DASHBOARD
```

### Step 4: Configure Custom Domain
**DNS Configuration:**
In your domain registrar (GoDaddy, Namecheap, etc.):

```bash
# A record
Type: A
Name: @ (or your domain)
Value: 172.67.73.164
TTL: 3600

# C record for www
Type: CNAME
Name: www
Value: webzonebw-er-studio.onrender.com
TTL: 3600
```

### Step 5: Update GitHub Pages CNAME
```bash
# Update CNAME file
echo "webzonebw.in" > CNAME

# Commit the change
git add CNAME
git commit -m "Update CNAME for custom domain"
git push origin main
```

### Step 6: Configure PayPal Webhook
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com)
2. Navigate to "Webhooks"
3. Create a new webhook with URL:
   ```
   https://webzonebw-er-studio.onrender.com/api/paypal/webhook
   ```
4. Select these events:
   - `CHECKOUT.ORDER.COMPLETED`
   - `PAYMENT.CAPTURE.COMPLETED`
5. Save the webhook

### Step 7: Deploy and Monitor
1. Click "Deploy" in Render dashboard
2. Wait for deployment (2-5 minutes)
3. Monitor logs for any errors
4. Test the endpoints:
   ```
   https://webzonebw-er-studio.onrender.com/api/health
   https://webzonebw-er-studio.onrender.com/api/paypal/client-id
   https://webzonebw-er-studio.onrender.com/api/order-email
   ```

---

## 🎯 DEPLOYMENT VERIFICATION

### Test Endpoints
```bash
# Health check
curl https://webzonebw-er-studio.onrender.com/api/health

# PayPal client ID
curl https://webzonebw-er-studio.onrender.com/api/paypal/client-id

# Order email
curl https://webzonebw-er-studio.onrender.com/api/order-email
```

### Expected Responses
- **Health**: `{"success":true,"status":"ok","server":"WEBZONEBW",...}`
- **PayPal**: `{"success":true,"clientId":"BAAYC0cx-779OEpb2CDm6bre4HfFFDsAdiZm-8sYWB_lZoAxAR30RYTnA3GTExkYZxtn90nstAQXnmpaj4",...}`
- **Order Email**: `{"success":true,"email":"samchouhan1107@gmail.com",...}`

---

## 🔍 TROUBLESHOOTING

### Common Issues
1. **Deployment fails**: Check npm install logs in Render dashboard
2. **Health check fails**: Ensure server is running on port 10000
3. **CORS errors**: Verify ALLOWED_ORIGINS configuration
4. **PayPal errors**: Check credentials are correct
5. **Domain issues**: Wait 24-48 hours for DNS propagation

### Commands for Testing
```bash
# Test locally with Render config
PORT=10000 TRUST_PROXY=true NODE_ENV=production node server.js

# Test API endpoints locally
curl http://localhost:10000/api/health
```

---

## 🚀 POST-DEPLOYMENT

### Final Testing
1. Visit `https://webzonebw.in/er/`
2. Test PayPal checkout flow
3. Test premium license activation
4. Test Halloween integration
5. Verify all features work

### Monitoring
- Monitor Render dashboard for errors
- Check server logs for issues
- Monitor PayPal webhook delivery
- Set up alerts for critical failures

---

## 📞 SUPPORT

If you encounter issues:
1. Check Render dashboard logs
2. Verify environment variables
3. Test endpoints individually
4. Check DNS propagation
5. Verify PayPal credentials

---

**🎉 Deployment should complete within 5-10 minutes!**