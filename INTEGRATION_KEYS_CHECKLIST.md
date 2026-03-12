# 🔑 Integration Keys Checklist - Copy & Paste

## All integrations are set up and ready. Add these keys to get them working:

---

### 1️⃣ **HubSpot CRM** (Sales Pipeline)
**Replit Secret Name:**
```
HUBSPOT_API_KEY
```

**How to Get:**
1. Go to https://app.hubspot.com/
2. Click Settings (bottom left) → Integrations → Private Apps
3. Create new private app
4. Scopes needed: crm.objects.deals.read, crm.objects.deals.write
5. Copy the "Private App Access Token"

**Paste Here:**
```
HUBSPOT_API_KEY=YOUR_TOKEN_HERE
```

---

### 2️⃣ **SendGrid Email** (Transactional Emails)
**Replit Secret Names:**
```
SENDGRID_API_KEY
```

**How to Get:**
1. Go to https://app.sendgrid.com/
2. Settings → API Keys → Create API Key
3. Give it name: "Lot Ops Pro"
4. Permissions: Full Access or Mail Send
5. Copy the key

**Paste Here:**
```
SENDGRID_API_KEY=YOUR_KEY_HERE
```

---

### 3️⃣ **Google Analytics 4** (User Tracking)
**Replit Secret Name:**
```
VITE_GA_MEASUREMENT_ID
```

**How to Get:**
1. Go to https://analytics.google.com/
2. Admin → Property → Data Streams → Web
3. Select your data stream (create if needed)
4. Copy "Measurement ID" (looks like G-XXXXXXXXXX)

**Paste Here:**
```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

### 4️⃣ **Twilio SMS** (Driver Alerts via Text)
**Replit Secret Names (All 3 Required):**
```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
```

**Note:** Recovery keys are auto-generated from your Account SID - no separate secret needed.

**How to Get:**
1. Go to https://www.twilio.com/console
2. Copy "Account SID" 
3. Click "View Auth Token" and copy it
4. Go to Phone Numbers → Active Numbers
5. Select or purchase a number
6. Copy the phone number (format: +1234567890)

**Paste Here:**
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🚀 How to Add Keys to Replit

**Option 1: Through Replit UI (Easiest)**
1. Click "Secrets" tab on the left
2. Paste each key/value pair
3. App auto-restarts with new keys

**Option 2: Copy-Paste All at Once**
```
HUBSPOT_API_KEY=YOUR_HUBSPOT_TOKEN
SENDGRID_API_KEY=YOUR_SENDGRID_KEY
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## ✅ Verification Checklist

After adding keys, check these endpoints to verify:

```bash
# Check integration status
curl https://lotopspro.io/api/integrations/status

# Send test email (SendGrid)
curl -X POST https://lotopspro.io/api/integrations/sendgrid/send-summary \
  -H "Content-Type: application/json" \
  -d '{
    "toEmail": "your-email@example.com",
    "facilityName": "Test Facility",
    "summary": "Test email from Lot Ops Pro"
  }'

# Send test SMS (Twilio)
curl -X POST https://lotopspro.io/api/integrations/twilio/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "toPhone": "+1234567890",
    "message": "Test SMS from Lot Ops Pro"
  }'

# Create test HubSpot deal
curl -X POST https://lotopspro.io/api/integrations/hubspot/create-deal \
  -H "Content-Type: application/json" \
  -d '{
    "facilityName": "Test Facility",
    "contactEmail": "test@example.com",
    "contractValue": 5000
  }'
```

---

## 💡 Priority Order (If Budget Constrained)

1. **FIRST: Google Analytics** (Free) - Track user behavior
2. **SECOND: Twilio** ($25/month) - SMS alerts are huge for enterprise
3. **THIRD: SendGrid** (Free tier available) - Email summaries
4. **FOURTH: HubSpot** (Free tier available) - Sales pipeline

---

## 🎯 What Each Integration Does

| Integration | What It Does | Priority | Cost |
|-------------|------------|----------|------|
| **Google Analytics** | Tracks user behavior, adoption, drop-offs | 🔴 High | FREE |
| **Twilio SMS** | Sends SMS alerts when app can't reach drivers | 🔴 High | $25/mo |
| **SendGrid Email** | Sends shift summaries, incident reports | 🟡 Medium | FREE* |
| **HubSpot CRM** | Manages sales pipeline, tracks deals | 🟡 Medium | FREE* |

*Free tier with limitations. Paid tiers available.

---

**Last Updated:** November 24, 2025
**Status:** All integrations ready for keys
**Next Step:** Provide keys above, app will auto-enable features
