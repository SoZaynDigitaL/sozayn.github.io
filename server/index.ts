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
app.use(
  session({
    store: new PostgresStore({
      pool,
      tableName: 'session', // Default table name
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "sozayn-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to false in development for HTTP
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax', // More permissive in development
      httpOnly: true, // Only accessed by server, not JS
      path: '/'
    }
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

  // Use the PORT environment variable for Heroku or default to 5000
  // this serves both the API and the client.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
