# 🧪 WebZoneBW ER Studio - Manual Testing Guide

## 📋 **Current Status**

**Automated tests are experiencing network connectivity issues.**  
**Please use the manual testing approach below.**

---

## 🔍 **Manual Testing Instructions**

### **Step 1: Test Server Endpoints in Your Browser**

Open these URLs directly in your web browser:

1. **Health Check:**
   ```
   https://webzonebw.onrender.com/api/health
   ```
   **Expected:** You should see JSON response like `{"status":"ok","timestamp":"..."}`

2. **PayPal Client ID:**
   ```
   https://webzonebw.onrender.com/api/paypal/client-id
   ```
   **Expected:** You should see JSON response like `{"clientId":"A..."}`

3. **Order Email:**
   ```
   https://webzonebw.onrender.com/api/order-email
   ```
   **Expected:** You should see JSON response like `{"email":"samchouhan1107@gmail.com"}`

4. **ER Studio:**
   ```
   https://webzonebw.onrender.com/er/
   ```
   **Expected:** ER Studio interface should load

### **Step 2: Check Render Dashboard**

1. **Go to:** https://dashboard.render.com
2. **Select:** `webzonebw-er-studio`
3. **Check:**
   - Service status (should be "running")
   - Recent deployment logs
   - Environment variables are set correctly

### **Step 3: Test PayPal Webhook Configuration**

**Current PayPal Payment Link:**
```
https://www.paypal.com/ncp/payment/6PPYKEYGHDMNY
```

---

## 🎯 **PayPal Webhook Setup**

### **Step 1: Access PayPal Developer Dashboard**

1. **Go to:** https://developer.paypal.com
2. **Log in** with your PayPal account
3. **Navigate to:** "Dashboard" → "Webhooks"

### **Step 2: Create Webhook**

1. **Click "Create Webhook"**
2. **Enter Webhook URL:**
   ```
   https://webzonebw.onrender.com/api/paypal/webhook
   ```
3. **Click "Create"**

### **Step 3: Configure Events**

**Select these events:**
- ✅ `CHECKOUT.ORDER.COMPLETED`
- ✅ `PAYMENT.CAPTURE.COMPLETED`

4. **Click "Save"**

### **Step 4: Test Webhook**

1. **Go to your PayPal payment page:**
   ```
   https://www.paypal.com/ncp/payment/6PPYKEYGHDMNY
   ```
2. **Complete a test payment** (use PayPal's test mode if available)
3. **Monitor server logs** for webhook receipt

---

## 🧪 **Manual Testing Commands**

### **Using curl (if available):**

```bash
# Test Health Check
curl -X GET https://webzonebw.onrender.com/api/health

# Test PayPal Client ID
curl -X GET https://webzonebw.onrender.com/api/paypal/client-id

# Test Order Email
curl -X GET https://webzonebw.onrender.com/api/order-email

# Test Webhook Endpoint
curl -X POST https://webzonebw.onrender.com/api/paypal/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

### **Using PowerShell:**

```powershell
# Test Health Check
Invoke-WebRequest -Uri "https://webzonebw.onrender.com/api/health" -Method GET

# Test PayPal Client ID
Invoke-WebRequest -Uri "https://webzonebw.onrender.com/api/paypal/client-id" -Method GET

# Test Order Email
Invoke-WebRequest -Uri "https://webzonebw.onrender.com/api/order-email" -Method GET
```

---

## 📊 **Expected Results**

### **✅ Working Endpoints:**
- Health Check: Returns `{"status":"ok"}`
- PayPal Client ID: Returns `{"clientId":"A..."}`
- Order Email: Returns `{"email":"samchouhan1107@gmail.com"}`
- ER Studio: Loads properly

### **✅ Working Webhook:**
- PayPal sends webhook events
- Server receives and processes events
- License activates after payment
- Premium filters unlock

---

## 🔧 **Troubleshooting**

### **If endpoints are not responding:**

1. **Check Render Dashboard:**
   - Service status
   - Recent logs
   - Environment variables

2. **Check Environment Variables:**
   - PayPal credentials are set
   - PORT is correct (10000)
   - NODE_ENV is production

3. **Check Deployment Logs:**
   - Look for error messages
   - Check if service is running
   - Verify build was successful

### **If PayPal integration is not working:**

1. **Verify PayPal Credentials:**
   - Client ID and Secret are correct
   - Mode is set to "live"
   - Currency is "USD"

2. **Check Webhook Configuration:**
   - URL is correct
   - Events are selected
   - Webhook is enabled

---

## 🎯 **Complete Testing Sequence**

### **1. Server Testing:**
- [ ] Test health endpoint in browser
- [ ] Test PayPal client ID in browser
- [ ] Test order email in browser
- [ ] Test ER Studio in browser

### **2. PayPal Configuration:**
- [ ] Configure webhook in PayPal Developer Dashboard
- [ ] Test webhook with PayPal payment link
- [ ] Monitor server logs for webhook receipt

### **3. Payment Flow Testing:**
- [ ] Test premium upgrade button in ER Studio
- [ ] Complete payment with PayPal
- [ ] Verify license activates
- [ ] Check premium filters unlock

---

## 🎉 **Success Checklist**

### **✅ When Everything is Working:**

**Server Endpoints:**
- [ ] Health check returns 200 OK
- [ ] PayPal client ID endpoint working
- [ ] Order email endpoint working
- [ ] ER Studio loads properly

**PayPal Integration:**
- [ ] Webhook configured in PayPal dashboard
- [ ] Webhook URL correct
- [ ] Events selected correctly
- [ ] Webhook test successful

**Payment Flow:**
- [ ] Premium upgrade button works
- [ ] PayPal modal opens
- [ ] Payment completes successfully
- [ ] License activates automatically
- [ ] Premium filters unlock

---

## 🚨 **Critical Issues to Watch For**

### **Server Issues:**
- Service not running in Render
- Environment variables not set
- Build errors in deployment logs

### **PayPal Issues:**
- Invalid credentials
- Webhook URL incorrect
- Events not selected
- Webhook not enabled

### **Payment Issues:**
- Premium button not working
- Payment modal not opening
- License not activating
- Premium filters not unlocking

---

## 🎯 **Final Verification**

Once all tests pass, your WebZoneBW ER Studio will be fully functional:

✅ **Live Server:** https://webzonebw.onrender.com  
✅ **ER Studio:** https://webzonebw.onrender.com/er/  
✅ **PayPal Integration:** Complete and working  
✅ **Premium Upgrades:** Fully functional  
✅ **License System:** Activated and persistent  

**Congratulations! Your WebZoneBW ER Studio is ready for production!** 🎉🚀