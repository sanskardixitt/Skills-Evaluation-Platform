// Seed script: adds skills (Java, Python, React) and related questions
// Run: npm run prisma:seed

const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  // Clear existing (optional). Comment out if you want to keep data.
  // await prisma.quizAnswer.deleteMany();
  // await prisma.quizAttempt.deleteMany();
  // await prisma.question.deleteMany();
  // await prisma.skill.deleteMany();

  const skills = [
    { name: "Java", description: "Core Java programming concepts" },
    { name: "Python", description: "Python language fundamentals" },
    { name: "React", description: "React library essentials" },
  ];

  // Upsert skills
  const createdSkills = {};
  for (const s of skills) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: { description: s.description },
      create: s,
    });
    createdSkills[s.name] = skill.id;
  }

  // Questions per skill
  const questionsBySkill = {
    Java: [
      {
        questionText: "Which keyword is used to inherit a class in Java?",
        optionA: "extends",
        optionB: "implements",
        optionC: "inherits",
        optionD: "super",
        correctAnswer: "A",
        difficulty: "EASY",
      },
      {
        questionText: "Which collection does not allow duplicates?",
        optionA: "ArrayList",
        optionB: "LinkedList",
        optionC: "HashSet",
        optionD: "Vector",
        correctAnswer: "C",
        difficulty: "MEDIUM",
      },
      {
        questionText: "What is the size of int in Java?",
        optionA: "8-bit",
        optionB: "16-bit",
        optionC: "32-bit",
        optionD: "64-bit",
        correctAnswer: "C",
        difficulty: "EASY",
      },
    ],
    Python: [
      {
        questionText: "Which data type is immutable in Python?",
        optionA: "List",
        optionB: "Dictionary",
        optionC: "Set",
        optionD: "Tuple",
        correctAnswer: "D",
        difficulty: "EASY",
      },
      {
        questionText: "What does PEP stand for?",
        optionA: "Python Enhancement Proposal",
        optionB: "Python Enterprise Platform",
        optionC: "Program Execution Plan",
        optionD: "Package Extension Protocol",
        correctAnswer: "A",
        difficulty: "MEDIUM",
      },
      {
        questionText: "Which keyword is used for function definition?",
        optionA: "func",
        optionB: "def",
        optionC: "function",
        optionD: "define",
        correctAnswer: "B",
        difficulty: "EASY",
      },
    ],
    React: [
      {
        questionText: "Which hook is used for state in functional components?",
        optionA: "useEffect",
        optionB: "useState",
        optionC: "useMemo",
        optionD: "useReducer",
        correctAnswer: "B",
        difficulty: "EASY",
      },
      {
        questionText:
          "What prop is used to pass content between component tags?",
        optionA: "props",
        optionB: "children",
        optionC: "content",
        optionD: "slot",
        correctAnswer: "B",
        difficulty: "EASY",
      },
      {
        questionText: "Which hook runs after every render by default?",
        optionA: "useMemo",
        optionB: "useCallback",
        optionC: "useEffect",
        optionD: "useLayoutEffect",
        correctAnswer: "C",
        difficulty: "MEDIUM",
      },
    ],
  };

  for (const [skillName, questions] of Object.entries(questionsBySkill)) {
    const skillId = createdSkills[skillName];
    for (const q of questions) {
      await prisma.question.create({
        data: { skillId, ...q },
      });
    }
  }

  console.log("Seeding completed: skills and questions added.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
