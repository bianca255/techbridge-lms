require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Lesson = require('./src/models/Lesson');
const Quiz = require('./src/models/Quiz');

// Sample courses data
const sampleCourses = [
  {
    title: 'Introduction to Computer Basics',
    description: 'Learn the fundamentals of computers, including hardware, software, and basic operations. Perfect for beginners aged 8-18.',
    category: 'computer-basics',
    level: 'beginner',
    duration: 10,
    price: 0,
    isPaid: false,
    isPublished: true,
    language: 'en',
    prerequisites: [],
    learningObjectives: [
      'Understand computer hardware components',
      'Learn basic computer operations',
      'Master keyboard and mouse usage',
      'Navigate operating systems confidently'
    ],
    tags: ['basics', 'beginner', 'computer', 'fundamentals']
  },
  {
    title: 'Web Development for Kids',
    description: 'Create your first website! Learn HTML, CSS, and basic JavaScript in a fun and interactive way.',
    category: 'web-development',
    level: 'beginner',
    duration: 20,
    price: 0,
    isPaid: false,
    isPublished: true,
    language: 'en',
    prerequisites: ['Basic computer skills'],
    learningObjectives: [
      'Build a simple website with HTML',
      'Style web pages with CSS',
      'Add interactivity with JavaScript',
      'Publish your first website'
    ],
    tags: ['web', 'html', 'css', 'javascript', 'coding']
  },
  {
    title: 'Introduction to Programming with Scratch',
    description: 'Start your coding journey with Scratch! Create games, animations, and interactive stories using visual programming.',
    category: 'coding',
    level: 'beginner',
    duration: 15,
    price: 0,
    isPaid: false,
    isPublished: true,
    language: 'en',
    prerequisites: [],
    learningObjectives: [
      'Understand programming concepts',
      'Create interactive animations',
      'Build simple games',
      'Learn problem-solving skills'
    ],
    tags: ['scratch', 'coding', 'programming', 'games', 'beginner']
  },
  {
    title: 'Digital Literacy Essentials',
    description: 'Master essential digital skills including internet safety, email, online research, and digital citizenship.',
    category: 'digital-literacy',
    level: 'beginner',
    duration: 12,
    price: 0,
    isPaid: false,
    isPublished: true,
    language: 'en',
    prerequisites: ['Basic computer skills'],
    learningObjectives: [
      'Navigate the internet safely',
      'Use email effectively',
      'Conduct online research',
      'Practice digital citizenship'
    ],
    tags: ['digital', 'internet', 'safety', 'literacy']
  },
  {
    title: 'Python Programming for Beginners',
    description: 'Learn Python, one of the most popular programming languages. Write your first programs and solve real problems.',
    category: 'coding',
    level: 'intermediate',
    duration: 25,
    price: 0,
    isPaid: false,
    isPublished: true,
    language: 'en',
    prerequisites: ['Basic programming concepts'],
    learningObjectives: [
      'Understand Python syntax',
      'Write functions and use variables',
      'Work with loops and conditions',
      'Build simple Python programs'
    ],
    tags: ['python', 'coding', 'programming', 'intermediate']
  },
  {
    title: 'Mathematics with Technology',
    description: 'Use technology to explore mathematics! Learn math concepts through interactive tools and games.',
    category: 'mathematics',
    level: 'beginner',
    duration: 18,
    price: 0,
    isPaid: false,
    isPublished: true,
    language: 'en',
    prerequisites: [],
    learningObjectives: [
      'Use digital tools for math',
      'Visualize mathematical concepts',
      'Solve problems with technology',
      'Build math confidence'
    ],
    tags: ['math', 'mathematics', 'technology', 'interactive']
  }
];

