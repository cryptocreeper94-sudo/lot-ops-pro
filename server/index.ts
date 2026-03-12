import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import http from "http";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import { registerStripeRoutes } from "./routes-stripe";
import { setupVite, serveStatic, log } from "./vite";
import { initStripe } from "./stripe-init";
import { checkAndUpdateDeploymentVersion } from "./auto-version";

const app = express();

// Health check endpoint - MUST be first for Autoscale to pass health checks
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});

// Also support /health for compatibility
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});

// Serve Lot Buddy avatar catalog from attached_assets folder
const lotBuddyCatalogPath = path.resolve(process.cwd(), "attached_assets/lotbuddy_catalog");
if (fs.existsSync(lotBuddyCatalogPath)) {
  app.use("/lotbuddy_catalog", express.static(lotBuddyCatalogPath));
  log("Serving Lot Buddy catalog from: " + lotBuddyCatalogPath);
}

// Serve public assets (vehicle catalog, scene assets, etc.)
const publicPath = path.resolve(process.cwd(), "public");
if (fs.existsSync(publicPath)) {
  app.use("/vehicle_catalog", express.static(path.join(publicPath, "vehicle_catalog")));
  app.use("/scene_assets", express.static(path.join(publicPath, "scene_assets")));
  log("Serving public assets from: " + publicPath);
}

// Configure session store with error handling
const isProduction = process.env.NODE_ENV === 'production';

function createSessionMiddleware() {
  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'lot-ops-pro-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 12 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax'
    },
    rolling: true,
  };

  // Always use memory store for reliability - sessions don't need to persist across restarts
  log("Using memory session store");

  return session(sessionConfig);
}

app.use(createSessionMiddleware());

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  limit: '50mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  // Only initialize and register Stripe if not disabled
  if (process.env.SKIP_STRIPE !== 'true') {
    // Initialize Stripe integration lazily (non-blocking for faster startup)
    initStripe().catch(err => {
      console.error('Stripe initialization failed:', err);
    });
    
    // Register Stripe routes
    registerStripeRoutes(app);
  } else {
    log('Stripe routes disabled via SKIP_STRIPE');
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('Express error:', err);
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Check for new deployment and auto-update version (non-blocking)
    checkAndUpdateDeploymentVersion().catch(err => {
      console.error('[Auto-Version] Error:', err);
    });
  });
})();
