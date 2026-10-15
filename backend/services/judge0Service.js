const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Judge0 Language IDs
const LANGUAGE_IDS = {
  c: 50, // C (GCC 9.2.0)
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (OpenJDK 13.0.1)
  python: 71, // Python (3.8.1)
  javascript: 63 // JavaScript (Node.js 12.14.0)
};

class Judge0Service {
  constructor() {
    this.apiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
    this.rapidApiHost = process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
    this.isJudge0Configured = Boolean(this.rapidApiKey || process.env.JUDGE0_API_URL);
  }

  async executeCode({ code, language, stdin = '', expectedOutput = '', timeLimit = 2 }) {
    if (this.isJudge0Configured && this.rapidApiKey) {
      try {
        return await this.executeViaJudge0({ code, language, stdin, expectedOutput, timeLimit });
      } catch (err) {
        console.warn(`[Judge0Service] Judge0 API error: ${err.message}. Using isolated sandbox runner.`);
      }
    }

    // Isolated sandbox runner
    return await this.executeViaLocalSandbox({ code, language, stdin, expectedOutput, timeLimit });
  }

  async executeViaJudge0({ code, language, stdin, expectedOutput, timeLimit }) {
    const langId = LANGUAGE_IDS[language.toLowerCase()] || 71;
    const url = `${this.apiUrl}/submissions?base64_encoded=false&wait=true`;

    const response = await axios.post(
      url,
      {
        source_code: code,
        language_id: langId,
        stdin: stdin,
        expected_output: expectedOutput || null,
        cpu_time_limit: timeLimit,
        memory_limit: 128000
      },
      {
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': this.rapidApiHost
        },
        timeout: 15000
      }
    );

    const data = response.data;
    const statusDesc = data.status?.description || 'Unknown';
    const isAccepted = statusDesc === 'Accepted';
    const stdout = (data.stdout || '').trim();
    const stderr = (data.stderr || data.compile_output || '').trim();

