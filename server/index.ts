import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import { storagePromise } from "./storage";

const PostgresStore = pgSession(session);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up session middleware with Postgres session store
app.set('trust proxy', 1); // Trust the first proxy to handle secure cookies

app.use(
  session({
    store: new PostgresStore({
      pool,
      tableName: 'session', // Default table name
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "sozayn-secret-key-DO-NOT-USE-IN-PRODUCTION",
    resave: false, // Changed to false to prevent race conditions
    saveUninitialized: false, // Changed to false for better security and to comply with laws requiring consent before setting cookies
    rolling: true, // Reset maxAge on every response
    cookie: { 
      secure: false, // Using false because Replit doesn't use HTTPS locally
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'none', // 'none' works with cross-site embedding
      path: '/', // Ensure cookie is valid for all paths
      domain: undefined // Let the browser set the domain automatically
    },
    name: 'sozayn.sid' // Custom name for the session cookie
  })
);

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

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
