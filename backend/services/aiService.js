const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const axios = require('axios');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Initialize Groq (using OpenAI SDK compatibility)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || '',
  baseURL: 'https://api.groq.com/openai/v1'
});

class AIService {
  constructor() {
    this.chatSessions = new Map();
  }

  /**
   * Primary Provider: Gemini
   */
  async executeGemini(prompt) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }

  /**
   * Fallback Provider: Groq (Llama 3.1 8B)
   */
  async executeGroq(prompt) {
    if (!process.env.GROQ_API_KEY) throw new Error('Groq key missing');
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30s timeout
    });
    return response.data.choices[0].message.content.trim();
  }

  /**
   * Final Backup: OpenRouter
   */
  async executeOpenRouter(prompt) {
    if (!process.env.OPENROUTER_API_KEY) throw new Error('OpenRouter key missing');
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3-8b-instruct:free',
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': 'Edu AI Platform',
        'Content-Type': 'application/json'
      }
    });
    return response.data.choices[0].message.content.trim();
  }

  /**
   * Tiered Orchestrator: Gemini -> Groq -> OpenRouter
   * Now supports forcedTier for manual selection
   */
  /**
   * Tiered Orchestrator: Gemini -> Groq -> OpenRouter
   * Now supports forcedTier for manual selection
   */
  async executeAI(prompt, isJson = false, forcedTier = 'auto') {
    let lastError = null;
    let tiers = [];

    // Determine order
    if (forcedTier === 'gemini') tiers = ['gemini', 'groq', 'openrouter'];
    else if (forcedTier === 'groq') tiers = ['groq', 'gemini', 'openrouter'];
    else if (forcedTier === 'openrouter') tiers = ['openrouter', 'gemini', 'groq'];
    else tiers = ['gemini', 'groq', 'openrouter']; // Auto order

    for (const tier of tiers) {
      try {
        if (tier === 'gemini') {
          console.log('🤖 Attempting Gemini Tier...');
          const text = await this.executeGemini(prompt);
          return this.processResponse(text, isJson);
        }
        
        const hasGroq = process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_');
        if (tier === 'groq' && hasGroq) {
          console.log('⚡ Attempting Groq Tier...');
          const text = await this.executeGroq(prompt);
          console.log('✅ Groq success!');
          return this.processResponse(text, isJson);
        }
        
        const hasOpenRouter = process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.includes('your_');
        if (tier === 'openrouter' && hasOpenRouter) {
          console.log('🔒 Attempting OpenRouter Tier...');
          const text = await this.executeOpenRouter(prompt);
          return this.processResponse(text, isJson);
        }
      } catch (e) {
        console.warn(`⚠️ ${tier} Tier failed:`, e.response?.data || e.message);
        lastError = e;
        // Even if a tier is forced, we want to succeed. 
        // We just start with the forced one.
      }
    }

    console.error('💥 ALL AI TIERS EXHAUSTED. Last error:', lastError?.message || lastError);
    if (lastError?.response?.data) console.error('Error Data:', JSON.stringify(lastError.response.data));
    throw lastError || new Error('All AI Tiers exhausted.');
  }

  processResponse(text, isJson) {
    if (!isJson) return text;

    // Advanced JSON cleaning
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    } else if (firstBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
      return JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('❌ AI JSON Parse Error:', parseErr.message, 'Raw text:', text.substring(0, 100));
      throw new Error('AI returned invalid dynamic content format.');
    }
  }

  // AI Tutor Chat
  async chat(studentId, message, context = {}, modelTier = 'auto') {
    try {
      const systemPrompt = `You are EDU AI, a personalized and intelligent mentor for ${context.studentName || 'the student'}.
Current subject: ${context.subject || 'General'}
Internal Difficulty Parameter: ${context.level || 1} (out of 100)

Guidelines:
1. Address the student by name (${context.studentName || 'Student'}) naturally.
2. Provide comprehensive, expert-level explanations based on the Internal Difficulty Parameter.
3. Use Markdown (headings, lists, bold text) for clarity.
4. CRITICAL: DO NOT repeat or mention the level number (e.g., "${context.level}") or labels like "Difficulty Depth" in your message. 
5. Start your response with a warm, personalized greeting to ${context.studentName || 'the student'}.`;

      const prompt = `${systemPrompt}\n\nStudent: ${message}\n\nTutor:`;
      const reply = await this.executeAI(prompt, false, modelTier);
      return { reply, success: true };
    } catch (err) {
      console.error('Chat Service Error:', err);
      return { reply: this.getFriendlyErrorMessage(err), success: false };
    }
  }

  // AI Explain Answer
  async explainAnswer(question, correctAnswer, userAnswer, subject, topic) {
    try {
      const prompt = `You are an expert ${subject} tutor. Explain why "${correctAnswer}" is correct and "${userAnswer}" is wrong for the question: "${question}". Target topic: ${topic}. Use encouraging tone and markdown.`;
      const explanation = await this.executeAI(prompt);
      return { explanation, success: true };
    } catch (err) {
      return { explanation: `Review ${topic}. Correct answer: ${correctAnswer}.`, success: false };
    }
  }

  // Question Generation
  async generateQuestions(subject, topic, difficulty, count = 5) {
    try {
      const diffLabel = difficulty === 1 ? 'easy' : difficulty === 2 ? 'medium' : 'hard';
      const prompt = `Generate ${count} MCQs about ${topic} in ${subject}. Difficulty: ${diffLabel}.
      Return ONLY a JSON array of objects. Each object MUST have: "id" (string), "question" (string), "options" (array of 4 strings), "answer" (string matching one option), "explanation" (string), "topic" (string).
      NO markdown, NO preamble. Example: [{"id":"ai_1","question":"...","options":["..."],"answer":"...","explanation":"...","topic":"${topic}"}]`;
      
      const questions = await this.executeAI(prompt, true);
      return { questions, success: true };
    } catch (err) {
      console.error('❌ generateQuestions Error:', err.message);
      return { questions: [], success: false };
    }
  }

  // Study Planner
  async generateStudyPlan(studentData) {
    try {
      const prompt = `Create a 7-day study plan for a student at level ${studentData.level}. 
      Return ONLY JSON: {"weeklyGoal":"...","dailyMinutes":45,"plan":[{"day":"Monday","tasks":[{"subject":"...","topic":"...","type":"...","duration":15,"priority":"high"}]}],"tips":["..."]}`;
      const plan = await this.executeAI(prompt, true);
      return { plan, success: true };
    } catch (err) {
      return { plan: null, success: false };
    }
  }

  // Flashcards
  async generateFlashcards(subject, topic, notes) {
    try {
      const prompt = `Create 8 study flashcards for ${topic} in ${subject}. ${notes ? `Context: ${notes}` : ''}
      Return ONLY a JSON array: [{"id":1,"front":"...","back":"...","difficulty":"medium"}]`;
      const flashcards = await this.executeAI(prompt, true);
      return { flashcards, success: true };
    } catch (err) {
      return { flashcards: [], success: false };
    }
  }

  // Learning Path
  async generateLearningPath(subject, weakAreas = []) {
    try {
      const prompt = `Create a structured 9-level learning path for "${subject}". 
      Return ONLY a JSON array of milestones with topics and levels.`;
      const learningPath = await this.executeAI(prompt, true);
      return { learningPath, success: true };
    } catch (err) {
      return { learningPath: [], success: false };
    }
  }

  // Summarize
  async summarize(text, type = 'notes') {
    try {
      const prompt = `Summarize this ${type} into key concepts and memory tips: \n\n${text.substring(0, 3000)}`;
      const summary = await this.executeAI(prompt);
      return { summary, success: true };
    } catch (err) {
      return { summary: 'Unable to summarize.', success: false };
    }
  }

  // Performance Analysis
  async analyzePerformance(subject, details, accuracy) {
    try {
      const filteredDetails = (details || []).map(d => ({
        q: d.question,
        correct: d.correct,
        topic: d.topic,
        time: d.responseTime
      })).slice(0, 20); // Limit to avoid prompt length issues

      const prompt = `You are an expert AI Education Analyst. Analyze the following quiz results for a student.
      Subject: ${subject}
      Accuracy: ${accuracy}%
      Results Detail: ${JSON.stringify(filteredDetails)}

      Provide a deep, constructive analysis. Focus on identifying specific conceptual misunderstandings and providing actionable advice.
      Return ONLY a JSON object: {
        "summary": "A 2-3 sentence overview of the performance.",
        "insights": ["Point 1 about behavior/patterns", "Point 2 about specific topic mastery"],
        "recommendations": ["Actionable step 1", "Actionable step 2"],
        "status": "Exceptional/Steady/Requires Attention"
      }`;

      const report = await this.executeAI(prompt, true);
      return { report, success: true };
    } catch (err) {
      console.error('Performance Analysis Error:', err);
      return { report: null, success: false };
    }
  }

  getFriendlyErrorMessage(err) {
    return 'I\'m having trouble connecting to my brain tiers right now. Please try again soon!';
  }
}

module.exports = new AIService();
