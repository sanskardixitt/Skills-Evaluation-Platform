const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const errorHandler = require("./middleware/errorHandler");

// Routers
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const skillRoutes = require("./routes/skillRoutes");
const questionRoutes = require("./routes/questionRoutes");

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/questions", questionRoutes);

app.use(errorHandler);

module.exports = app;
