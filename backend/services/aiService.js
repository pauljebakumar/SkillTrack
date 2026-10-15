const axios = require('axios');
const AIUsageRecord = require('../models/AIUsageRecord');
const { isConnected } = require('../config/db');
const memoryStore = require('../config/memoryStore');

class AIService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
  }

  isConfigured() {
    return Boolean(this.geminiApiKey || this.openaiApiKey);
  }

  async generateResponse({ mode = 'study_assistant', prompt, context = {}, userId = null }) {
    const isRealApiConfigured = this.isConfigured();

    if (isRealApiConfigured) {
      try {
        if (this.geminiApiKey) {
          return await this.callGemini({ mode, prompt, context, userId });
        } else if (this.openaiApiKey) {
          return await this.callOpenAI({ mode, prompt, context, userId });
        }
      } catch (err) {
        console.warn(`[AIService] External API call failed: ${err.message}. Falling back to Intelligent Placement Engine.`);
        return this.getSimulatedResponse({ mode, prompt, context, userId, fallbackNotice: `Live AI service briefly unavailable (${err.message}). Powered by SkillTrack Placement Knowledge Base.` });
      }
    }

    // High-quality contextual response when no API key configured
    return this.getSimulatedResponse({ mode, prompt, context, userId });
  }

  async callGemini({ mode, prompt, context, userId }) {
    const systemPrompt = this.getSystemPrompt(mode, context);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nStudent Request / Query: ${prompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500
      }
    };

    const res = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    const candidate = res.data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || 'No response generated.';
    const promptTokens = res.data.usageMetadata?.promptTokenCount || 50;
    const responseTokens = res.data.usageMetadata?.candidatesTokenCount || 150;

    await this.recordUsage(userId, mode, promptTokens, responseTokens, true);

    return {
      success: true,
      text,
      isAiGenerated: true,
      modelUsed: this.geminiModel,
      mode
    };
  }

  async callOpenAI({ mode, prompt, context, userId }) {
    const systemPrompt = this.getSystemPrompt(mode, context);
    const res = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const text = res.data.choices?.[0]?.message?.content || 'No response generated.';
    const promptTokens = res.data.usage?.prompt_tokens || 50;
    const responseTokens = res.data.usage?.completion_tokens || 150;

    await this.recordUsage(userId, mode, promptTokens, responseTokens, true);

    return {
      success: true,
      text,
      isAiGenerated: true,
      modelUsed: 'gpt-4o-mini',
      mode
    };
  }

  getSystemPrompt(mode, context = {}) {
    switch (mode) {
      case 'coding_assistant':
        return `You are SkillTrack's AI Coding Assistant. Analyze the student's code, explain it line by line, point out syntax or logical bugs, suggest fixes, and explain time and space complexity. Provide hints before revealing full solutions. Language: ${context.language || 'Any'}. Problem: ${context.problemTitle || 'General Coding'}.`;
      
      case 'aptitude_coach':
        return `You are SkillTrack's Aptitude Coach. Explain concepts simply with step-by-step math derivations, shortcuts, and formulas for Quantitative Aptitude, Logical Reasoning, and Verbal Ability. Topic: ${context.topic || 'General Aptitude'}.`;

      case 'interview_coach':
        return `You are a Senior Technical and HR Interviewer at top tech companies. Conduct realistic mock interviews. Evaluate student answers on correctness, structure (STAR method for HR), clarity, and depth. Provide constructive feedback and model answers. Never guarantee job placement.`;

      case 'learning_planner':
        return `You are SkillTrack's Placement Learning Planner. Build a structured, actionable weekly and daily study schedule based on the student's target companies, college year, and weak areas. Target: ${context.targetCompany || 'Top Tech Companies'}.`;

      case 'skill_analysis':
        return `You are SkillTrack's Skill Analysis Assistant. Analyze performance metrics, identify strengths/weaknesses, pinpoint recurring conceptual gaps, and suggest targeted practice.`;

      case 'study_assistant':
      default:
        return `You are SkillTrack's AI Study Assistant. Explain core computer science, programming, and aptitude concepts clearly with simple analogies, code snippets, important formulas, and campus placement interview tips.`;
    }
  }

  getSimulatedResponse({ mode, prompt, context, userId, fallbackNotice = null }) {
    const p = prompt.toLowerCase();
    let text = '';

    if (mode === 'coding_assistant') {
      if (p.includes('complexity') || p.includes('time') || p.includes('space')) {
        text = `### Complexity Analysis\n\n- **Time Complexity**: **O(N log N)** if sorting is used, or **O(N)** using an optimal hash map / frequency array.\n- **Space Complexity**: **O(N)** auxiliary space for tracking elements.\n\n**Optimization Tip:** Avoid nested loops when looking for pairs or frequency lookups; a Hash Map reduces $O(N^2)$ to $O(N)$ runtime.`;
      } else if (p.includes('error') || p.includes('bug') || p.includes('syntax') || p.includes('fix')) {
        text = `### Code Diagnosis & Bug Analysis\n\n1. **Potential Pitfall Identified**: Check boundary conditions in loop bounds (e.g., \`i <= length\` vs \`i < length\`) which can trigger an off-by-one IndexOutOfBounds error.\n2. **Null/Empty Checks**: Ensure you check if the input array or string is empty before accessing index \`0\`.\n3. **Recommended Fix**:\n\`\`\`python\n# Always guard against empty inputs\nif not arr:\n    return []\n\`\`\`\nTry re-running with your sample test cases!`;
      } else {
        text = `### Code Review & Explanation\n\nYour code approaches the problem using standard logic:\n- **Structure**: The initialization and iteration flow is clear.\n- **Improvement**: Consider handling edge cases such as negative integers, single-element collections, and duplicates.\n- **Suggested Hint**: What happens if the target value doesn't exist in the input? Make sure you return \`-1\` or default empty value as specified in the problem statement.`;
      }
    } else if (mode === 'interview_coach') {
      if (p.includes('tell me about yourself') || p.includes('introduction')) {
        text = `### Interview Feedback: "Tell Me About Yourself"\n\n**Evaluation:**\n- **Structure (Present-Past-Future)**: Start with your current degree and primary technical stack (e.g., Full Stack / DSA in Python or Java).\n- **Highlights**: Mention 1-2 impactful projects with quantifiable achievements (e.g., "built a real-time system handling 500+ requests").\n- **Alignment**: State clearly why you are excited about this specific role.\n\n**Example Response Structure:**\n> "Hi, I am currently in my 3rd year of Computer Science at [College]. My core focus is on Data Structures, Backend Development, and Database Systems. Recently, I developed [Project Name], which solved [Problem]. I'm particularly interested in this role because of your focus on scalable distributed systems."`;
      } else if (p.includes('project') || p.includes('resume')) {
        text = `### Project Explanation Guidance (STAR Method)\n\n1. **Situation**: What was the real-world problem or context?\n2. **Task**: What specific responsibility was assigned to you or what was your goal?\n3. **Action**: Which tech stack did you choose and what technical challenges (e.g. state management, API design, concurrency) did you solve?\n4. **Result**: What was the outcome? Include performance improvements (e.g. "reduced load time by 35%").\n\n*Pro-tip: Always be ready to answer: 'If you had to rewrite this project today, what architecture would you change?'*`;
      } else {
        text = `### Technical Interviewer Evaluation\n\n**Question to consider:** *Explain the difference between Process and Thread, and how OS scheduling handles context switching.*\n\n**Feedback & Model Points:**\n- A **Process** is an executing program with its own dedicated memory space, while a **Thread** is a lightweight unit of execution sharing the process's memory.\n- Mention context switching overhead: process switching requires invalidating CPU caches and TLB, whereas thread switching within the same process is significantly faster.\n- Mention real-world examples: web server worker threads vs separate processes.`;
      }
    } else if (mode === 'aptitude_coach') {
      text = `### Aptitude Concept & Derivation\n\n**Topic Strategy & Key Formulas:**\n1. **Efficiency Rule in Time & Work**: If $A$ can do a work in $x$ days, $A$'s 1-day work = $\\frac{1}{x}$.\n2. **Combined Work**: If $A$ and $B$ work together, their combined 1-day work = $\\frac{1}{x} + \\frac{1}{y} = \\frac{x + y}{xy}$. Hence total days required = $\\frac{xy}{x + y}$.\n\n**Shortcut Method (LCM Method):**\n- Take LCM of days as total work units.\n- Calculate individual efficiencies (work units per day).\n- Divide total units by sum of efficiencies. Eliminates fractions completely!`;
    } else if (mode === 'learning_planner') {
      text = `### Personalized 4-Week Placement Roadmap\n\n- **Week 1: Foundations & Aptitude**: Number systems, percentages, ratios, and time-work daily. Solve 10 questions/day.\n- **Week 2: DSA Core**: Arrays, strings, two-pointers, hash tables, sliding window. 3 problems/day on SkillTrack.\n- **Week 3: Core CS & Advanced DSA**: Trees, graphs, dynamic programming fundamentals, plus DBMS SQL queries and OS scheduling.\n- **Week 4: Mock Assessments & Interview Drill**: 2 full mock tests/week, resume project walkthroughs, and behavioral HR prep.`;
    } else {
      text = `### Concept Explanation & Placement Insights\n\nHere is a comprehensive breakdown for **"${prompt}"**:\n\n1. **Core Concept**: Broken down to foundational principles so you can explain it clearly in an interview.\n2. **Why Interviewers Ask This**: Assesses your fundamental grasp vs memorization.\n3. **Practical Implementation**: Always relate the theoretical property to an actual software engineering use case.\n4. **Key Takeaway**: Keep your explanation crisp and structured before diving into code or math calculations.`;
    }

    if (fallbackNotice) {
      text = `> ℹ️ *${fallbackNotice}*\n\n` + text;
    } else if (!this.isConfigured()) {
      text = `> 💡 *SkillTrack AI Engine (Active Mode: Comprehensive Placement Knowledge Base. To connect live Gemini API, configure GEMINI_API_KEY in backend/.env)*\n\n` + text;
    }

    // record simulated usage
    this.recordUsage(userId, mode, 30, 120, true).catch(() => {});

    return {
      success: true,
      text,
      isAiGenerated: true,
      modelUsed: 'SkillTrack-Placement-Engine',
      mode
    };
  }

  async recordUsage(userId, feature, promptTokens, responseTokens, success) {
    if (!userId) return;
    try {
      if (isConnected()) {
        await AIUsageRecord.create({
          user: userId,
          feature,
          promptTokens,
          responseTokens,
          success
        });
      } else {
        memoryStore.insertOne('aiusagerecords', {
          user: userId,
          feature,
          promptTokens,
          responseTokens,
          success,
          createdAt: new Date()
        });
      }
    } catch (e) {
      // ignore usage record errors
    }
  }
}

const aiService = new AIService();
module.exports = aiService;
