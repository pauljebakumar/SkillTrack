const aiService = require('../services/aiService');
const AIConversation = require('../models/AIConversation');
const StudyMaterial = require('../models/StudyMaterial');
const memoryStore = require('../config/memoryStore');
const { isConnected } = require('../config/db');

// @desc Chat with AI Placement Coach
// @route POST /api/ai/chat
exports.chatWithCoach = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const { mode = 'study_assistant', prompt, conversationId, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Please provide a prompt.' });
    }

    const aiResult = await aiService.generateResponse({
      mode,
      prompt,
      context: context || {},
      userId
    });

    // Save to conversation if logged in
    let conversation = null;
    if (userId) {
      const userMsg = { role: 'user', content: prompt, timestamp: new Date() };
      const assistantMsg = { role: 'assistant', content: aiResult.text, timestamp: new Date(), metadata: { mode, model: aiResult.modelUsed } };

      if (isConnected()) {
        if (conversationId) {
          conversation = await AIConversation.findById(conversationId);
          if (conversation) {
            conversation.messages.push(userMsg, assistantMsg);
            await conversation.save();
          }
        }
        if (!conversation) {
          conversation = await AIConversation.create({
            user: userId,
            sessionTitle: prompt.substring(0, 40) + '...',
            mode,
            messages: [userMsg, assistantMsg]
          });
        }
      } else {
        if (conversationId) {
          conversation = memoryStore.findById('aiconversations', conversationId);
          if (conversation) {
            conversation.messages.push(userMsg, assistantMsg);
            memoryStore.saveToFile();
          }
        }
        if (!conversation) {
          conversation = memoryStore.insertOne('aiconversations', {
            user: userId,
            sessionTitle: prompt.substring(0, 40) + '...',
            mode,
            messages: [userMsg, assistantMsg]
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      text: aiResult.text,
      mode: aiResult.mode,
      modelUsed: aiResult.modelUsed,
      conversationId: conversation?._id || null
    });
  } catch (err) {
    next(err);
  }
};

// @desc AI Study Material Generator
// @route POST /api/ai/generate-study-material
exports.generateStudyMaterial = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const { topic, category = 'programming', difficulty = 'Beginner' } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Please specify a study topic.' });
    }

    const prompt = `Generate comprehensive, structured placement study material for topic: "${topic}" in category: "${category}" (Difficulty: ${difficulty}).
Include:
1. Clear notes and concept summary
2. Key formulas and rules
3. Syntax examples and sample code
4. Common errors and debugging tips
5. 2 Solved placement interview examples with step-by-step reasoning
6. 2 Practice exercises
7. 2 Multiple choice quiz questions with options and explanations`;

    const aiResult = await aiService.generateResponse({
      mode: 'study_assistant',
      prompt,
      context: { topic, category, difficulty },
      userId
    });

    const generatedDoc = {
      title: `${topic} — Master Notes & Placement Guide`,
      slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-ai-' + Date.now().toString(36),
      category: ['aptitude', 'programming', 'core_cs'].includes(category) ? category : 'programming',
      subject: topic,
      topic,
      difficulty,
      isAiGenerated: true,
      verifiedByAdmin: false,
      estimatedReadTimeMinutes: 15,
      content: {
        notes: aiResult.text,
        formulas: [
          `Key concept rule: Thorough understanding of ${topic} invariants`,
          `Time/Space efficiency considerations for ${topic}`
        ],
        syntax: `# Standard implementation template for ${topic}\ndef solve_${topic.toLowerCase().replace(/\\s+/g, '_')}():\n    pass`,
        samplePrograms: [
          {
            title: `${topic} Sample Program`,
            language: 'python',
            code: `# Example code illustrating ${topic}\nprint("Executed sample for ${topic}")`,
            expectedOutput: `Executed sample for ${topic}`
          }
        ],
        commonErrors: [
          {
            error: `Common pitfall in ${topic}`,
            explanation: `Overlooking boundary conditions or edge states during ${topic} operations.`,
            fix: `Always validate inputs and handle empty/single elements gracefully.`
          }
        ],
        solvedExamples: [
          {
            problem: `Standard placement question on ${topic}`,
            stepByStepSolution: `1. Understand constraints\n2. Formulate approach\n3. Optimize from brute force`,
            answer: `Optimal time and space bounds achieved.`
          }
        ],
        practiceExercises: [
          `Implement a complete working solution for ${topic} from scratch.`,
          `Analyze the worst-case space complexity of your ${topic} approach.`
        ],
        interviewQuestions: [
          {
            question: `How would you explain ${topic} to an interviewer?`,
            answer: `Define the core definition, time/space trade-offs, and typical placement problem patterns.`,
            explanation: `Structured communication demonstrates strong fundamentals.`
          }
        ]
      },
      quizzes: [
        {
          question: `What is a primary advantage or property of ${topic}?`,
          options: ['Improved efficiency', 'Requires no memory', 'Only works on small inputs', 'None of these'],
          correctAnswer: 0,
          explanation: 'It optimizes computation or provides a structured model.'
        }
      ],
      tags: ['AI Generated', topic, category]
    };

    res.status(200).json({
      success: true,
      data: generatedDoc
    });
  } catch (err) {
    next(err);
  }
};

