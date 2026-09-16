# 🧪 WebZoneBW ER Studio - Webhook Testing Guide

## 📋 **Current Testing Status**

### **⚠️ Network Connectivity Issues Detected**

The automated tests are timing out, which could be due to:
- Network connectivity problems
- Server deployment issues
- Firewall restrictions
- Render.com deployment status

---

## 🔍 **Manual Testing Approach**

### **Step 1: Check Server Status**

**Test URLs manually in your browser:**

1. **Health Check:**
   ```
   https://webzonebw.onrender.com/api/health
   ```
   **Expected Response:** `{"status":"ok","timestamp":"..."}`

2. **PayPal Client ID:**
   ```
   https://webzonebw.onrender.com/api/paypal/client-id
   ```
   **Expected Response:** `{"clientId":"A..."}`

3. **ER Studio:**
   ```
   https://webzonebw.onrender.com/er/
   ```
   **Expected Response:** ER Studio interface loads

### **Step 2: Check Render Dashboard**

**Verify deployment status:**

1. **Go to:** https://dashboard.render.com
2. **Select:** `webzonebw-er-studio`
3. **Check:**
   - Service status (should be "running")
   - Recent deployment logs
   - Environment variables

### **Step 3: Test PayPal Webhook Configuration**

**Current PayPal Payment Link:**
```
https://www.paypal.com/ncp/payment/6PPYKEYGHDMNY
```

---

## 🎯 **Manual Testing Checklist**

### **✅ Test Server Endpoints**

**Test in Browser or using curl:**

```bash
# Test 1: Health Check
curl -X GET https://webzonebw.onrender.com/api/health

# Test 2: PayPal Client ID
curl -X GET https://webzonebw.onrender.com/api/paypal/client-id

# Test 3: Order Email
curl -X GET https://webzonebw.onrender.com/api/order-email

# Test 4: License Verification
curl -X POST https://webzonebw.onrender.com/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"license": "test"}'
```

### **✅ Test Webhook Configuration**

**1. Configure Webhook in PayPal Developer Dashboard:**

- **URL:** `https://webzonebw.onrender.com/api/paypal/webhook`
- **Events:** `CHECKOUT.ORDER.COMPLETED`, `PAYMENT.CAPTURE.COMPLETED`

**2. Test Webhook:**

```bash
# Test webhook endpoint
curl -X POST https://webzonebw.onrender.com/api/paypal/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

### **✅ Test Complete Payment Flow**

**1. Open ER Studio:**
```
https://webzonebw.onrender.com/er/
```

**2. Test Premium Upgrade:**
- Click "₹499 Upgrade" or "$5.99 Upgrade"
- Verify PayPal modal opens
- Complete payment (use test mode)

**3. Test with Your PayPal Link:**
```
https://www.paypal.com/ncp/payment/6PPYKEYGHDMNY
```

---

## 🔧 **Troubleshooting Network Issues**

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

### **✅ Complete Payment Flow:**
- User clicks upgrade button
- PayPal modal opens
- Payment completes successfully
- License activates automatically

---

## 🎯 **Next Steps**

### **1. Immediate Actions:**

1. **Check Render Dashboard** for service status
2. **Test endpoints manually** in browser
3. **Configure PayPal webhook** in PayPal Developer Dashboard
4. **Test payment flow** with your PayPal link

### **2. Testing Sequence:**

1. **Test server endpoints** (health, PayPal client ID)
2. **Configure PayPal webhook**
3. **Test webhook with PayPal payment link**
4. **Test complete payment flow** from ER Studio

### **3. Monitoring:**

1. **Check server logs** for webhook receipt
2. **Monitor payment processing**
3. **Verify license activation**
4. **Test user experience**

---

## 🚨 **Critical Checks**

### **If endpoints are not responding:**
- Check Render service status
- Verify environment variables
- Check deployment logs for errors
- Ensure service is running

### **If PayPal integration is not working:**
- Verify PayPal credentials
- Check webhook configuration
- Test webhook endpoint
- Monitor server logs

---

## 🎉 **Success Indicators**

**When everything is working:**
✅ All endpoints return 200 OK  
✅ PayPal webhook is configured  
✅ Payment flow completes successfully  
✅ License activates automatically  
✅ Premium filters unlock for users  

**Your WebZoneBW ER Studio is ready for PayPal integration!** 🚀✅