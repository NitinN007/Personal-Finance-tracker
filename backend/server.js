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

// ✅ FIXED CORS (support localhost + deployed frontend)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL, // deployed frontend url
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error("CORS blocked: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ MUST: preflight handler
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
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId required" });

  await seedDefaults(userId);
  res.json({ message: "Seeded ✅" });
});

// cron
startRecurringJob();

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("✅ Backend running on", PORT));
