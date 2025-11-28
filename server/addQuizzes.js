const mongoose = require('mongoose');
const Quiz = require('./src/models/Quiz');
const Lesson = require('./src/models/Lesson');
const Course = require('./src/models/Course');
require('dotenv').config();

// Helper function to convert string options to objects
function createOptions(optionsArray, correctAnswer) {
  return optionsArray.map(opt => ({
    text: opt,
    isCorrect: opt === correctAnswer
  }));
}

const quizTemplates = {
  'mathematics': [
    {
      title: 'Introduction to Numbers Quiz',
      questions: [
        {
          questionText: 'What is 15 + 27?',
          questionType: 'multiple-choice',
          optionsArray: ['32', '42', '52', '62'],
          correctAnswer: '42',
          points: 5
        },
        {
          questionText: 'Is 7 a prime number?',
          questionType: 'true-false',
          optionsArray: ['True', 'False'],
          correctAnswer: 'True',
          points: 5
        },
        {
          questionText: 'What is 8 × 9?',
          questionType: 'multiple-choice',
          optionsArray: ['72', '81', '63', '56'],
          correctAnswer: '72',
          points: 5
        }
      ],
      passingScore: 60,
      timeLimit: 10
    },
    {
      title: 'Basic Arithmetic Quiz',
      questions: [
        {
          questionText: 'What is 144 ÷ 12?',
          questionType: 'multiple-choice',
          optionsArray: ['10', '11', '12', '13'],
          correctAnswer: '12',
          points: 5
        },
        {
          questionText: 'What is 25% of 200?',
          questionType: 'multiple-choice',
          optionsArray: ['25', '50', '75', '100'],
          correctAnswer: '50',
          points: 5
        },
        {
          questionText: 'Is 0 an even number?',
          questionType: 'true-false',
          optionsArray: ['True', 'False'],
          correctAnswer: 'True',
          points: 5
        }
      ],
      passingScore: 60,
      timeLimit: 10
    }
  ],
  'python': [
    {
      title: 'Python Hello World Quiz',
      questions: [
        {
          questionText: 'What function is used to display output in Python?',
          questionType: 'multiple-choice',
          optionsArray: ['echo()', 'print()', 'console.log()', 'display()'],
          correctAnswer: 'print()',
          points: 5
        },
        {
          questionText: 'Python is a case-sensitive language',
          questionType: 'true-false',
          optionsArray: ['True', 'False'],
          correctAnswer: 'True',
          points: 5
        },
        {
          questionText: 'What is the correct way to print "Hello World" in Python?',
          questionType: 'multiple-choice',
          optionsArray: ['print("Hello World")', 'echo "Hello World"', 'console.log("Hello World")', 'printf("Hello World")'],
          correctAnswer: 'print("Hello World")',
          points: 5
        }
      ],
      passingScore: 60,
      timeLimit: 10
    },
    {
      title: 'Python Variables Quiz',
      questions: [
        {
          questionText: 'Which is a valid variable name in Python?',
          questionType: 'multiple-choice',
          optionsArray: ['my_var', '2variable', 'my-var', 'var name'],
          correctAnswer: 'my_var',
          points: 5
        },
        {
          questionText: 'Can you change the value of a variable after it has been assigned?',
          questionType: 'true-false',
          optionsArray: ['True', 'False'],
          correctAnswer: 'True',
          points: 5
        },
        {
          questionText: 'What operator is used for addition in Python?',
          questionType: 'multiple-choice',
          optionsArray: ['+', 'add', 'plus', '&'],
          correctAnswer: '+',
          points: 5
        }
      ],
      passingScore: 60,
      timeLimit: 10
    }
  ],
  'digital-literacy': [
    {
      title: 'Digital Citizenship Quiz',
      questions: [
        {
          questionText: 'What does "WWW" stand for?',
          questionType: 'multiple-choice',
          optionsArray: ['World Wide Web', 'World Web Way', 'Web Wide World', 'Wide World Web'],
          correctAnswer: 'World Wide Web',
          points: 5
        },
        {
          questionText: 'Is it safe to share your password with friends?',
          questionType: 'true-false',
          optionsArray: ['True', 'False'],
          correctAnswer: 'False',
          points: 5
        },
        {
          questionText: 'Which symbol is commonly used in email addresses?',
          questionType: 'multiple-choice',
          optionsArray: ['@', '#', '$', '%'],
          correctAnswer: '@',
          points: 5
        }
      ],
      passingScore: 60,
      timeLimit: 10
    },
    {
      title: 'Online Safety Quiz',
      questions: [
        {
          questionText: 'What should you do if a stranger messages you online?',
          questionType: 'multiple-choice',
          optionsArray: ['Tell a trusted adult', 'Reply to them', 'Share personal info', 'Meet them in person'],
          correctAnswer: 'Tell a trusted adult',
          points: 5
        },
        {
          questionText: 'Should you click on links from unknown sources?',
          questionType: 'true-false',
          optionsArray: ['True', 'False'],
          correctAnswer: 'False',
          points: 5
        },
        {
          questionText: 'What is a strong password?',
          questionType: 'multiple-choice',
          optionsArray: ['Mix of letters, numbers, and symbols', 'Your name', '12345', 'password'],
          correctAnswer: 'Mix of letters, numbers, and symbols',
          points: 5
        }
      ],
      passingScore: 60,
      timeLimit: 10
    }
  ],
  'default': [
    {
      title: 'Lesson Knowledge Check',
      questions: [
        {
          questionText: 'I understood the main concepts in this lesson',
          questionType: 'true-false',
          optionsArray: ['True', 'False'],
          correctAnswer: 'True',
          points: 5
        },
        {
          questionText: 'What did you find most interesting in this lesson?',
          questionType: 'multiple-choice',
          optionsArray: ['The introduction', 'The examples', 'The practical applications', 'All of the above'],
          correctAnswer: 'All of the above',
          points: 5
        },
        {
          questionText: 'I can apply what I learned to real situations',
          questionType: 'true-false',
          optionsArray: ['True', 'False'],
          correctAnswer: 'True',
          points: 5
        }
      ],
      passingScore: 60,
      timeLimit: 5
    }
  ]
};

