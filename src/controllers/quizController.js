const prisma = require("../config/prisma");

const startQuiz = async (req, res) => {
  try {
    const { skillId, questionCount = 10 } = req.body;
    const userId = req.user.id;

    if (!skillId) {
      return res.status(400).json({
        success: false,
        message: "Skill ID is required",
      });
    }

    const questionCountNum = parseInt(questionCount);
    if (questionCountNum < 1 || questionCountNum > 50) {
      return res.status(400).json({
        success: false,
        message: "Question count must be between 1 and 50",
      });
    }

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      select: {
        id: true,
        name: true,
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Check if enough questions exist
    if (skill._count.questions < questionCountNum) {
      return res.status(400).json({
        success: false,
        message: `Only ${skill._count.questions} questions available for this skill. Please select fewer questions.`,
      });
    }

    // Get random questions for this skill
    // Note: Prisma doesn't have built-in RAND() support, so we use raw SQL

    const questions = await prisma.$queryRaw`
      SELECT 
        id,
        question_text AS "questionText",
        option_a AS "optionA",
        option_b AS "optionB",
        option_c AS "optionC",
        option_d AS "optionD"
      FROM questions
      WHERE skill_id = ${skillId}
      ORDER BY RANDOM()
      LIMIT ${questionCountNum}
    `;

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions available for this skill",
      });
    }

    // Create quiz attempt record
    // We're creating the attempt BEFORE the user starts answering
    // This allows us to track incomplete attempts if users abandon quizzes
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        skillId,
        totalQuestions: questions.length,
        correctAnswers: 0,
        score: 0,
        // completedAt is null by default, indicating quiz is in progress
      },
    });

    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: {
        A: q.optionA,
        B: q.optionB,
        C: q.optionC,
        D: q.optionD,
      },
    }));

    res.json({
      success: true,
      message: "Quiz started successfully",
      data: {
        attemptId: attempt.id,
        skill: {
          id: skill.id,
          name: skill.name,
        },
        questions: formattedQuestions,
        totalQuestions: questions.length,
      },
    });
  } catch (error) {
    console.error("Start quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Error starting quiz",
    });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!attemptId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Attempt ID and answers array are required",
      });
    }

    if (answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one answer is required",
      });
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        userId: true,
        skillId: true,
        completedAt: true,
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found",
      });
    }

    // Security check: ensure user owns this attempt
    if (attempt.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this quiz attempt",
      });
    }

    // Check if already submitted
    if (attempt.completedAt) {
      return res.status(400).json({
        success: false,
        message: "Quiz has already been submitted",
      });
    }

    let correctCount = 0;

    const answerPromises = answers.map(async (answer) => {
      const { questionId, selectedAnswer } = answer;

      // Validate answer format
      if (!questionId || !selectedAnswer) {
        return null;
      }

      // Validate selected answer is A, B, C, or D
      const validAnswers = ["A", "B", "C", "D"];
      if (!validAnswers.includes(selectedAnswer.toUpperCase())) {
        return null;
      }

      // Get the correct answer for this question
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: {
          id: true,
          correctAnswer: true,
          skillId: true,
        },
      });

      if (!question || question.skillId !== attempt.skillId) {
        return null;
      }

      const isCorrect = question.correctAnswer === selectedAnswer.toUpperCase();

      return prisma.quizAnswer.create({
        data: {
          attemptId,
          questionId,
          selectedAnswer: selectedAnswer.toUpperCase(),
          isCorrect,
        },
      });
    });

    // Wait for all answers to be processed and saved
    const savedAnswers = await Promise.all(answerPromises);

    const validAnswers = savedAnswers.filter((answer) => answer !== null);
    correctCount = validAnswers.filter((answer) => answer.isCorrect).length;

    const scorePercentage = (correctCount / validAnswers.length) * 100;

    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        correctAnswers: correctCount,
        score: scorePercentage,
        completedAt: new Date(),
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

    res.json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        attemptId: updatedAttempt.id,
        skill: updatedAttempt.skill,
        totalQuestions: validAnswers.length,
        correctAnswers: correctCount,
        incorrectAnswers: validAnswers.length - correctCount,
        score: parseFloat(updatedAttempt.score.toString()),
        percentage: `${parseFloat(updatedAttempt.score.toString()).toFixed(
          1
        )}%`,
        passed: parseFloat(updatedAttempt.score.toString()) >= 70,
      },
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting quiz",
    });
  }
};

const getUserQuizHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await prisma.quizAttempt.count({
      where: {
        userId,
        completedAt: { not: null },
      },
    });

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
      skip,
      take: limit,
    });

    const formattedAttempts = attempts.map((attempt) => ({
      id: attempt.id,
      skill: attempt.skill,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.correctAnswers,
      score: parseFloat(attempt.score.toString()),
      percentage: `${parseFloat(attempt.score.toString()).toFixed(1)}%`,
      passed: parseFloat(attempt.score.toString()) >= 70,
      completedAt: attempt.completedAt,
      startedAt: attempt.startedAt,
    }));

    res.json({
      success: true,
      data: {
        attempts: formattedAttempts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get quiz history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching quiz history",
    });
  }
};

const getQuizResults = async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    // Get the quiz attempt with all answers
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
          },
        },
        quizAnswers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                correctAnswer: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found",
      });
    }

    // Security check
    if (attempt.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this quiz attempt",
      });
    }

    // Format the response
    const results = {
      attemptId: attempt.id,
      skill: attempt.skill,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.correctAnswers,
      score: parseFloat(attempt.score.toString()),
      percentage: `${parseFloat(attempt.score.toString()).toFixed(1)}%`,
      passed: parseFloat(attempt.score.toString()) >= 70,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      questions: attempt.quizAnswers.map((qa) => ({
        questionId: qa.question.id,
        questionText: qa.question.questionText,
        difficulty: qa.question.difficulty,
        options: {
          A: qa.question.optionA,
          B: qa.question.optionB,
          C: qa.question.optionC,
          D: qa.question.optionD,
        },
        correctAnswer: qa.question.correctAnswer,
        selectedAnswer: qa.selectedAnswer,
        isCorrect: qa.isCorrect,
      })),
    };

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Get quiz results error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching quiz results",
    });
  }
};

