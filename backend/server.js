const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const colors = require("colors");
require("dotenv").config();

// Import database connection
const connectDB = require("./config/db");

// Import middleware
const {
  errorHandler,
  notFound,
  securityHeaders,
  requestLogger,
  rateLimitHandler,
} = require("./middleware/errorMiddleware");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const adminRoutes = require("./routes/adminRoutes");
const spoonacularRoutes = require('./routes/spoonacularRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const groceryRoutes = require('./routes/groceryRoutes');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// CORS middleware - MUST come before other middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        process.env.CLIENT_URL
      ].filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all localhost origins in development
      if (process.env.NODE_ENV === "development" && origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers"
    ],
    exposedHeaders: ["X-Total-Count", "X-Rate-Limit-Remaining"],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  })
);

// Handle preflight requests explicitly
app.options('*', cors());

// Security middleware
app.use(helmet());
app.use(securityHeaders);

// Rate limiting - Disabled for development
let limiter;
if (process.env.NODE_ENV === "production") {
  limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    handler: rateLimitHandler,
    message: {
      success: false,
      error: "Too many requests from this IP, please try again later.",
    },
  });
} else {
  // Disable rate limiting completely in development
  limiter = (req, res, next) => next();
}
app.use("/api", limiter);

// Body parser middleware
app.use(
  express.json({
    limit: process.env.MAX_FILE_UPLOAD_SIZE || "5mb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.MAX_FILE_UPLOAD_SIZE || "5mb",
  })
);

app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Request logging (development only)
if (process.env.NODE_ENV === "development") {
  app.use(requestLogger);
}

// Static files
app.use("/uploads", express.static("uploads"));

// Health check route
app.get("/api/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const uptime = process.uptime();

  res.status(200).json({
    success: true,
    message: "DietarySense API is running successfully!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
    database: dbStatus,
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: process.memoryUsage(),
  });
});

// API Documentation route
app.get("/api/docs", (req, res) => {
  res.json({
    message: "DietarySense API Documentation",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register a new user",
        "POST /api/auth/login": "Login user",
        "GET /api/auth/logout": "Logout user",
        "GET /api/auth/me": "Get current user",
        "POST /api/auth/onboarding": "Complete user onboarding",
      },
      users: {
        "GET /api/users/profile": "Get user profile (Protected)",
        "PUT /api/users/profile": "Update user profile (Protected)",
        "POST /api/users/calculate-calories": "Calculate calories (Protected)",
        "GET /api/users/meal-history": "Get meal history (Protected)",
        "POST /api/users/meal-history": "Add meal to history (Protected)",
      },
      recipes: {
        "GET /api/recipes": "Get all recipes (Public)",
        "GET /api/recipes/:id": "Get single recipe (Public)",
        "POST /api/recipes": "Create recipe (Protected)",
        "PUT /api/recipes/:id": "Update recipe (Protected)",
        "DELETE /api/recipes/:id": "Delete recipe (Protected)",
        "POST /api/recipes/:id/image": "Upload recipe image (Protected)",
      },
      mealplans: {
        "POST /api/mealplans/generate": "Generate meal plan (Protected)",
        "GET /api/mealplans": "Get user meal plans (Protected)",
        "GET /api/mealplans/:id": "Get single meal plan (Protected)",
        "PUT /api/mealplans/:id": "Update meal plan (Protected)",
        "DELETE /api/mealplans/:id": "Delete meal plan (Protected)",
        "GET /api/mealplans/:id/grocery-list": "Get grocery list (Protected)",
      },
      admin: {
        "GET /api/admin/dashboard": "Get dashboard stats (Admin)",
        "GET /api/admin/users": "Get all users (Admin)",
        "DELETE /api/admin/users/:id": "Delete user (Admin)",
        "GET /api/admin/recipes": "Get all recipes (Admin)",
        "PUT /api/admin/recipes/:id/approve": "Approve recipe (Admin)",
        "PUT /api/admin/recipes/:id/reject": "Reject recipe (Admin)",
        "GET /api/admin/meal-plans": "Get all meal plans (Admin)",
      },
      grocery: {
        "GET /api/grocery": "Get user's grocery list (Protected)",
        "POST /api/grocery": "Add grocery item (Protected)",
        "PUT /api/grocery/:id": "Update grocery item (Protected)",
        "DELETE /api/grocery/:id": "Delete grocery item (Protected)",
        "PATCH /api/grocery/:id/toggle": "Toggle purchased status (Protected)",
        "DELETE /api/grocery": "Clear all grocery items (Protected)",
        "GET /api/grocery/category/:category": "Get items by category (Protected)",
      },
      grocery: {
        "GET /api/grocery": "Get user's grocery list (Protected)",
        "POST /api/grocery": "Add grocery item (Protected)",
        "PUT /api/grocery/:id": "Update grocery item (Protected)",
        "DELETE /api/grocery/:id": "Delete grocery item (Protected)",
        "PATCH /api/grocery/:id/toggle": "Toggle purchased status (Protected)",
        "DELETE /api/grocery": "Clear all grocery items (Protected)",
        "GET /api/grocery/category/:category": "Get items by category (Protected)",
      },
    },
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/mealplans", mealPlanRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/spoonacular', spoonacularRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/grocery', groceryRoutes);

// Handle undefined routes
app.all("*", notFound);

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60).cyan);
  console.log("🍎  DIETARYSENSE BACKEND SERVER".bold.yellow);
  console.log("=".repeat(60).cyan);
  console.log(
    `🚀  Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.green
  );
  console.log(`📚  API Health: http://localhost:${PORT}/api/health`.blue);
  console.log(`📖  API Docs: http://localhost:${PORT}/api/docs`.blue);
  console.log(
    `🌐  Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`
      .magenta
  );
  console.log(
    `🗄️  Database: ${mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected ❌"
      }`.blue
  );
  console.log(`🔐  JWT Expire: ${process.env.JWT_EXPIRE || "30d"}`.green);
  console.log("=".repeat(60).cyan);
  console.log("💡  Tip: Use Postman or curl to test the API endpoints".gray);
  console.log("=".repeat(60).cyan + "\n");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log("❌  Unhandled Rejection at:".red, promise);
  console.log("💥  Reason:".red, err.message);
  console.log("🔄  Shutting down server gracefully...".yellow);

  server.close(() => {
    console.log("👋  Process terminated".red);
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("❌  Uncaught Exception thrown:".red);
  console.log("📛  Name:".red, err.name);
  console.log("💬  Message:".red, err.message);
  console.log("📋  Stack:".red, err.stack);
  console.log("🔄  Shutting down server...".yellow);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋  SIGTERM received, shutting down gracefully...".yellow);
  server.close(() => {
    console.log("✅  Process terminated successfully".green);
  });
});

module.exports = app;