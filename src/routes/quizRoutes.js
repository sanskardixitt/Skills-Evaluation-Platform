const express = require("express");
const router = express.Router();

const {
  startQuiz,
  submitQuiz,
  getUserQuizHistory,
  getQuizResults,
  getPerformanceReport,
} = require("../controllers/quizController");
const { authenticate } = require("../middleware/auth");

router.post("/start", authenticate, startQuiz);
router.post("/submit", authenticate, submitQuiz);
router.get("/history", authenticate, getUserQuizHistory);
router.get("/results/:id", authenticate, getQuizResults);
router.get("/performance", authenticate, getPerformanceReport);

module.exports = router;