// Sample lessons for each course
const createLessonsForCourse = (courseId, courseTitle) => {
  const lessonTemplates = {
    'Introduction to Computer Basics': [
      {
        title: 'What is a Computer?',
        description: 'Understanding what computers are and how they work',
        content: {
          text: '# What is a Computer?\n\nA computer is an electronic device that processes information. It can:\n- Store data\n- Process information\n- Display results\n- Connect to the internet\n\nComputers come in many forms: desktops, laptops, tablets, and smartphones!'
        },
        order: 1,
        duration: 30,
        videoUrl: '',
        isPublished: true
      },
      {
        title: 'Computer Hardware',
        description: 'Learn about the physical parts of a computer',
        content: {
          text: '# Computer Hardware\n\n## Main Components:\n1. **Monitor** - Displays information\n2. **Keyboard** - For typing\n3. **Mouse** - For pointing and clicking\n4. **CPU** - The brain of the computer\n5. **Memory (RAM)** - Temporary storage\n6. **Hard Drive** - Permanent storage'
        },
        order: 2,
        duration: 45,
        videoUrl: '',
        isPublished: true
      },
      {
        title: 'Using Keyboard and Mouse',
        description: 'Master the basic input devices',
        content: {
          text: '# Keyboard and Mouse Basics\n\n## Keyboard:\n- Letters and numbers\n- Special keys (Shift, Enter, Space)\n- Function keys\n\n## Mouse:\n- Left click - Select\n- Right click - Menu\n- Scroll wheel - Navigate\n- Double click - Open'
        },
        order: 3,
        duration: 40,
        videoUrl: '',
        isPublished: true
      }
    ],
    'Web Development for Kids': [
      {
        title: 'Introduction to HTML',
        description: 'Your first steps in web development',
        content: {
          text: '# HTML Basics\n\nHTML stands for HyperText Markup Language. It\'s the skeleton of every website!\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>My First Page</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <p>This is my first webpage.</p>\n</body>\n</html>\n```'
        },
        order: 1,
        duration: 45,
        videoUrl: '',
        isPublished: true
      },
      {
        title: 'Styling with CSS',
        description: 'Make your websites beautiful',
        content: {
          text: '# CSS Basics\n\nCSS (Cascading Style Sheets) makes websites look pretty!\n\n```css\nbody {\n    background-color: lightblue;\n    font-family: Arial, sans-serif;\n}\n\nh1 {\n    color: navy;\n    text-align: center;\n}\n```'
        },
        order: 2,
        duration: 50,
        videoUrl: '',
        isPublished: true
      }
    ],
    'Introduction to Programming with Scratch': [
      {
        title: 'Getting Started with Scratch',
        description: 'Create your first Scratch project',
        content: {
          text: '# Welcome to Scratch!\n\nScratch is a visual programming language where you snap blocks together to create programs.\n\n## Your First Program:\n1. Open Scratch\n2. Drag the "when green flag clicked" block\n3. Add a "say Hello!" block\n4. Click the green flag!\n\nCongratulations! You just wrote your first program!'
        },
        order: 1,
        duration: 35,
        videoUrl: '',
        isPublished: true
      },
      {
        title: 'Moving Sprites',
        description: 'Learn to animate characters',
        content: {
          text: '# Moving Characters\n\n## Motion Blocks:\n- Move 10 steps\n- Turn 15 degrees\n- Go to x: 0 y: 0\n- Glide to a position\n\nTry making your sprite:\n- Walk across the screen\n- Jump up and down\n- Spin in a circle'
        },
        order: 2,
        duration: 40,
        videoUrl: '',
        isPublished: true
      }
    ],
    'Digital Literacy Essentials': [
      {
        title: 'Internet Safety Basics',
        description: 'Stay safe online',
        content: {
          text: '# Internet Safety\n\n## Important Rules:\n1. Never share personal information\n2. Use strong passwords\n3. Tell an adult if something makes you uncomfortable\n4. Think before you post\n5. Respect others online\n\n## Remember: The internet is permanent!'
        },
        order: 1,
        duration: 40,
        videoUrl: '',
        isPublished: true
      },
      {
        title: 'Using Email Effectively',
        description: 'Master email communication',
        content: {
          text: '# Email Basics\n\n## Parts of an Email:\n- **To:** Recipient address\n- **Subject:** What the email is about\n- **Body:** Your message\n- **Attachments:** Files you want to send\n\n## Email Etiquette:\n- Use clear subjects\n- Be polite\n- Check spelling\n- Reply promptly'
        },
        order: 2,
        duration: 35,
        videoUrl: '',
        isPublished: true
      }
    ],
    'Python Programming for Beginners': [
      {
        title: 'Your First Python Program',
        description: 'Write "Hello World" in Python',
        content: {
          text: '# Hello Python!\n\n```python\nprint("Hello, World!")\nprint("Welcome to Python programming!")\n```\n\n## Variables:\n```python\nname = "Alice"\nage = 12\nprint("My name is", name)\nprint("I am", age, "years old")\n```'
        },
        order: 1,
        duration: 45,
        videoUrl: '',
        isPublished: true
      },
      {
        title: 'Python Math and Variables',
        description: 'Learn to use variables and perform calculations',
        content: {
          text: '# Python Math\n\n```python\n# Basic math\nsum = 5 + 3\ndifference = 10 - 4\nproduct = 6 * 7\nquotient = 20 / 4\n\nprint("Sum:", sum)\nprint("Difference:", difference)\n```'
        },
        order: 2,
        duration: 50,
        videoUrl: '',
        isPublished: true
      }
    ],
    'Mathematics with Technology': [
      {
        title: 'Using Digital Tools for Math',
        description: 'Explore interactive math tools',
        content: {
          text: '# Math with Technology\n\n## Digital Tools:\n- Online calculators\n- Graphing programs\n- Math games\n- Interactive simulations\n\n## Benefits:\n- Visualize concepts\n- Practice with feedback\n- Explore at your own pace\n- Make math fun!'
        },
        order: 1,
        duration: 40,
        videoUrl: '',
        isPublished: true
      }
    ]
  };

  return (lessonTemplates[courseTitle] || []).map(lesson => ({
    ...lesson,
    course: courseId
  }));
};

