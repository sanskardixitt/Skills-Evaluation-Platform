const prisma = require("../config/prisma");

/**
 * Get All Questions with Pagination and Filtering
 *
 * This endpoint demonstrates how to build a flexible API that supports:
 * - Pagination (page & limit parameters)
 * - Filtering by skill and difficulty
 * - Including related data (skill information)
 * - Sorting results
 *
 * Example URLs:
 * - /api/questions - Get all questions
 * - /api/questions?page=2&limit=20 - Second page with 20 items
 * - /api/questions?skillId=1 - Filter by skill
 * - /api/questions?difficulty=EASY - Filter by difficulty
 * - /api/questions?skillId=1&difficulty=MEDIUM - Multiple filters
 */

const getAllQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skillId = req.query.skillId ? parseInt(req.query.skillId) : null;
    const difficulty = req.query.difficulty;

    const skip = (page - 1) * limit;

    const where = {};

    if (skillId) {
      where.skillId = skillId;
    }

    if (difficulty) {
      const validDifficulties = ["EASY", "MEDIUM", "HARD"];
      if (!validDifficulties.includes(difficulty.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid difficulty. Must be EASY, MEDIUM, or HARD",
        });
      }
      where.difficulty = difficulty.toUpperCase();
    }

    // Get total count for pagination metadata
    // This tells us how many total pages exist
    const totalCount = await prisma.question.count({ where });

    // Get paginated questions with related skill data

    const questions = await prisma.question.findMany({
      where,
      include: {
        skill: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Newest questions first
      },
      skip,
      take: limit,
    });

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching questions",
    });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);

    if (isNaN(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.json({
      success: true,
      data: { question },
    });
  } catch (error) {
    console.error("Get question error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching question",
    });
  }
};

/**
 * Create New Question (Admin Only)
 *
 * Creates a new quiz question with validation for:
 * - Required fields
 * - Valid skill ID
 * - Valid correct answer (must be A, B, C, or D)
 * - Valid difficulty level
 */

const createQuestion = async (req, res) => {
  try {
    const {
      skillId,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      difficulty,
    } = req.body;

    const requiredFields = {
      skillId: "Skill ID",
      questionText: "Question text",
      optionA: "Option A",
      optionB: "Option B",
      optionC: "Option C",
      optionD: "Option D",
      correctAnswer: "Correct answer",
    };

    // Check each required field
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${label} is required`,
        });
      }
    }

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Validate correct answer
    const validAnswers = ["A", "B", "C", "D"];
    if (!validAnswers.includes(correctAnswer.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Correct answer must be A, B, C, or D",
      });
    }

    if (difficulty) {
      const validDifficulties = ["EASY", "MEDIUM", "HARD"];
      if (!validDifficulties.includes(difficulty.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: "Difficulty must be EASY, MEDIUM, or HARD",
        });
      }
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        skillId,
        questionText: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer: correctAnswer.toUpperCase(),
        difficulty: difficulty ? difficulty.toUpperCase() : "MEDIUM",
      },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: { question },
    });
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating question",
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const updates = req.body;

    if (isNaN(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (updates.skillId) {
      const skill = await prisma.skill.findUnique({
        where: { id: updates.skillId },
      });

      if (!skill) {
        return res.status(404).json({
          success: false,
          message: "Skill not found",
        });
      }
    }

    if (updates.correctAnswer) {
      const validAnswers = ["A", "B", "C", "D"];
      if (!validAnswers.includes(updates.correctAnswer.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: "Correct answer must be A, B, C, or D",
        });
      }
      updates.correctAnswer = updates.correctAnswer.toUpperCase();
    }

    if (updates.difficulty) {
      const validDifficulties = ["EASY", "MEDIUM", "HARD"];
      if (!validDifficulties.includes(updates.difficulty.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: "Difficulty must be EASY, MEDIUM, or HARD",
        });
      }
      updates.difficulty = updates.difficulty.toUpperCase();
    }

    const stringFields = [
      "questionText",
      "optionA",
      "optionB",
      "optionC",
      "optionD",
    ];
    stringFields.forEach((field) => {
      if (updates[field]) {
        updates[field] = updates[field].trim();
      }
    });

    // Update question
    const question = await prisma.question.update({
      where: { id: questionId },
      data: updates,
      include: {
        skill: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Question updated successfully",
      data: { question },
    });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating question",
    });
  }
};

/**
 * Delete Question (Admin Only)
 *
 * Permanently removes a question from the system
 */
const deleteQuestion = async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);

    if (isNaN(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    await prisma.question.delete({
      where: { id: questionId },
    });

    res.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }
    console.error("Delete question error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting question",
    });
  }
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
