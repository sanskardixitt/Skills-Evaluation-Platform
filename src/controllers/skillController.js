const prisma = require("../configs/prisma");

const getAllSkills = async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      include: {
        // _count gives us aggregate counts of related records
        _count: {
          select: {
            questions: true,
            quizAttempts: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      success: true,
      data: {
        skills,
        total: skills.length,
      },
    });
  } catch (error) {
    console.error("Get skills error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching skills",
    });
  }
};

const getSkillById = async (req, res) => {
  try {
    const skillId = parseInt(req.params.id);

    if (isNaN(skillId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: {
        _count: {
          select: {
            questions: true,
            quizAttempts: true,
          },
        },
      },
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    res.json({
      success: true,
      data: { skill },
    });
  } catch (error) {
    console.error("Get skill error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching skill",
    });
  }
};
/**
 * Create New Skill (Admin Only)
 *
 * Allows admins to add new skill categories to the system
 */

const createSkill = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    // Check if skill already exists (case-insensitive)
    const existingSkill = await prisma.skill.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive", // Case-insensitive comparison
        },
      },
    });

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: "A skill with this name already exists",
      });
    }

    const skill = await prisma.skill.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Skill created successfully",
      data: { skill },
    });
  } catch (error) {
    console.error("Create skill error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating skill",
    });
  }
};
/**
 * Update Skill (Admin Only)
 *
 * Allows admins to modify existing skill information
 */

const updateSkill = async (req, res) => {
  try {
    const skillId = parseInt(req.params.id);
    const { name, description } = req.body;

    // Validate ID
    if (isNaN(skillId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }

    // Check if skill exists
    const existingSkill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!existingSkill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // If name is being changed, check for duplicates
    if (name && name.trim() !== existingSkill.name) {
      const duplicateSkill = await prisma.skill.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: "insensitive",
          },
          NOT: {
            id: skillId,
          },
        },
      });

      if (duplicateSkill) {
        return res.status(400).json({
          success: false,
          message: "A skill with this name already exists",
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;

    // Update skill
    const skill = await prisma.skill.update({
      where: { id: skillId },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Skill updated successfully",
      data: { skill },
    });
  } catch (error) {
    console.error("Update skill error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating skill",
    });
  }
};

/**
 * Delete Skill (Admin Only)
 *
 * Removes a skill from the system.
 *
 * IMPORTANT: Due to onDelete: Cascade in the Prisma schema,
 * deleting a skill will also delete:
 * - All questions for that skill
 * - All quiz attempts for that skill
 * - All quiz answers for those attempts
 *
 * This is intentional but should be clearly communicated to admins!
 */
const deleteSkill = async (req, res) => {
  try {
    const skillId = parseInt(req.params.id);

    if (isNaN(skillId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }

    // Optional: Check if skill has associated data and warn user
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: {
        _count: {
          select: {
            questions: true,
            quizAttempts: true,
          },
        },
      },
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Delete skill (cascades to related records)
    await prisma.skill.delete({
      where: { id: skillId },
    });

    res.json({
      success: true,
      message: "Skill deleted successfully",
      deletedCounts: {
        questions: skill._count.questions,
        quizAttempts: skill._count.quizAttempts,
      },
    });
  } catch (error) {
    console.error("Delete skill error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting skill",
    });
  }
};

module.exports = {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
};
