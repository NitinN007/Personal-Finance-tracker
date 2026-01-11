const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/db");
const startRecurringJob = require("./cron/recurringJob");

const auth = require("./routes/authRoutes");
const categories = require("./routes/categoryRoutes");
const transactions = require("./routes/transactionRoutes");
const budgets = require("./routes/budgetRoutes");
const dashboard = require("./routes/dashboardRoutes");
const recurring = require("./routes/recurringRoutes");
const { seedDefaults } = require("./controllers/categoryController");

const app = express();

// ✅ important for Render (secure cookies + proxy)
app.set("trust proxy", 1);

// connect DB
connectDB();

// middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ CORS FIX (Render + localhost)
const allowedOrigins = [
  "http://localhost:5173",
  "https://personal-finance-tracker-frontend-ymm.onrender.com", // ✅ hardcode deployed frontend
  process.env.CLIENT_URL, // optional env
]
  .filter(Boolean) // ✅ removes undefined/null
  .map((url) => url.trim().replace(/\/$/, "")); // ✅ remove trailing /

console.log("✅ Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman/curl)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.trim().replace(/\/$/, "");

      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", cleanOrigin);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ must handle OPTIONS preflight
app.options("*", cors());

// routes
app.get("/", (req, res) => res.json({ message: "Finance Tracker API ✅" }));

app.use("/api/auth", auth);
app.use("/api/categories", categories);
app.use("/api/transactions", transactions);
app.use("/api/budgets", budgets);
app.use("/api/dashboard", dashboard);
app.use("/api/recurring", recurring);

app.post("/api/seed", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    await seedDefaults(userId);
    res.json({ message: "Seeded ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Seed failed" });
  }
});

// cron
startRecurringJob();

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("✅ Backend running on", PORT));
