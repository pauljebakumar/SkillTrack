import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ArrowLeft,
  Play,
  Send,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  HelpCircle,
  Lightbulb,
  Cpu,
  Layers,
  ChevronDown
} from 'lucide-react';

export default function CodingProblemDetail({ questionId, setActivePath }) {
  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [activeTab, setActiveTab] = useState('description'); // description, output, ai
  const [runResult, setRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAssistantLoading, setAiAssistantLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/coding/questions/${questionId}`);
      if (res.data?.success) {
        const q = res.data.data;
        setQuestion(q);
        // Default starter code
        const initialCode = q.starterCode?.[language] || q.starterCode?.python || getDefaultCode(language);
        setCode(initialCode);
        if (q.sampleTestCases?.[0]?.input) {
          setCustomInput(q.sampleTestCases[0].input);
        }
      }
    } catch (err) {
      console.error('Failed to load question:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultCode = (lang) => {
    switch (lang) {
      case 'javascript':
        return `// JavaScript (Node.js)\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`;
      case 'cpp':
        return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // C++ solution\n    return 0;\n}`;
      case 'c':
        return `#include <stdio.h>\n\nint main() {\n    // C solution\n    return 0;\n}`;
      case 'java':
        return `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Java solution\n    }\n}`;
      case 'python':
      default:
        return `# Python 3\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().strip().split('\\n')\n    # Write your solution here\n\nsolve()`;
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (question?.starterCode?.[newLang]) {
      setCode(question.starterCode[newLang]);
    } else {
      setCode(getDefaultCode(newLang));
    }
  };

  const handleResetCode = () => {
    if (question?.starterCode?.[language]) {
      setCode(question.starterCode[language]);
    } else {
      setCode(getDefaultCode(language));
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab('output');
    try {
      const res = await api.post('/coding/run', {
        code,
        language,
        stdin: customInput,
        expectedOutput: question?.sampleTestCases?.[0]?.expectedOutput || '',
        timeLimit: question?.timeLimitSeconds || 2
      });
      if (res.data?.success) {
        setRunResult(res.data.result);
        setSubmissionResult(null);
      }
    } catch (err) {
      console.error('Run code error:', err);
      setRunResult({
        success: false,
        status: 'Runtime Error',
        stderr: err.response?.data?.message || err.message,
        stdout: ''
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!question) return;
    setIsSubmitting(true);
    setActiveTab('output');
    try {
      const res = await api.post(`/coding/questions/${question._id}/submit`, {
        code,
        language
      });
      if (res.data?.success) {
        setSubmissionResult(res.data.submission);
        setRunResult(null);
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskAI = async (task) => {
    setAiAssistantLoading(true);
    setActiveTab('ai');
    try {
      let promptText = '';
      if (task === 'explain') {
        promptText = 'Explain this code line by line clearly and explain how it solves the problem.';
      } else if (task === 'bugs') {
        promptText = 'Identify any potential syntax errors, runtime pitfalls, or boundary condition edge case bugs in this code.';
      } else if (task === 'complexity') {
        promptText = 'Analyze the time and space complexity in Big-O notation and suggest potential optimizations.';
      } else if (task === 'hints') {
        promptText = 'Provide 2 progressive hints to guide me towards an optimal solution without revealing the complete code.';
      }

      const res = await api.post('/ai/explain-code', {
        code,
        language,
        error: runResult?.stderr || submissionResult?.compilerOutput || '',
        problemTitle: question?.title
      });

      if (res.data?.success) {
        setAiResponse(res.data.explanation);
      }
    } catch (err) {
      console.error('AI assistant error:', err);
      setAiResponse('AI Coach briefly unavailable. Please review code logic manually.');
    } finally {
      setAiAssistantLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading problem environment...</div>;
  }

  if (!question) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm text-slate-400">Problem not found.</p>
        <button onClick={() => setActivePath('/coding')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Back to Problems
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePath('/coding')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{question.title}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                question.difficulty === 'Beginner'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : question.difficulty === 'Intermediate'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {question.difficulty}
              </span>
            </h1>
          </div>
        </div>

        {/* AI Quick Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => handleAskAI('explain')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Explain Code</span>
          </button>
          <button
            onClick={() => handleAskAI('bugs')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Find Bugs</span>
          </button>
          <button
            onClick={() => handleAskAI('complexity')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Complexity</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Left Description/AI/Output, Right Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-12rem)] min-h-[550px]">
        {/* Left Column (5/12): Tabs Description, Test Output, AI Coach */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {/* Sub Navigation */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-2 py-1 text-xs">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'description'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'output'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Execution Output</span>
              {(runResult || submissionResult) && (
                <span className={`w-2 h-2 rounded-full ${
                  (submissionResult?.status === 'Accepted' || runResult?.status === 'Accepted')
                    ? 'bg-emerald-500'
                    : 'bg-rose-500'
                }`} />
              )}
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'ai'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Assistant</span>
            </button>
          </div>

          {/* Tab 1: Description Content */}
          {activeTab === 'description' && (
            <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
              <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {question.description}
              </div>

              {question.inputFormat && (
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs">Input Format</h3>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono">
                    {question.inputFormat}
                  </div>
                </div>
              )}

              {question.outputFormat && (
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs">Output Format</h3>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono">
                    {question.outputFormat}
                  </div>
                </div>
              )}

              {question.constraints && (
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs">Constraints</h3>
                  <pre className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-mono">
                    {question.constraints}
                  </pre>
                </div>
              )}

              {/* Sample Test Cases */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs">Sample Test Cases</h3>
                {question.sampleTestCases?.map((tc, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs">
                    <div className="font-semibold text-indigo-600 dark:text-indigo-400">Sample {idx + 1}</div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Input:</span>
                      <pre className="font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                        {tc.input}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Expected Output:</span>
                      <pre className="font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-bold">
                        {tc.expectedOutput}
                      </pre>
                    </div>
                    {tc.explanation && (
                      <p className="text-[11px] text-slate-500 italic">Explanation: {tc.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Execution Output */}
          {activeTab === 'output' && (
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              {isRunning || isSubmitting ? (
                <div className="py-16 text-center space-y-2">
                  <div className="w-8 h-8 mx-auto border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400">
                    {isSubmitting ? 'Evaluating solution against all test cases...' : 'Compiling and executing code...'}
                  </p>
                </div>
              ) : submissionResult ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    submissionResult.status === 'Accepted'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200'
                  }`}>
                    <div>
                      <div className="text-base font-bold flex items-center gap-2">
                        {submissionResult.status === 'Accepted' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        <span>{submissionResult.status}</span>
                      </div>
                      <p className="text-xs mt-1">
                        Passed {submissionResult.testCasesPassed} of {submissionResult.totalTestCases} Test Cases
                      </p>
                    </div>
                    <div className="text-right text-[11px]">
                      <div>Time: {submissionResult.executionTimeMs} ms</div>
                      <div>Memory: {submissionResult.memoryUsedKB} KB</div>
                    </div>
                  </div>

                  {/* Test case breakdown table */}
                  <div className="space-y-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">Test Case Results:</span>
                    {submissionResult.testCaseResults?.map((res, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                          res.passed
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {res.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                          <span>Case {res.caseNumber}: {res.passed ? 'Passed' : 'Failed'}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{res.executionTimeMs}ms</span>
                      </div>
                    ))}
                  </div>

                  {submissionResult.compilerOutput && (
                    <div className="p-3 rounded-xl bg-slate-900 text-rose-400 border border-rose-800 text-xs overflow-x-auto">
                      <span className="text-slate-400 block mb-1">Compiler Output:</span>
                      <code>{submissionResult.compilerOutput}</code>
                    </div>
                  )}
                </div>
              ) : runResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className={`font-bold ${runResult.status === 'Accepted' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      Status: {runResult.status}
                    </span>
                    <span className="text-slate-400 text-[11px]">{runResult.executionTimeMs} ms</span>
                  </div>

                  {runResult.stdout && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block mb-1">Standard Output:</span>
                      <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 overflow-x-auto">
                        <code>{runResult.stdout}</code>
                      </pre>
                    </div>
                  )}

                  {runResult.stderr && (
                    <div>
                      <span className="text-[10px] text-rose-400 uppercase block mb-1">Error Stream:</span>
                      <pre className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 overflow-x-auto">
                        <code>{runResult.stderr}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400">
                  Click <span className="font-semibold text-indigo-500">Run Code</span> or <span className="font-semibold text-emerald-500">Submit Solution</span> to compile and inspect outputs.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: AI Assistant */}
          {activeTab === 'ai' && (
            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI Coding Assistant is ready to inspect, explain, and review your code.</span>
              </div>

              {aiAssistantLoading ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-6 h-6 mx-auto border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400">Analyzing code structure & time complexity...</p>
                </div>
              ) : aiResponse ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed text-xs">
                  {aiResponse}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Select what you'd like the AI to help with:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleAskAI('explain')} className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-semibold">
                      Explain Code Line-by-Line
                    </button>
                    <button onClick={() => handleAskAI('bugs')} className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-semibold">
                      Detect Logical Bugs
                    </button>
                    <button onClick={() => handleAskAI('complexity')} className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-semibold">
                      Time & Space Complexity
                    </button>
                    <button onClick={() => handleAskAI('hints')} className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-semibold">
                      Get Progressive Hints
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (7/12): Code Editor, Language Picker, Custom Stdin & Run/Submit */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl bg-[#0b0f19] border border-slate-800 overflow-hidden shadow-lg">
          {/* Editor Header */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Language:</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize"
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="cpp">C++ (GCC)</option>
                <option value="c">C (GCC)</option>
                <option value="java">Java (OpenJDK)</option>
              </select>
            </div>

            <button
              onClick={handleResetCode}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              title="Reset to starter code"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Code Textarea Area */}
          <div className="flex-1 relative flex">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-xs text-indigo-100 bg-[#0b0f19] focus:outline-none resize-none leading-relaxed selection:bg-indigo-500/40"
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
            />
          </div>

          {/* Custom Input Drawer */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Custom Input (stdin):</span>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Provide test input here..."
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Editor Action Buttons */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Sandboxed Execution Enabled
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-indigo-400 fill-current" />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>

              <button
                onClick={handleSubmitSolution}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
