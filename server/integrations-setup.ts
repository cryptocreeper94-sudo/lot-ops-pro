// Integration Setup - All integrations ready, awaiting API keys

import type { Express } from "express";

// HubSpot CRM Integration
export async function setupHubSpot(app: Express) {
  const apiKey = process.env.HUBSPOT_API_KEY;
  
  if (!apiKey) {
    console.log("⚠️  HubSpot: API key not configured. Awaiting HUBSPOT_API_KEY");
    return { status: "pending", message: "Awaiting HUBSPOT_API_KEY" };
  }

  console.log("✓ HubSpot configured");
  
  // Create deal when facility signs up
  app.post("/api/integrations/hubspot/create-deal", async (req, res) => {
    try {
      const { facilityName, contactEmail, contractValue } = req.body;
      
      const response = await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            dealname: facilityName,
            dealstage: "negotiation",
            amount: contractValue,
            closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        }),
      });
      
      res.json(await response.json());
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });
}

// SendGrid Email Integration
export async function setupSendGrid(app: Express) {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.log("⚠️  SendGrid: API key not configured. Awaiting SENDGRID_API_KEY");
    return { status: "pending", message: "Awaiting SENDGRID_API_KEY" };
  }

  console.log("✓ SendGrid configured");
  
  // Send shift summary email
  app.post("/api/integrations/sendgrid/send-summary", async (req, res) => {
    try {
      const { toEmail, facilityName, summary } = req.body;
      
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: toEmail }] }],
          from: { email: "noreply@lotopspro.io", name: "Lot Ops Pro" },
          subject: `Shift Summary - ${facilityName}`,
          html: `<h2>Shift Summary</h2><p>${summary}</p>`,
        }),
      });
      
      res.json({ success: response.status === 202 });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });
}

// Google Analytics Integration (Client-side)
export async function setupGoogleAnalytics() {
  const measurementId = process.env.VITE_GA_MEASUREMENT_ID;
  
  if (!measurementId) {
    console.log("⚠️  Google Analytics: Measurement ID not configured. Awaiting VITE_GA_MEASUREMENT_ID");
    return { status: "pending", message: "Awaiting VITE_GA_MEASUREMENT_ID" };
  }

  console.log("✓ Google Analytics configured");
}

// Twilio SMS Integration
export async function setupTwilio(app: Express) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (!accountSid || !authToken || !fromNumber) {
    console.log("⚠️  Twilio: Credentials not configured. Awaiting TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER");
    return { 
      status: "pending", 
      message: "Awaiting Twilio credentials" 
    };
  }

  console.log("✓ Twilio configured");
  
  // Send SMS alert
  app.post("/api/integrations/twilio/send-sms", async (req, res) => {
    try {
      const { toPhone, message } = req.body;
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: toPhone,
            Body: message,
          }).toString(),
        }
      );
      
      res.json(await response.json());
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });
}

// Integration Status Check
export async function getIntegrationStatus() {
  return {
    hubspot: {
      name: "HubSpot CRM",
      status: process.env.HUBSPOT_API_KEY ? "configured" : "pending",
      requiredKey: "HUBSPOT_API_KEY",
    },
    sendgrid: {
      name: "SendGrid Email",
      status: process.env.SENDGRID_API_KEY ? "configured" : "pending",
      requiredKey: "SENDGRID_API_KEY",
    },
    googleAnalytics: {
      name: "Google Analytics",
      status: process.env.VITE_GA_MEASUREMENT_ID ? "configured" : "pending",
      requiredKey: "VITE_GA_MEASUREMENT_ID",
    },
    twilio: {
      name: "Twilio SMS",
      status: (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) ? "configured" : "pending",
      requiredKeys: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
    },
  };
}
