const express = require("express");
const router = express.Router();

const {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const { authenticate } = require("../middleware/auth");
const { authorizedRoles } = require("../middleware/roleCheck");

router.get("/", authenticate, getAllQuestions);
router.get("/:id", authenticate, getQuestionById);
router.post("/", authenticate, authorizedRoles("ADMIN"), createQuestion);
router.put("/:id", authenticate, authorizedRoles("ADMIN"), updateQuestion);
router.delete("/:id", authenticate, authorizedRoles("ADMIN"), deleteQuestion);

module.exports = router;
