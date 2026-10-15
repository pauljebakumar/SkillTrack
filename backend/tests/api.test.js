const assert = require('assert');
const bcrypt = require('bcryptjs');
const judge0Service = require('../services/judge0Service');
const skillAnalysisEngine = require('../services/skillAnalysisEngine');
const aiService = require('../services/aiService');
const memoryStore = require('../config/memoryStore');
const seedAll = require('../seed/seeder');

async function runTests() {
  console.log('--- STARTING SKILLTRACK AUTOMATED TESTS ---');

  // Test 1: Seeding
  console.log('\n[Test 1] Testing Database Seeder...');
  await seedAll();
  const users = memoryStore.getCollection('users');
  assert.ok(users.length >= 2, 'Expected at least 2 seeded users');
  const adminUser = users.find(u => u.role === 'admin');
  assert.ok(adminUser, 'Admin user should exist');
  console.log('✓ Seeding passed. Users in store:', users.length);

  // Test 2: Authentication & Password Verification
  console.log('\n[Test 2] Testing Password Hashing & Verification...');
  const isStudentPass = await bcrypt.compare('StudentPassword123!', users.find(u => u.email === 'student@skilltrack.edu').password);
  assert.strictEqual(isStudentPass, true, 'Student password should match');
  console.log('✓ Password hashing and verification passed');

  // Test 3: Sandbox Code Execution (JavaScript)
  console.log('\n[Test 3] Testing Sandbox Code Execution (Node.js/JS)...');
  const jsCode = `
    const fs = require('fs');
    const input = fs.readFileSync(0, 'utf-8').trim();
    const [a, b] = input.split(' ').map(Number);
    console.log(a + b);
  `;
  const jsExec = await judge0Service.executeCode({
    code: jsCode,
    language: 'javascript',
    stdin: '14 28',
    expectedOutput: '42'
  });
  console.log('JS Execution result status:', jsExec.status, '| output:', jsExec.stdout);
  assert.strictEqual(jsExec.status, 'Accepted', 'Sum of 14 and 28 should equal 42');
  console.log('✓ Sandboxed JavaScript execution passed');

  // Test 4: Sandbox Code Execution (Python)
  console.log('\n[Test 4] Testing Sandbox Code Execution (Python)...');
  const pyCode = `
import sys
data = sys.stdin.read().strip().split()
if len(data) >= 2:
    print(int(data[0]) * int(data[1]))
`;
  const pyExec = await judge0Service.executeCode({
    code: pyCode,
    language: 'python',
    stdin: '6 7',
    expectedOutput: '42'
  });
  console.log('Python Execution result status:', pyExec.status, '| output:', pyExec.stdout);
  assert.strictEqual(pyExec.status, 'Accepted', '6 * 7 should equal 42');
  console.log('✓ Sandboxed Python execution passed');

  // Test 5: AI Placement Coach Engine
  console.log('\n[Test 5] Testing AI Placement Coach Engine...');
  const aiCoachRes = await aiService.generateResponse({
    mode: 'coding_assistant',
    prompt: 'Explain time complexity of binary search',
    context: { problemTitle: 'Binary Search' }
  });
  assert.ok(aiCoachRes.success, 'AI should respond successfully');
  assert.ok(aiCoachRes.text.length > 50, 'AI response should be substantive');
  console.log('✓ AI Placement Coach generated response length:', aiCoachRes.text.length);

  // Test 6: Skill Analysis Engine
  console.log('\n[Test 6] Testing Personalized Skill Analysis Engine...');
  const student = users.find(u => u.email === 'student@skilltrack.edu');
  const analysis = await skillAnalysisEngine.calculateForUser(student._id);
  assert.ok(analysis.skillScores.length > 0, 'Skill scores must be generated');
  assert.ok(analysis.strongSkills.length > 0, 'Strong skills must be identified');
  assert.ok(analysis.recommendations.length > 0, 'Recommendations must be provided');
  console.log('✓ Skill Analysis computed readiness score:', analysis.overallScore, '%');
  console.log('  Strong skills:', analysis.strongSkills);
  console.log('  Recommendations count:', analysis.recommendations.length);

  console.log('\n=========================================');
  console.log('ALL BACKEND INTEGRATION TESTS PASSED 100%!');
  console.log('=========================================\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