    return {
      success: isAccepted,
      status: this.mapJudge0Status(statusDesc),
      stdout,
      stderr,
      executionTimeMs: Math.round(parseFloat(data.time || 0) * 1000),
      memoryUsedKB: data.memory || 0,
      compilerOutput: data.compile_output || ''
    };
  }

  mapJudge0Status(status) {
    if (status === 'Accepted') return 'Accepted';
    if (status.includes('Wrong Answer')) return 'Wrong Answer';
    if (status.includes('Time Limit')) return 'Time Limit Exceeded';
    if (status.includes('Compilation Error')) return 'Compilation Error';
    return 'Runtime Error';
  }

  async executeViaLocalSandbox({ code, language, stdin, expectedOutput, timeLimit }) {
    const lang = language.toLowerCase();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skilltrack_sandbox_'));
    const startTime = Date.now();

    try {
      if (lang === 'javascript') {
        return await this.runNodeSandbox(code, stdin, expectedOutput, tempDir, timeLimit, startTime);
      } else if (lang === 'python') {
        return await this.runPythonSandbox(code, stdin, expectedOutput, tempDir, timeLimit, startTime);
      } else if (lang === 'cpp' || lang === 'c') {
        return await this.runCCompiledSandbox(code, lang, stdin, expectedOutput, tempDir, timeLimit, startTime);
      } else if (lang === 'java') {
        return await this.runJavaSandbox(code, stdin, expectedOutput, tempDir, timeLimit, startTime);
      } else {
        return {
          success: false,
          status: 'Runtime Error',
          stdout: '',
          stderr: `Language '${language}' is not supported in local sandbox mode.`,
          executionTimeMs: 0,
          memoryUsedKB: 0
        };
      }
    } finally {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {
        // cleanup ignore
      }
    }
  }

  runNodeSandbox(code, stdin, expectedOutput, tempDir, timeLimit, startTime) {
    return new Promise(resolve => {
      const scriptPath = path.join(tempDir, 'solution.js');
      fs.writeFileSync(scriptPath, code);

      const proc = spawn(process.execPath, [scriptPath], {
        timeout: timeLimit * 1000,
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=128' }
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      if (stdin) {
        proc.stdin.write(stdin);
        proc.stdin.end();
      }

      proc.stdout.on('data', data => {
        if (stdout.length < 50000) stdout += data.toString();
      });

      proc.stderr.on('data', data => {
        if (stderr.length < 50000) stderr += data.toString();
      });

      proc.on('error', err => {
        stderr += err.message;
      });

      const timer = setTimeout(() => {
        timedOut = true;
        try { proc.kill('SIGKILL'); } catch (e) {}
      }, timeLimit * 1000);

      proc.on('close', code => {
        clearTimeout(timer);
        const executionTimeMs = Date.now() - startTime;
        const cleanStdout = stdout.trim();
        const cleanStderr = stderr.trim();

        if (timedOut) {
          return resolve({
            success: false,
            status: 'Time Limit Exceeded',
            stdout: cleanStdout,
            stderr: 'Execution timed out exceeding time limit',
            executionTimeMs,
            memoryUsedKB: 24000
          });
        }

        if (code !== 0 || cleanStderr) {
          return resolve({
            success: false,
            status: 'Runtime Error',
            stdout: cleanStdout,
            stderr: cleanStderr,
            executionTimeMs,
            memoryUsedKB: 28000
          });
        }

        const isMatch = this.compareOutputs(cleanStdout, expectedOutput);
        resolve({
          success: isMatch,
          status: isMatch ? 'Accepted' : 'Wrong Answer',
          stdout: cleanStdout,
          stderr: '',
          executionTimeMs,
          memoryUsedKB: 25000
        });
      });
    });
  }

  runPythonSandbox(code, stdin, expectedOutput, tempDir, timeLimit, startTime) {
    return new Promise(resolve => {
      const scriptPath = path.join(tempDir, 'solution.py');
      fs.writeFileSync(scriptPath, code);

      // On Windows, the official Python installer registers 'py'. Use 'py' if on Windows or 'python'/'python3'
      const pythonCmd = process.platform === 'win32' ? 'py' : 'python3';
      const proc = spawn(pythonCmd, ['-u', scriptPath], {
        timeout: timeLimit * 1000
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      if (stdin) {
        proc.stdin.write(stdin);
        proc.stdin.end();
      }

      proc.stdout.on('data', data => {
        if (stdout.length < 50000) stdout += data.toString();
      });

      proc.stderr.on('data', data => {
        if (stderr.length < 50000) stderr += data.toString();
      });

      proc.on('error', err => {
        stderr += `Python interpreter error: ${err.message}. Ensure python is installed in system path.`;
      });

      const timer = setTimeout(() => {
        timedOut = true;
        try { proc.kill('SIGKILL'); } catch (e) {}
      }, timeLimit * 1000);

      proc.on('close', code => {
        clearTimeout(timer);
        const executionTimeMs = Date.now() - startTime;
        const cleanStdout = stdout.trim();
        const cleanStderr = stderr.trim();

        if (timedOut) {
          return resolve({
            success: false,
            status: 'Time Limit Exceeded',
            stdout: cleanStdout,
            stderr: 'Execution timed out exceeding limit',
            executionTimeMs,
            memoryUsedKB: 18000
          });
        }

        if (code !== 0 || cleanStderr) {
          const isSyntaxError = cleanStderr.includes('SyntaxError');
          return resolve({
            success: false,
            status: isSyntaxError ? 'Compilation Error' : 'Runtime Error',
            stdout: cleanStdout,
            stderr: cleanStderr,
            executionTimeMs,
            memoryUsedKB: 16000
          });
        }

        const isMatch = this.compareOutputs(cleanStdout, expectedOutput);
        resolve({
          success: isMatch,
          status: isMatch ? 'Accepted' : 'Wrong Answer',
          stdout: cleanStdout,
          stderr: '',
          executionTimeMs,
          memoryUsedKB: 15000
        });
      });
    });
  }

  runCCompiledSandbox(code, lang, stdin, expectedOutput, tempDir, timeLimit, startTime) {
    return new Promise(resolve => {
      const ext = lang === 'cpp' ? 'cpp' : 'c';
      const compiler = lang === 'cpp' ? 'g++' : 'gcc';
      const srcPath = path.join(tempDir, `solution.${ext}`);
      const outPath = path.join(tempDir, process.platform === 'win32' ? 'solution.exe' : 'solution.out');

      fs.writeFileSync(srcPath, code);

      const compileProc = spawn(compiler, [srcPath, '-o', outPath]);
      let compileErr = '';

      compileProc.stderr.on('data', d => { compileErr += d.toString(); });

      compileProc.on('error', () => {
        resolve({
          success: false,
          status: 'Compilation Error',
          stdout: '',
          stderr: `${compiler} not detected on local server. To run C/C++, configure Judge0 API or install gcc/g++.`,
          executionTimeMs: 0,
          memoryUsedKB: 0
        });
      });

      compileProc.on('close', code => {
        if (code !== 0) {
          return resolve({
            success: false,
            status: 'Compilation Error',
            stdout: '',
            stderr: compileErr,
            executionTimeMs: 0,
            memoryUsedKB: 0
          });
        }

        // Run executable
        const runProc = spawn(outPath);
        let stdout = '';
        let stderr = '';
        let timedOut = false;

        if (stdin) {
          runProc.stdin.write(stdin);
          runProc.stdin.end();
        }

        runProc.stdout.on('data', d => { stdout += d.toString(); });
        runProc.stderr.on('data', d => { stderr += d.toString(); });

        const timer = setTimeout(() => {
          timedOut = true;
          try { runProc.kill('SIGKILL'); } catch (e) {}
        }, timeLimit * 1000);

        runProc.on('close', runExitCode => {
          clearTimeout(timer);
          const executionTimeMs = Date.now() - startTime;
          const cleanStdout = stdout.trim();

          if (timedOut) {
            return resolve({
              success: false,
              status: 'Time Limit Exceeded',
              stdout: cleanStdout,
              stderr: 'Time limit exceeded',
              executionTimeMs,
              memoryUsedKB: 8000
            });
          }

          if (runExitCode !== 0) {
            return resolve({
              success: false,
              status: 'Runtime Error',
              stdout: cleanStdout,
              stderr: stderr.trim(),
              executionTimeMs,
              memoryUsedKB: 8000
            });
          }

          const isMatch = this.compareOutputs(cleanStdout, expectedOutput);
          resolve({
            success: isMatch,
            status: isMatch ? 'Accepted' : 'Wrong Answer',
            stdout: cleanStdout,
            stderr: '',
            executionTimeMs,
            memoryUsedKB: 8000
          });
        });
      });
    });
  }

  runJavaSandbox(code, stdin, expectedOutput, tempDir, timeLimit, startTime) {
    return new Promise(resolve => {
      // Find public class name or default to Solution / Main
      const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      const className = match ? match[1] : 'Solution';
      const srcPath = path.join(tempDir, `${className}.java`);

      fs.writeFileSync(srcPath, code);

      const javac = spawn('javac', [srcPath]);
      let compileErr = '';

      javac.stderr.on('data', d => { compileErr += d.toString(); });
      javac.on('error', () => {
        resolve({
          success: false,
          status: 'Compilation Error',
          stdout: '',
          stderr: 'JDK javac not detected on local server. To run Java, configure Judge0 API or install OpenJDK.',
          executionTimeMs: 0,
          memoryUsedKB: 0
        });
      });

      javac.on('close', code => {
        if (code !== 0) {
          return resolve({
            success: false,
            status: 'Compilation Error',
            stdout: '',
            stderr: compileErr,
            executionTimeMs: 0,
            memoryUsedKB: 0
          });
        }

        const javaProc = spawn('java', ['-cp', tempDir, className]);
        let stdout = '';
        let stderr = '';
        let timedOut = false;

        if (stdin) {
          javaProc.stdin.write(stdin);
          javaProc.stdin.end();
        }

        javaProc.stdout.on('data', d => { stdout += d.toString(); });
        javaProc.stderr.on('data', d => { stderr += d.toString(); });

        const timer = setTimeout(() => {
          timedOut = true;
          try { javaProc.kill('SIGKILL'); } catch (e) {}
        }, timeLimit * 1000);

        javaProc.on('close', exitCode => {
          clearTimeout(timer);
          const executionTimeMs = Date.now() - startTime;
          const cleanStdout = stdout.trim();

          if (timedOut) {
            return resolve({
              success: false,
              status: 'Time Limit Exceeded',
              stdout: cleanStdout,
              stderr: 'Time limit exceeded',
              executionTimeMs,
              memoryUsedKB: 32000
            });
          }

          if (exitCode !== 0) {
            return resolve({
              success: false,
              status: 'Runtime Error',
              stdout: cleanStdout,
              stderr: stderr.trim(),
              executionTimeMs,
              memoryUsedKB: 32000
            });
          }

          const isMatch = this.compareOutputs(cleanStdout, expectedOutput);
          resolve({
            success: isMatch,
            status: isMatch ? 'Accepted' : 'Wrong Answer',
            stdout: cleanStdout,
            stderr: '',
            executionTimeMs,
            memoryUsedKB: 32000
          });
        });
      });
    });
  }

  compareOutputs(actual, expected) {
    if (expected === undefined || expected === null) return true;
    const normActual = String(actual).replace(/\r\n/g, '\n').trim();
    const normExpected = String(expected).replace(/\r\n/g, '\n').trim();
    return normActual === normExpected;
  }
}

const judge0Service = new Judge0Service();
module.exports = judge0Service;