async function addQuizzes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all lessons
    const lessons = await Lesson.find().populate('course');
    console.log(`\nFound ${lessons.length} lessons`);

    // Delete existing quizzes
    await Quiz.deleteMany({});
    console.log('🗑️  Deleted existing quizzes');

    let quizzesCreated = 0;

    for (const lesson of lessons) {
      const courseTitle = lesson.course.title.toLowerCase();
      let quizData;

      // Determine which quiz template to use
      if (courseTitle.includes('math')) {
        quizData = quizTemplates.mathematics[lesson.order - 1] || quizTemplates.default[0];
      } else if (courseTitle.includes('python')) {
        quizData = quizTemplates.python[lesson.order - 1] || quizTemplates.default[0];
      } else if (courseTitle.includes('digital')) {
        quizData = quizTemplates['digital-literacy'][lesson.order - 1] || quizTemplates.default[0];
      } else {
        quizData = quizTemplates.default[0];
      }

      // Create quiz for this lesson
      const processedQuestions = quizData.questions.map(q => ({
        questionText: q.questionText,
        questionType: q.questionType,
        options: createOptions(q.optionsArray, q.correctAnswer),
        correctAnswer: q.correctAnswer,
        points: q.points
      }));

      const quiz = await Quiz.create({
        title: `${lesson.title} - ${quizData.title}`,
        course: lesson.course._id,
        lesson: lesson._id,
        questions: processedQuestions,
        passingScore: quizData.passingScore,
        timeLimit: quizData.timeLimit,
        maxAttempts: 3,
        randomizeQuestions: true,
        isPublished: true
      });

      console.log(`✅ Created quiz for: ${lesson.title} (Lesson ${lesson.order})`);
      quizzesCreated++;
    }

    console.log(`\n🎉 Successfully created ${quizzesCreated} quizzes (one per lesson)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addQuizzes();
