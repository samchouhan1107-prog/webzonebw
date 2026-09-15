# WebZoneBW ER Studio - Render.com Deployment Guide

## 🚀 Quick Deployment to Render.com

### Prerequisites
1. GitHub account with the WebZoneBW repository
2. Render.com account
3. PayPal production credentials

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Create Render Service
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `webzonebw-er-studio` service

### Step 3: Configure Environment Variables
In the Render dashboard, add these environment variables:

**Required Variables:**
```bash
NODE_ENV=production
PORT=10000
TRUST_PROXY=true
ALLOWED_ORIGINS=https://webzonebw.in,https://www.webzonebw.in
```

**PayPal Variables (Get from PayPal Developer Dashboard):**
```bash
PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_CLIENT_SECRET=your_production_client_secret
PAYPAL_MODE=live
PAYPAL_CURRENCY=USD
PAYPAL_WEBHOOK_ID=your_production_webhook_id
ORDER_EMAIL=support@webzonebw.in
ADMIN_KEY=your_admin_key_for_manual_licenses
SESSION_SECRET=your_random_session_secret
```

### Step 4: Configure Custom Domain
1. In your domain registrar, add these DNS records:
   ```bash
   A record @ → 172.67.73.164 (Render IP)
   CNAME www → webzonebw-er-studio.onrender.com
   ```

### Step 5: Update GitHub Pages CNAME
Update your `CNAME` file to point to your custom domain:
```bash
echo "webzonebw.in" > CNAME
git add CNAME
git commit -m "Update CNAME for custom domain"
git push
```

### Step 6: Set up Webhook in PayPal
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com)
2. Create a webhook URL: `https://webzonebw-er-studio.onrender.com/api/paypal/webhook`
3. Configure webhook events:
   - `CHECKOUT.ORDER.COMPLETED`
   - `PAYMENT.CAPTURE.COMPLETED`

### Step 7: Test the Deployment
1. Wait for deployment to complete (usually 2-5 minutes)
2. Test these endpoints:
   ```
   https://webzonebw-er-studio.onrender.com/api/health
   https://webzonebw-er-studio.onrender.com/api/paypal/client-id
   https://webzonebw-er-studio.onrender.com/api/order-email
   ```

### Step 8: Update Static Files to Use API
Update the JavaScript files to use the new API base URL. In `js/er-license.js`:

```javascript
// Change this line:
var API_BASE = ""; // same origin (server.js)

// To this for Render deployment:
var API_BASE = "https://webzonebw-er-studio.onrender.com";
```

## 🔧 Configuration Details

### Render.yaml Configuration
- **Service Type**: Web Service
- **Runtime**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Port**: 10000 (Render's standard)
- **Health Check**: `/api/health`

### Environment Variables
- **NODE_ENV**: `production`
- **PORT**: `10000`
- **TRUST_PROXY**: `true` (for Render's proxy)
- **ALLOWED_ORIGINS**: Your domain(s)

### Security Headers
The server already includes:
- Helmet security headers
- CORS configuration
- Rate limiting
- Content Security Policy

## 📋 Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Render service created
- [ ] Environment variables configured
- [ ] Custom domain set up
- [ ] PayPal webhook configured
- [ ] API base URL updated in frontend
- [ ] Health check passing
- [ ] All endpoints tested

## 🚨 Important Notes

1. **Render provides HTTPS automatically** - no need for SSL certificates
2. **The server trusts Render's proxy** - set `TRUST_PROXY=true`
3. **Use Render's assigned port** - `10000`, not `3000`
4. **Allow 2-5 minutes** for deployment
5. **Monitor deployment logs** for any errors

## 🔍 Troubleshooting

### Common Issues
1. **Deployment fails**: Check npm install logs
2. **Health check fails**: Ensure `/api/health` returns 200
3. **CORS errors**: Verify ALLOWED_ORIGINS configuration
4. **PayPal errors**: Check credentials in environment variables

### Testing Commands
```bash
# Test locally with Render config
PORT=10000 TRUST_PROXY=true NODE_ENV=production node server.js

# Test health endpoint
curl https://webzonebw-er-studio.onrender.com/api/health
```

## 🎯 Next Steps After Deployment

1. **Test complete flow**: PayPal checkout → license activation → premium unlock
2. **Monitor server logs** for any issues
3. **Set up monitoring** for production alerts
4. **Configure backup strategy** for license data
5. **Set up CI/CD** for automatic deployments

---

**Deployment should take approximately 5-10 minutes from start to finish.**