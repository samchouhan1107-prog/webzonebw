# 🎯 WebZoneBW ER Studio - PayPal Configuration Quick Reference

## 📋 **Configuration Checklist**

### **Step 1: PayPal Credentials in Render Dashboard**

**Environment Variables to Set:**

**Public Variables:**
```bash
NODE_ENV=production
PORT=10000
TRUST_PROXY=true
HOST=0.0.0.0
PAYPAL_MODE=live
PAYPAL_CURRENCY=USD
ALLOWED_ORIGINS=https://webzonebw.in,https://www.webzonebw.in
```

**Secret Variables:**
```bash
PAYPAL_CLIENT_ID=AYourRealClientIDHere
PAYPAL_CLIENT_SECRET=YourRealClientSecretHere
PAYPAL_WEBHOOK_ID=8V4F85QRAC6PQ
ORDER_EMAIL=samchouhan1107@gmail.com
ADMIN_KEY=YourSecureAdminKeyHere
SESSION_SECRET=YourSecureSessionSecretHere
```

### **Step 2: PayPal Webhook Configuration**

**Webhook URL:**
```
https://webzonebw.onrender.com/api/paypal/webhook
```

**Events to Configure:**
- ✅ `CHECKOUT.ORDER.COMPLETED`
- ✅ `PAYPAL.CAPTURE.COMPLETED`

### **Step 3: Testing Commands**

**API Endpoints to Test:**
```bash
# Health Check
curl -X GET https://webzonebw.onrender.com/api/health

# PayPal Client ID
curl -X GET https://webzonebw.onrender.com/api/paypal/client-id

# Order Email
curl -X GET https://webzonebw.onrender.com/api/order-email

# License Verification
curl -X POST https://webzonebw.onrender.com/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"license": "test"}'
```

### **Step 4: User Testing**

**Test URLs:**
- **Main Site:** https://webzonebw.onrender.com
- **ER Studio:** https://webzonebw.onrender.com/er/
- **Payment Flow:** Test premium upgrade button

---

## 🎯 **Quick Status Tracker**

### **✅ Completed:**
- [ ] Server deployment successful
- [ ] ER Studio accessible
- [ ] Health check working

### **⏳ Pending:**
- [ ] PayPal credentials configured
- [ ] PayPal webhook set up
- [ ] Payment flow tested
- [ ] User experience verified

---

## 🔗 **Important Links**

**PayPal Developer Dashboard:** https://developer.paypal.com  
**Render Dashboard:** https://dashboard.render.com  
**Webhook URL:** https://webzonebw.onrender.com/api/paypal/webhook  
**ER Studio:** https://webzonebw.onrender.com/er/  

---

## 🚨 **Troubleshooting**

**If PayPal endpoints return 503:**
- Check PayPal credentials in Render dashboard
- Verify credentials are in "Live" mode
- Ensure no typos in Client ID/Secret

**If webhook not working:**
- Verify webhook URL is correct
- Check webhook is enabled in PayPal dashboard
- Test webhook with PayPal's test feature

---

## 🎉 **Final Goal**

Complete these steps to enable:
✅ Premium upgrade functionality  
✅ PayPal payment processing  
✅ License activation system  
✅ Complete user experience  

**Status:** Ready for PayPal configuration! 🚀