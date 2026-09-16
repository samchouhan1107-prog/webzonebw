# 🎯 WebZoneBW ER Studio - PayPal Webhook Setup Guide

## 🔗 **Current PayPal Payment Link**
**Payment Link:** https://www.paypal.com/ncp/payment/6PPYKEYGHDMNY

---

## 📋 **PayPal Webhook Configuration Steps**

### **Step 1: Access PayPal Developer Dashboard**

1. **Go to PayPal Developer Dashboard:**
   ```
   https://developer.paypal.com
   ```

2. **Navigate to Webhooks:**
   - Log in with your PayPal account
   - Go to "Dashboard" → "Webhooks"

### **Step 2: Create New Webhook**

1. **Click "Create Webhook"**
2. **Enter Webhook URL:**
   ```
   https://webzonebw.onrender.com/api/paypal/webhook
   ```

3. **Click "Create"**

### **Step 3: Configure Webhook Events**

**Select these critical events:**
- ✅ `CHECKOUT.ORDER.COMPLETED`
- ✅ `PAYMENT.CAPTURE.COMPLETED`

**Why these events:**
- `CHECKOUT.ORDER.COMPLETED`: Triggers when order is created
- `PAYMENT.CAPTURE.COMPLETED`: Triggers when payment is successfully captured

4. **Click "Save"**

### **Step 4: Verify Webhook**

1. **Automatic Verification:**
   - PayPal will automatically send a verification request to your webhook URL
   - Your server should respond with HTTP 200 OK

2. **Manual Verification Test:**
   - Go to "Webhooks" in PayPal Developer Dashboard
   - Click "Test" next to your webhook
   - Select "CHECKOUT.ORDER.COMPLETED"
   - Verify your server receives the test event

---

## 🧪 **Test the Webhook**

### **Test Method 1: PayPal Dashboard Test**

1. **Go to PayPal Developer Dashboard**
2. **Navigate to "Webhooks"**
3. **Click "Test"** next to your webhook
4. **Select "CHECKOUT.ORDER.COMPLETED"**
5. **Check server logs for webhook receipt**

### **Test Method 2: Manual Payment Test**

1. **Use the payment link you provided:**
   ```
   https://www.paypal.com/ncp/payment/6PPYKEYGHDMNY
   ```

2. **Complete a test payment** (use test mode if available)

3. **Monitor server logs** for webhook receipt

### **Test Method 3: cURL Test**

```bash
# Test webhook endpoint
curl -X POST https://webzonebw.onrender.com/api/paypal/webhook \
  -H "Content-Type: application/json" \
  -H "PayPal-Auth-Algo: PayPal" \
  -H "PayPal-Auth-Assertion: [signature]" \
  -H "PayPal-Transmission-Id: [transmission-id]" \
  -H "PayPal-Cert-Url: [cert-url]" \
  -d '{
    "event_type": "CHECKOUT.ORDER.COMPLETED",
    "resource": {
      "id": "test-order-id",
      "status": "COMPLETED",
      "purchase_units": [
        {
          "amount": {
            "currency_code": "USD",
            "value": "5.99"
          }
        }
      ]
    }
  }'
```

---

## 📊 **Expected Webhook Payload Structure**

When PayPal sends a webhook, it will contain:

```json
{
  "event_type": "CHECKOUT.ORDER.COMPLETED",
  "resource": {
    "id": "6PPYKEYGHDMNY",
    "status": "COMPLETED",
    "payer": {
      "email_address": "buyer@example.com",
      "name": {
        "given_name": "John",
        "surname": "Doe"
      }
    },
    "purchase_units": [
      {
        "amount": {
          "currency_code": "USD",
          "value": "5.99"
        }
      }
    ],
    "links": [
      {
        "href": "https://api.paypal.com/v2/checkout/orders/6PPYKEYGHDMNY",
        "rel": "self",
        "method": "GET"
      }
    ]
  },
  "links": [
    {
      "href": "https://api.paypal.com/v2/notifications/webhooks/WH-1234567890",
      "rel": "self",
      "method": "PATCH"
    }
  ]
}
```

---

## 🔍 **Monitor Webhook Activity**

### **Check Render Logs**

1. **Go to Render Dashboard:**
   ```
   https://dashboard.render.com
   ```

2. **Select `webzonebw-er-studio`**
3. **Go to "Logs" tab**
4. **Look for webhook-related logs:**
   - `POST /api/paypal/webhook`
   - Webhook verification attempts
   - Payment processing logs

### **Expected Log Entries**

**Successful Webhook:**
```
[WEBZONEBW] POST /api/paypal/webhook 200 45ms
[WEBZONEBW] Webhook verified: CHECKOUT.ORDER.COMPLETED
[WEBZONEBW] License activated for: buyer@example.com
```

**Failed Webhook:**
```
[WEBZONEBW] POST /api/paypal/webhook 400 12ms
[WEBZONEBW] Webhook verification failed: Invalid signature
```

---

## 🚨 **Troubleshooting Webhook Issues**

### **Issue 1: Webhook Not Receiving Events**

**Symptoms:**
- PayPal payment completed but no license activation
- Server logs show no webhook requests

**Solutions:**
1. **Verify webhook URL is correct**
   ```
   https://webzonebw.onrender.com/api/paypal/webhook
   ```

2. **Check webhook is enabled in PayPal dashboard**
3. **Test webhook with PayPal's test feature**
4. **Verify server is accessible from PayPal's servers**

### **Issue 2: Webhook Verification Failed**

**Symptoms:**
- Webhook received but verification fails
- Error: "Invalid signature" or "Certificate verification failed"

**Solutions:**
1. **Check webhook secret is configured**
2. **Verify certificate URL is correct**
3. **Ensure server can access PayPal's certificate**
4. **Check webhook endpoint returns 200 OK**

### **Issue 3: Payment Not Processing**

**Symptoms:**
- PayPal payment successful but no license activation
- Webhook received but payment processing fails

**Solutions:**
1. **Check PayPal credentials in Render dashboard**
2. **Verify webhook payload contains required data**
3. **Check license activation endpoint**
4. **Test with valid test data**

---

## 🎯 **Webhook Setup Checklist**

### **✅ Complete When:**

**Configuration:**
- [ ] Webhook URL: `https://webzonebw.onrender.com/api/paypal/webhook`
- [ ] Events: `CHECKOUT.ORDER.COMPLETED`, `PAYMENT.CAPTURE.COMPLETED`
- [ ] Webhook verified by PayPal

**Testing:**
- [ ] PayPal dashboard test successful
- [ ] Manual payment test successful
- [ ] Server logs show webhook receipt
- [ ] License activation working

**Monitoring:**
- [ ] Render logs show no webhook errors
- [ ] Payment processing logs are clean
- [ ] User receives license after payment

---

## 🎉 **Next Steps After Webhook Setup**

1. **Test the complete payment flow:**
   - Go to https://webzonebw.onrender.com/er/
   - Click "₹499 Upgrade" or "$5.99 Upgrade"
   - Complete payment
   - Verify license activates

2. **Monitor user experience:**
   - Check if premium filters unlock
   - Verify license persistence
   - Test different payment scenarios

3. **Monitor server performance:**
   - Check response times
   - Monitor error rates
   - Track successful payments

---

**Your WebZoneBW ER Studio is ready for PayPal webhook integration!** 🚀✅