// Sample quizzes
const createQuizzesForCourse = (courseId, courseTitle) => {
  const quizTemplates = {
    'Introduction to Computer Basics': {
      title: 'Computer Basics Quiz',
      description: 'Test your knowledge of computer fundamentals',
      passingScore: 60,
      timeLimit: 15,
      maxAttempts: 3,
      questions: [
        {
          questionText: 'What does CPU stand for?',
          questionType: 'multiple-choice',
          points: 10,
          options: [
            { text: 'Central Processing Unit', isCorrect: true },
            { text: 'Computer Personal Unit', isCorrect: false },
            { text: 'Central Program Unit', isCorrect: false },
            { text: 'Computer Processing Utility', isCorrect: false }
          ]
        },
        {
          questionText: 'Which device is used for typing?',
          questionType: 'multiple-choice',
          points: 10,
          options: [
            { text: 'Mouse', isCorrect: false },
            { text: 'Monitor', isCorrect: false },
            { text: 'Keyboard', isCorrect: true },
            { text: 'Printer', isCorrect: false }
          ]
        },
        {
          questionText: 'RAM is permanent storage.',
          questionType: 'true-false',
          correctAnswer: 'false',
          points: 10
        }
      ]
    },
    'Web Development for Kids': {
      title: 'HTML & CSS Basics Quiz',
      description: 'Test your web development knowledge',
      passingScore: 60,
      timeLimit: 15,
      maxAttempts: 3,
      questions: [
        {
          questionText: 'What does HTML stand for?',
          questionType: 'multiple-choice',
          points: 10,
          options: [
            { text: 'HyperText Markup Language', isCorrect: true },
            { text: 'High Tech Modern Language', isCorrect: false },
            { text: 'Home Tool Markup Language', isCorrect: false },
            { text: 'Hyper Transfer Markup Language', isCorrect: false }
          ]
        },
        {
          questionText: 'CSS is used to style web pages.',
          questionType: 'true-false',
          correctAnswer: 'true',
          points: 10
        }
      ]
    },
    'Introduction to Programming with Scratch': {
      title: 'Scratch Programming Quiz',
      description: 'Test your Scratch knowledge',
      passingScore: 60,
      timeLimit: 10,
      maxAttempts: 3,
      questions: [
        {
          questionText: 'What is a sprite in Scratch?',
          questionType: 'multiple-choice',
          points: 10,
          options: [
            { text: 'A character or object', isCorrect: true },
            { text: 'A type of block', isCorrect: false },
            { text: 'A background', isCorrect: false },
            { text: 'A sound effect', isCorrect: false }
          ]
        },
        {
          questionText: 'Scratch uses visual programming blocks.',
          questionType: 'true-false',
          correctAnswer: 'true',
          points: 10
        }
      ]
    }
  };

  const quizTemplate = quizTemplates[courseTitle];
  if (!quizTemplate) return [];

  return [{
    ...quizTemplate,
    course: courseId,
    isPublished: true
  }];
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a teacher user
    let teacher = await User.findOne({ role: 'teacher' });
    if (!teacher) {
      console.log('Creating default teacher account...');
      teacher = await User.create({
        username: 'teacher_demo',
        email: 'teacher@techbridge.com',
        password: 'Teacher123!',
        firstName: 'Demo',
        lastName: 'Teacher',
        role: 'teacher',
        emailVerified: true
      });
      console.log('✅ Teacher account created: teacher@techbridge.com / Teacher123!');
    } else {
      console.log('✅ Using existing teacher account');
    }

    // Check if courses already exist
    const existingCourses = await Course.countDocuments();
    if (existingCourses > 0) {
      console.log(`⚠️  Database already has ${existingCourses} courses`);
      const answer = await new Promise((resolve) => {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        readline.question('Do you want to clear and reseed? (yes/no): ', (ans) => {
          readline.close();
          resolve(ans.toLowerCase() === 'yes');
        });
      });

      if (!answer) {
        console.log('Seeding cancelled');
        process.exit(0);
      }

      // Clear existing data
      await Course.deleteMany({});
      await Lesson.deleteMany({});
      await Quiz.deleteMany({});
      console.log('✅ Cleared existing data');
    }

    // Create courses
    console.log('\n📚 Creating courses...');
    for (const courseData of sampleCourses) {
      const course = await Course.create({
        ...courseData,
        instructor: teacher._id
      });
      console.log(`  ✅ Created: ${course.title}`);

      // Create lessons for this course
      const lessons = createLessonsForCourse(course._id, course.title);
      if (lessons.length > 0) {
        const createdLessons = await Lesson.insertMany(lessons);
        course.lessons = createdLessons.map(l => l._id);
        console.log(`     📝 Added ${createdLessons.length} lessons`);
      }

      // Create quizzes for this course
      const quizzes = createQuizzesForCourse(course._id, course.title);
      if (quizzes.length > 0) {
        const createdQuizzes = await Quiz.insertMany(quizzes);
        course.quizzes = createdQuizzes.map(q => q._id);
        console.log(`     ✏️  Added ${createdQuizzes.length} quizzes`);
      }

      await course.save();
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Courses: ${await Course.countDocuments()}`);
    console.log(`   Lessons: ${await Lesson.countDocuments()}`);
    console.log(`   Quizzes: ${await Quiz.countDocuments()}`);
    
    console.log('\n👤 Demo Accounts:');
    console.log('   Teacher: teacher@techbridge.com / Teacher123!');
    console.log('   (Use your existing student account to enroll)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