// @desc Save AI-generated study material to library
// @route POST /api/ai/save-generated-material
exports.saveGeneratedMaterial = async (req, res, next) => {
  try {
    const { material } = req.body;
    if (!material || !material.title) {
      return res.status(400).json({ success: false, message: 'Invalid material payload.' });
    }

    let saved;
    if (isConnected()) {
      saved = await StudyMaterial.create({
        ...material,
        isAiGenerated: true,
        verifiedByAdmin: false
      });
    } else {
      saved = memoryStore.insertOne('studymaterials', {
        ...material,
        isAiGenerated: true,
        verifiedByAdmin: false
      });
    }

    res.status(201).json({
      success: true,
      message: 'Study material saved to your library!',
      data: saved
    });
  } catch (err) {
    next(err);
  }
};

// @desc Code explanation & bug analysis
// @route POST /api/ai/explain-code
exports.explainCode = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const { code, language, error, problemTitle } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide code to analyze.' });
    }

    const prompt = `Analyze this ${language || 'Python'} code for problem "${problemTitle || 'Coding Practice'}":
\`\`\`${language || 'python'}
${code}
\`\`\`
${error ? `Error/Compiler Message:\n${error}\n` : ''}

Please provide:
1. Clear line-by-line explanation of the logic
2. Detection of any logical bugs, edge cases, or syntax errors
3. Suggestions for code improvements and clean code formatting
4. Time and Space complexity breakdown
5. Subtle hints for optimization without giving away the full code immediately`;

    const aiResult = await aiService.generateResponse({
      mode: 'coding_assistant',
      prompt,
      context: { language, problemTitle },
      userId
    });

    res.status(200).json({
      success: true,
      explanation: aiResult.text
    });
  } catch (err) {
    next(err);
  }
};

// @desc Evaluate interview answer
// @route POST /api/ai/evaluate-interview
exports.evaluateInterview = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const { question, answer, category = 'Technical' } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Please provide both interview question and your response.' });
    }

    const prompt = `Evaluate student's answer for this ${category} placement interview question:
Question: "${question}"
Student Response: "${answer}"

Please evaluate:
1. Technical correctness and clarity (Score: 1-10)
2. Alignment with STAR method (Situation, Task, Action, Result) if applicable
3. Key strengths in the answer
4. Missing details or conceptual gaps
5. An improved, polished model answer suitable for Tier-1 companies`;

    const aiResult = await aiService.generateResponse({
      mode: 'interview_coach',
      prompt,
      context: { category, question },
      userId
    });

    res.status(200).json({
      success: true,
      feedback: aiResult.text
    });
  } catch (err) {
    next(err);
  }
};