/**
 * Get Performance Report
 *
 * Analyzes user's performance across all skills and identifies skill gaps.
 * This is powerful because it uses Prisma's aggregation features to
 * calculate statistics without complex SQL queries.
 *
 * A "skill gap" is defined as any skill where the user's average score
 * is below 70%. These are skills the user should focus on improving.
 */
const getPerformanceReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const timePeriod = req.query.timePeriod; // 'week', 'month', or 'all'

    // Build date filter based on time period
    let dateFilter = {};
    const now = new Date();

    if (timePeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: weekAgo };
    } else if (timePeriod === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: monthAgo };
    }

    // Get all completed quiz attempts for this user
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        completedAt: {
          not: null,
          ...(Object.keys(dateFilter).length > 0 && dateFilter),
        },
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

    // Group attempts by skill and calculate statistics
    const skillStats = {};

    attempts.forEach((attempt) => {
      const skillId = attempt.skillId;
      const skillName = attempt.skill.name;
      const score = parseFloat(attempt.score.toString());

      if (!skillStats[skillId]) {
        skillStats[skillId] = {
          skillId,
          skillName,
          attemptsCount: 0,
          totalScore: 0,
          scores: [],
          bestScore: 0,
          worstScore: 100,
        };
      }

      skillStats[skillId].attemptsCount++;
      skillStats[skillId].totalScore += score;
      skillStats[skillId].scores.push(score);
      skillStats[skillId].bestScore = Math.max(
        skillStats[skillId].bestScore,
        score
      );
      skillStats[skillId].worstScore = Math.min(
        skillStats[skillId].worstScore,
        score
      );
    });

    const performanceData = Object.values(skillStats).map((stat) => ({
      skill: {
        id: stat.skillId,
        name: stat.skillName,
      },
      attemptsCount: stat.attemptsCount,
      averageScore: (stat.totalScore / stat.attemptsCount).toFixed(2),
      bestScore: stat.bestScore.toFixed(2),
      worstScore: stat.worstScore.toFixed(2),
      trend:
        stat.scores.length > 1
          ? stat.scores[stat.scores.length - 1] > stat.scores[0]
            ? "improving"
            : "declining"
          : "insufficient_data",
    }));

    performanceData.sort(
      (a, b) => parseFloat(a.averageScore) - parseFloat(b.averageScore)
    );

    // Identify skill gaps (average score < 70%)
    const skillGaps = performanceData.filter(
      (perf) => parseFloat(perf.averageScore) < 70
    );

    // Calculate overall statistics
    const overallStats = {
      totalAttempts: attempts.length,
      averageScore:
        attempts.length > 0
          ? (
              attempts.reduce(
                (sum, a) => sum + parseFloat(a.score.toString()),
                0
              ) / attempts.length
            ).toFixed(2)
          : 0,
      skillsAttempted: Object.keys(skillStats).length,
      skillsNeedingImprovement: skillGaps.length,
    };

    res.json({
      success: true,
      data: {
        timePeriod: timePeriod || "all",
        overallStats,
        performanceBySkill: performanceData,
        skillGaps,
        recommendations:
          skillGaps.length > 0
            ? `Focus on improving: ${skillGaps
                .map((s) => s.skill.name)
                .join(", ")}`
            : "Great job! Keep practicing to maintain your skills.",
      },
    });
  } catch (error) {
    console.error("Get performance report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating performance report",
    });
  }
};

/**
 * Get All Users' Performance (Admin Only)
 *
 * Returns aggregate performance data for all users.
 * This helps admins identify:
 * - Which users are excelling
 * - Which users might need help
 * - Overall system usage patterns
 */
const getAllUsersPerformance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      where: {
        role: "USER",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        quizAttempts: {
          where: {
            completedAt: { not: null },
          },
          select: {
            score: true,
            skillId: true,
          },
        },
      },
      skip,
      take: limit,
    });

    const userPerformance = users.map((user) => {
      const attempts = user.quizAttempts;
      const uniqueSkills = new Set(attempts.map((a) => a.skillId)).size;
      const averageScore =
        attempts.length > 0
          ? attempts.reduce(
              (sum, a) => sum + parseFloat(a.score.toString()),
              0
            ) / attempts.length
          : 0;

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        joinedAt: user.createdAt,
        stats: {
          totalAttempts: attempts.length,
          uniqueSkills,
          averageScore: averageScore.toFixed(2),
          performance:
            averageScore >= 80
              ? "excellent"
              : averageScore >= 70
              ? "good"
              : averageScore >= 60
              ? "average"
              : "needs_improvement",
        },
      };
    });

    userPerformance.sort(
      (a, b) =>
        parseFloat(b.stats.averageScore) - parseFloat(a.stats.averageScore)
    );

    const totalCount = await prisma.user.count({
      where: { role: "USER" },
    });

    res.json({
      success: true,
      data: {
        users: userPerformance,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
        },
      },
    });
  } catch (error) {
    console.error("Get all users performance error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users performance",
    });
  }
};

module.exports = {
  startQuiz,
  submitQuiz,
  getUserQuizHistory,
  getQuizResults,
  getPerformanceReport,
  getAllUsersPerformance,
};
