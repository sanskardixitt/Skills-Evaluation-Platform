const express = require("express");
const router = express.Router();

const {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
} = require("../controllers/skillController");
const { authenticate } = require("../middleware/auth");
const { authorizedRoles } = require("../middleware/roleCheck");

router.get("/", authenticate, getAllSkills);
router.get("/:id", authenticate, getSkillById);
router.post("/", authenticate, authorizedRoles("ADMIN"), createSkill);
router.put("/:id", authenticate, authorizedRoles("ADMIN"), updateSkill);
router.delete("/:id", authenticate, authorizedRoles("ADMIN"), deleteSkill);

module.exports = router;
