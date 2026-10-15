const bcrypt = require('bcryptjs');

const getHashedPassword = async (pwd) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pwd, salt);
};

const users = [
  {
    _id: '66f100000000000000000001',
    fullName: 'SkillTrack Administrator',
    email: 'admin@skilltrack.edu',
    password: 'AdminPassword123!',
    collegeName: 'SkillTrack Placement Academy',
    department: 'Computer Science & Engineering',
    yearOfStudy: 'Graduate',
    preferredLanguage: 'python',
    placementGoals: 'Platform Management & Student Mentorship',
    role: 'admin'
  },
  {
    _id: '66f100000000000000000002',
    fullName: 'Alex Morgan',
    email: 'student@skilltrack.edu',
    password: 'StudentPassword123!',
    collegeName: 'National Institute of Technology',
    department: 'Computer Science & Engineering',
    yearOfStudy: '3rd Year',
    preferredLanguage: 'python',
    placementGoals: 'Tier-1 Product Companies (Google, Microsoft, Amazon)',
    role: 'student'
  }
];

const studyMaterials = [
  {
    title: 'Time and Work — Concepts, LCM Method & Formulas',
    slug: 'time-and-work-concepts',
    category: 'aptitude',
    subject: 'Quantitative Aptitude',
    topic: 'Time and Work',
    difficulty: 'Intermediate',
    isAiGenerated: false,
    verifiedByAdmin: true,
    estimatedReadTimeMinutes: 12,
    content: {
      notes: 'Time and work problems deal with the rate at which work is performed by individuals or groups. The relationship is governed by: Work = Rate × Time. When rate is constant, work done is directly proportional to time spent.',
      formulas: [
        'If A completes work in n days, 1 day work of A = 1/n',
        'If A takes x days and B takes y days, combined time = (x * y) / (x + y) days',
        'Efficiency Ratio = Inverse of Time Ratio: If E1 : E2 = a : b, then T1 : T2 = b : a',
        'LCM Method: Assume Total Work = LCM(time taken by each individual). Calculate daily units of work.'
      ],
      syntax: '',
      samplePrograms: [],
      commonErrors: [
        {
          error: 'Directly adding days instead of work rates',
          explanation: 'If A takes 10 days and B takes 15 days, together they take (10*15)/(10+15) = 6 days, NOT (10+15)/2 = 12.5 days.',
          fix: 'Always add reciprocal rates (1/10 + 1/15 = 1/6) or use LCM units.'
        }
      ],
      solvedExamples: [
        {
          problem: 'A can finish a task in 12 days and B can finish it in 24 days. If they work together, in how many days will the task be completed?',
          stepByStepSolution: 'Step 1: Find LCM(12, 24) = 24 units of total work.\nStep 2: A efficiency = 24 / 12 = 2 units/day.\nStep 3: B efficiency = 24 / 24 = 1 unit/day.\nStep 4: Combined daily work = 2 + 1 = 3 units/day.\nStep 5: Total time = 24 / 3 = 8 days.',
          answer: '8 days'
        }
      ],
      practiceExercises: [
        'A can do a piece of work in 8 days, B in 10 days and C in 12 days. How long will all three take together?',
        'A and B together can do a piece of work in 12 days. B alone can do it in 30 days. In how many days can A alone do it?'
      ],
      interviewQuestions: [
        {
          question: 'How do you apply the LCM method to pipes and cisterns with a leak?',
          answer: 'Treat the leak as a negative rate of work. Subtract the leak units from the inlet filling units per minute.',
          explanation: 'Efficiency of leak = - (Total capacity / Emptying time).'
        }
      ]
    },
    quizzes: [
      {
        question: 'If A does a job in 20 days and B does the same job in 30 days, how long do they take together?',
        options: ['10 days', '12 days', '15 days', '25 days'],
        correctAnswer: 1,
        explanation: '(20 * 30) / (20 + 30) = 600 / 50 = 12 days.'
      }
    ],
    tags: ['Aptitude', 'Time and Work', 'LCM Method', 'Quantitative']
  },
  {
    title: 'Percentages & Profit and Loss Mastery',
    slug: 'percentages-profit-and-loss',
    category: 'aptitude',
    subject: 'Quantitative Aptitude',
    topic: 'Percentages and Profit & Loss',
    difficulty: 'Beginner',
    isAiGenerated: false,
    verifiedByAdmin: true,
    estimatedReadTimeMinutes: 10,
    content: {
      notes: 'Profit and loss calculations compare Cost Price (CP) and Selling Price (SP). Percentages represent fractions of 100 and form the building block for DI and commercial math.',
      formulas: [
        'Gain% = (Gain / CP) * 100',
        'Loss% = (Loss / CP) * 100',
        'SP = [(100 + Gain%) / 100] * CP',
        'Successive percentage change: a + b + (ab / 100)'
      ],
      syntax: '',
      samplePrograms: [],
      commonErrors: [
        {
          error: 'Calculating Profit% on Selling Price instead of Cost Price',
          explanation: 'By standard placement convention, profit and loss percentages are always calculated relative to Cost Price (CP) unless explicitly stated otherwise.',
          fix: 'Always use denominator as CP in profit percentage.'
        }
      ],
      solvedExamples: [
        {
          problem: 'An article is bought for $400 and sold for $500. What is the profit percentage?',
          stepByStepSolution: 'CP = 400, SP = 500\nProfit = 500 - 400 = 100\nProfit% = (100 / 400) * 100 = 25%',
          answer: '25%'
        }
      ],
      practiceExercises: [
        'A trader gives two successive discounts of 20% and 10%. Find the single equivalent discount.',
        'If the cost price of 12 pens is equal to the selling price of 8 pens, find the profit percent.'
      ],
      interviewQuestions: [
        {
          question: 'What is the quick formula for two successive discounts of d1% and d2%?',
          answer: 'Equivalent discount = d1 + d2 - (d1 * d2) / 100.',
          explanation: 'It accounts for the compounding reduction of the marked price.'
        }
      ]
    },
    quizzes: [
      {
        question: 'Two successive discounts of 20% and 10% are equivalent to a single discount of:',
        options: ['30%', '28%', '25%', '22%'],
        correctAnswer: 1,
        explanation: '20 + 10 - (200 / 100) = 30 - 2 = 28%.'
      }
    ],
    tags: ['Aptitude', 'Percentages', 'Profit and Loss']
  },
  {
    title: 'Data Structures: Binary Trees & Tree Traversals',
    slug: 'binary-trees-traversals',
    category: 'programming',
    subject: 'Data Structures and Algorithms',
    topic: 'Trees and Graphs',
    difficulty: 'Intermediate',
    isAiGenerated: false,
    verifiedByAdmin: true,
    estimatedReadTimeMinutes: 20,
    content: {
      notes: 'A Binary Tree is a hierarchical data structure in which each node has at most two children, referred to as the left child and the right child. Depth-First Search (DFS) yields Preorder, Inorder, and Postorder traversals.',
      formulas: [
        'Maximum nodes at level i = 2^i (level 0 is root)',
        'Maximum nodes in a binary tree of height h = 2^(h+1) - 1',
        'In a Binary Search Tree (BST), Inorder traversal yields elements in sorted ascending order.'
      ],
      syntax: 'class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right',
      samplePrograms: [
        {
          title: 'Inorder Traversal (Recursive)',
          language: 'python',
          code: 'def inorder(root):\n    res = []\n    def dfs(node):\n        if not node: return\n        dfs(node.left)\n        res.append(node.val)\n        dfs(node.right)\n    dfs(root)\n    return res\n\n# Example with root = [1, None, 2, 3]\nprint("Inorder traversal completed successfully")',
          expectedOutput: 'Inorder traversal completed successfully'
        }
      ],
      commonErrors: [
        {
          error: 'Missing base condition in tree recursion',
          explanation: 'Failing to check `if not node: return` leads to RecursionError / StackOverflowError.',
          fix: 'Always check if node is None/null before accessing children.'
        }
      ],
      solvedExamples: [
        {
          problem: 'Find the maximum depth of a binary tree given its root node.',
          stepByStepSolution: 'def maxDepth(root):\n    if not root: return 0\n    return 1 + max(maxDepth(root.left), maxDepth(root.right))',
          answer: 'Time: O(N), Space: O(Height)'
        }
      ],
      practiceExercises: [
        'Implement Level Order Traversal using a Queue (BFS).',
        'Validate whether a given binary tree satisfies the Binary Search Tree property.'
      ],
      interviewQuestions: [
        {
          question: 'Why does Inorder traversal of a BST produce sorted order?',
          answer: 'Because Inorder visits left subtree (all smaller values) then root node, then right subtree (all larger values).',
          explanation: 'By BST definition, left < root < right.'
        }
      ]
    },
    quizzes: [
      {
        question: 'Which traversal sequence of a BST yields keys in ascending sorted order?',
        options: ['Preorder', 'Inorder', 'Postorder', 'Level order'],
        correctAnswer: 1,
        explanation: 'Inorder traversal (Left, Root, Right) processes BST nodes in sorted order.'
      }
    ],
    tags: ['Programming', 'Binary Tree', 'DFS', 'Algorithms', 'Data Structures']
  },
  {
    title: 'Database Management Systems: SQL, Indexing & ACID Properties',
    slug: 'dbms-sql-indexing-acid',
    category: 'core_cs',
    subject: 'Core Computer Science',
    topic: 'Database Management Systems',
    difficulty: 'Intermediate',
    isAiGenerated: false,
    verifiedByAdmin: true,
    estimatedReadTimeMinutes: 18,
    content: {
      notes: 'DBMS is critical for campus placement technical interviews. Topics frequently tested include ACID properties, B-Tree indexes, Normalization (1NF, 2NF, 3NF, BCNF), and SQL Joins.',
      formulas: [
        'Atomicity: All operations in a transaction succeed or none do (Rollback).',
        'Consistency: Preserves database integrity constraints before and after transaction.',
        'Isolation: Concurrent transactions execute without cross-contamination (Locks / MVCC).',
        'Durability: Committed transactions persist even in case of power failure (Write-Ahead Logging).'
      ],
      syntax: 'SELECT e.emp_name, d.dept_name \nFROM employees e \nINNER JOIN departments d ON e.dept_id = d.id \nWHERE e.salary > 75000 \nORDER BY e.salary DESC;',
      samplePrograms: [
        {
          title: 'Find Second Highest Salary in SQL',
          language: 'sql',
          code: 'SELECT MAX(salary) AS SecondHighestSalary \nFROM employees \nWHERE salary < (SELECT MAX(salary) FROM employees);',
          expectedOutput: 'SecondHighestSalary: 95000'
        }
      ],
      commonErrors: [
        {
          error: 'Using WHERE clause with Aggregate functions (e.g. WHERE COUNT(*) > 5)',
          explanation: 'WHERE filters rows before aggregation. Aggregate results must be filtered with HAVING.',
          fix: 'Use GROUP BY ... HAVING COUNT(*) > 5.'
        }
      ],
      solvedExamples: [
        {
          problem: 'Explain 3rd Normal Form (3NF) simply for an interview.',
          stepByStepSolution: '1. Table must be in 2NF.\n2. No non-prime attribute should be transitively dependent on the primary key (X -> Y -> Z where X is primary key, Y is non-key).\n3. In simple terms: Every attribute must depend on the key, the whole key, and nothing but the key.',
          answer: 'Eliminates transitive dependencies.'
        }
      ],
      practiceExercises: [
        'Write an SQL query to delete duplicate rows from a table while keeping one copy.',
        'Explain Clustered vs Non-Clustered index with an analogy.'
      ],
      interviewQuestions: [
        {
          question: 'What is the difference between TRUNCATE, DROP, and DELETE?',
          answer: 'DELETE is DML (can have WHERE, can be rolled back). TRUNCATE is DDL (resets identity, deallocates pages, faster). DROP removes data and schema permanently.',
          explanation: 'Interviewers look for understanding of DDL vs DML and transaction log overhead.'
        }
      ]
    },
    quizzes: [
      {
        question: 'Which SQL clause is used to filter results after an aggregation has been computed?',
        options: ['WHERE', 'HAVING', 'FILTER BY', 'GROUP FILTER'],
        correctAnswer: 1,
        explanation: 'HAVING filters aggregated groups, whereas WHERE filters individual rows before grouping.'
      }
    ],
    tags: ['Core CS', 'DBMS', 'SQL', 'ACID', 'Normalization']
  },
  {
    title: 'Operating Systems: Processes, Threads & CPU Scheduling',
    slug: 'os-processes-threads-scheduling',
    category: 'core_cs',
    subject: 'Core Computer Science',
    topic: 'Operating Systems',
    difficulty: 'Intermediate',
    isAiGenerated: false,
    verifiedByAdmin: true,
    estimatedReadTimeMinutes: 15,
    content: {
      notes: 'An Operating System acts as an intermediary between user applications and hardware. Core placement interview questions revolve around Process Management, Scheduling algorithms (FCFS, SJF, Round Robin), Deadlocks, and Virtual Memory Paging.',
      formulas: [
        'Turnaround Time (TAT) = Completion Time - Arrival Time',
        'Waiting Time (WT) = Turnaround Time - Burst Time',
        'Response Time = First CPU Allocation Time - Arrival Time'
      ],
      syntax: '',
      samplePrograms: [],
      commonErrors: [
        {
          error: 'Confusing Process with Thread memory sharing',
          explanation: 'Processes do NOT share memory by default (they require IPC). Threads of the same process share code, data, and heap segments, but maintain separate stacks and registers.',
          fix: 'Remember: Threads share heap and data; Processes are fully isolated address spaces.'
        }
      ],
      solvedExamples: [
        {
          problem: 'What are the 4 Coffman conditions required for a Deadlock to occur?',
          stepByStepSolution: '1. Mutual Exclusion: Resources cannot be shared simultaneously.\n2. Hold and Wait: Process holding resources can request new ones.\n3. No Preemption: Resources cannot be forcibly taken from a process.\n4. Circular Wait: A closed chain of processes each waiting for a resource held by the next.',
          answer: 'Deadlock can be prevented by breaking at least one of these 4 conditions.'
        }
      ],
      practiceExercises: [
        'Calculate average waiting time for Round Robin scheduling with time quantum = 2ms for 3 given processes.',
        'Explain Belady\'s Anomaly in FIFO page replacement.'
      ],
      interviewQuestions: [
        {
          question: 'What is a Zombie Process vs an Orphan Process?',
          answer: 'A Zombie process has finished execution but still has an entry in the process table because its parent has not read its exit status via wait(). An Orphan process has a parent that terminated before it; the init/systemd process adopts it.',
          explanation: 'A classic OS question asked in technical placement interviews.'
        }
      ]
    },
    quizzes: [
      {
        question: 'Which of the following conditions is NOT one of the 4 Coffman conditions for deadlock?',
        options: ['Mutual Exclusion', 'Preemption allowed', 'Hold and Wait', 'Circular Wait'],
        correctAnswer: 1,
        explanation: 'No Preemption is the necessary condition. If preemption is allowed, deadlock cannot occur.'
      }
    ],
    tags: ['Core CS', 'Operating Systems', 'CPU Scheduling', 'Deadlocks']
  }
];

const codingQuestions = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Beginner',
    category: 'Arrays & Hashing',
    topicTags: ['Arrays', 'Hash Table', 'Two-Pointer'],
    description: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    inputFormat: 'First line contains space-separated integers for nums. Second line contains the target integer.',
    outputFormat: 'Print the two indices separated by a space.',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    sampleTestCases: [
      {
        input: '2 7 11 15\n9',
        expectedOutput: '0 1',
        explanation: 'nums[0] + nums[1] = 2 + 7 = 9, so indices are 0 and 1.'
      },
      {
        input: '3 2 4\n6',
        expectedOutput: '1 2',
        explanation: 'nums[1] + nums[2] = 2 + 4 = 6, so indices are 1 and 2.'
      }
    ],
    hiddenTestCases: [
      {
        input: '3 3\n6',
        expectedOutput: '0 1'
      },
      {
        input: '1 5 8 12 14\n20',
        expectedOutput: '2 3'
      }
    ],
    starterCode: {
      python: `import sys

def solve():
    lines = sys.stdin.read().strip().split('\\n')
    if not lines or len(lines) < 2: return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1].strip())
    
    # Write your solution here
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            return
        seen[num] = i

solve()`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (input.length < 2) return;
    const nums = input[0].trim().split(/\\s+/).map(Number);
    const target = Number(input[1].trim());

    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (seen.has(diff)) {
            console.log(seen.get(diff) + ' ' + i);
            return;
        }
        seen.set(nums[i], i);
    }
}

solve();`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    // Read input and solve Two Sum
    return 0;
}`,
      c: `#include <stdio.h>

int main() {
    // C solution for Two Sum
    return 0;
}`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\\\s+");
        int target = sc.nextInt();
        // Two sum solution
    }
}`
    },
    hints: [
      'Can you use a hash map to check whether the complement (target - num) exists in O(1) time?',
      'Store each number alongside its index as you iterate.'
    ],
    editorial: 'Using a Hash Map gives optimal O(N) time and O(N) space complexity.',
    timeLimitSeconds: 2,
    memoryLimitMB: 128,
    totalSubmissions: 34,
    totalAccepted: 28
  },
  {
    title: 'Palindrome String Check',
    slug: 'palindrome-string-check',
    difficulty: 'Beginner',
    category: 'Strings',
    topicTags: ['Strings', 'Two-Pointer'],
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return "true" if it is a palindrome, or "false" otherwise.',
    inputFormat: 'A single string on one line.',
    outputFormat: 'Print "true" or "false".',
    constraints: '1 <= s.length <= 2 * 10^5',
    sampleTestCases: [
      {
        input: 'racecar',
        expectedOutput: 'true',
        explanation: 'racecar reads the same forward and backwards.'
      },
      {
        input: 'hello',
        expectedOutput: 'false',
        explanation: 'hello is not a palindrome.'
      }
    ],
    hiddenTestCases: [
      {
        input: 'madam',
        expectedOutput: 'true'
      },
      {
        input: 'skilltrack',
        expectedOutput: 'false'
      }
    ],
    starterCode: {
      python: `import sys

def is_palindrome():
    s = sys.stdin.read().strip().lower()
    clean = ''.join(c for c in s if c.isalnum())
    if clean == clean[::-1]:
        print("true")
    else:
        print("false")

is_palindrome()`,
      javascript: `const fs = require('fs');

function check() {
    const s = fs.readFileSync(0, 'utf-8').trim().toLowerCase();
    const clean = s.replace(/[^a-z0-9]/g, '');
    const rev = clean.split('').reverse().join('');
    console.log(clean === rev ? 'true' : 'false');
}

check();`
    },
    hints: ['Remove non-alphanumerics and compare characters from front and back using two pointers.'],
    editorial: 'Two pointers from both ends achieve O(N) time and O(1) space.',
    timeLimitSeconds: 2,
    memoryLimitMB: 128,
    totalSubmissions: 45,
    totalAccepted: 39
  },
  {
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Intermediate',
    category: 'Algorithms',
    topicTags: ['Searching', 'Arrays', 'Divide and Conquer'],
    description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.',
    inputFormat: 'Line 1: space separated sorted integers. Line 2: target integer.',
    outputFormat: 'Print the zero-based index or -1.',
    constraints: '1 <= nums.length <= 10^5\nAll integers in nums are unique and sorted.',
    sampleTestCases: [
      {
        input: '-1 0 3 5 9 12\n9',
        expectedOutput: '4',
        explanation: '9 exists in nums and its index is 4'
      },
      {
        input: '-1 0 3 5 9 12\n2',
        expectedOutput: '-1',
        explanation: '2 does not exist in nums so return -1'
      }
    ],
    hiddenTestCases: [
      {
        input: '5\n5',
        expectedOutput: '0'
      },
      {
        input: '1 2 3 4 5 6 7 8 9 10\n10',
        expectedOutput: '9'
      }
    ],
    starterCode: {
      python: `import sys

def binary_search():
    lines = sys.stdin.read().strip().split('\\n')
    if not lines or len(lines) < 2: return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1].strip())
    
    left, right = 0, len(nums) - 1
    ans = -1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            ans = mid
            break
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    print(ans)

binary_search()`,
      javascript: `const fs = require('fs');

function solve() {
    const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (lines.length < 2) return;
    const nums = lines[0].trim().split(/\\s+/).map(Number);
    const target = Number(lines[1].trim());

    let left = 0, right = nums.length - 1;
    let ans = -1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) {
            ans = mid;
            break;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    console.log(ans);
}

solve();`
    },
    hints: ['Calculate mid = left + (right - left) // 2 to avoid integer overflow.'],
    editorial: 'Classic Binary Search runs in O(log N) time and O(1) space.',
    timeLimitSeconds: 2,
    memoryLimitMB: 128,
    totalSubmissions: 28,
    totalAccepted: 22
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Advanced',
    category: 'Strings & Sliding Window',
    topicTags: ['Sliding Window', 'Hash Table', 'Strings'],
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    inputFormat: 'A single string on one line.',
    outputFormat: 'Print the length of the longest substring as an integer.',
    constraints: '0 <= s.length <= 5 * 10^4',
    sampleTestCases: [
      {
        input: 'abcabcbb',
        expectedOutput: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 'bbbbb',
        expectedOutput: '1',
        explanation: 'The answer is "b", with the length of 1.'
      }
    ],
    hiddenTestCases: [
      {
        input: 'pwwkew',
        expectedOutput: '3'
      },
      {
        input: 'au',
        expectedOutput: '2'
      }
    ],
    starterCode: {
      python: `import sys

def lengthOfLongestSubstring():
    s = sys.stdin.read().rstrip('\\r\\n')
    char_map = {}
    left = 0
    max_len = 0
    
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
        
    print(max_len)

lengthOfLongestSubstring()`,
      javascript: `const fs = require('fs');

function solve() {
    const s = fs.readFileSync(0, 'utf-8').replace(/[\\r\\n]/g, '');
    const charMap = new Map();
    let left = 0;
    let maxLen = 0;

    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        if (charMap.has(char) && charMap.get(char) >= left) {
            left = charMap.get(char) + 1;
        }
        charMap.set(char, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }

    console.log(maxLen);
}

solve();`
    },
    hints: ['Use sliding window with two pointers `left` and `right`.', 'Store the last seen index of each character.'],
    editorial: 'Sliding window with hash map achieves O(N) time and O(min(m, n)) space.',
    timeLimitSeconds: 2,
    memoryLimitMB: 128,
    totalSubmissions: 19,
    totalAccepted: 14
  }
];

const aptitudeQuestions = [
  {
    subject: 'Quantitative Aptitude',
    topic: 'Time and Work',
    difficulty: 'Beginner',
    questionText: 'A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:',
    options: [
      { id: 0, text: '7/15' },
      { id: 1, text: '8/15' },
      { id: 2, text: '1/10' },
      { id: 3, text: '3/10' }
    ],
    correctOptionId: 1,
    explanation: 'A 1 day work = 1/15; B 1 day work = 1/20. Together in 1 day = (1/15 + 1/20) = 7/60. In 4 days = 4 * 7/60 = 7/15. Fraction of work left = 1 - 7/15 = 8/15.',
    formulaUsed: 'Work Left = 1 - (Combined Rate * Time)'
  },
  {
    subject: 'Quantitative Aptitude',
    topic: 'Percentages',
    difficulty: 'Beginner',
    questionText: 'If 20% of a = b, then b% of 20 is the same as:',
    options: [
      { id: 0, text: '4% of a' },
      { id: 1, text: '5% of a' },
      { id: 2, text: '20% of a' },
      { id: 3, text: 'None of these' }
    ],
    correctOptionId: 0,
    explanation: '20% of a = b => b = 0.2a. Then b% of 20 = (b/100) * 20 = (0.2a / 100) * 20 = 0.04a = 4% of a.',
    formulaUsed: 'Percentage Symmetry Property'
  },
  {
    subject: 'Logical Reasoning',
    topic: 'Blood Relations',
    difficulty: 'Intermediate',
    questionText: 'Pointing to a photograph of a boy Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
    options: [
      { id: 0, text: 'Brother' },
      { id: 1, text: 'Uncle' },
      { id: 2, text: 'Cousin' },
      { id: 3, text: 'Father' }
    ],
    correctOptionId: 3,
    explanation: 'The only son of Suresh\'s mother is Suresh himself. Therefore, the boy in the photograph is the son of Suresh, so Suresh is the father.',
    formulaUsed: 'Deductive Reasoning'
  },
  {
    subject: 'Logical Reasoning',
    topic: 'Coding-Decoding',
    difficulty: 'Beginner',
    questionText: 'In a certain code language, "COMPUTER" is written as "RFUVQNPC". How will "MEDICINE" be written in that code?',
    options: [
      { id: 0, text: 'EOJDJEFM' },
      { id: 1, text: 'EOJDEJFM' },
      { id: 2, text: 'MFEJDJOE' },
      { id: 3, text: 'EOJDJEFN' }
    ],
    correctOptionId: 0,
    explanation: 'The reverse order of letters is taken with +1 shift for intermediate letters and the first and last letters swapped: MEDICINE -> E (D+1=O) (I+1=J) (C+1=D) (I+1=J) (D+1=E) (E+1=F) M -> EOJDJEFM.',
    formulaUsed: 'Reverse Substitution with +1 offset'
  },
  {
    subject: 'Verbal Ability',
    topic: 'Sentence Correction',
    difficulty: 'Beginner',
    questionText: 'Choose the grammatically correct sentence:',
    options: [
      { id: 0, text: 'Neither the manager nor the employees was present.' },
      { id: 1, text: 'Neither the manager nor the employees were present.' },
      { id: 2, text: 'Neither the manager or the employees was present.' },
      { id: 3, text: 'Neither of the employees were not present.' }
    ],
    correctOptionId: 1,
    explanation: 'When two subjects are joined by "neither...nor", the verb agrees with the subject closest to it. "Employees" is plural, so "were" is correct.',
    formulaUsed: 'Subject-Verb Proximity Rule'
  }
];

const mockTests = [
  {
    title: 'TCS NQT & Infosys Diagnostic Placement Assessment',
    description: 'Comprehensive 45-minute timed mock test covering Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Core CS. Identifies your current placement readiness score.',
    category: 'Mixed Placement Assessment',
    durationMinutes: 45,
    totalMarks: 30,
    passingMarks: 18,
    questionCount: 5,
    mode: 'assessment',
    questions: [
      {
        questionText: 'A can finish a task in 15 days and B in 20 days. Working together for 4 days, what fraction of work remains?',
        options: [
          { id: 0, text: '7/15' },
          { id: 1, text: '8/15' },
          { id: 2, text: '1/10' },
          { id: 3, text: '3/10' }
        ],
        correctOptionId: 1,
        marks: 2,
        negativeMarks: 0.5,
        section: 'Quantitative Aptitude',
        explanation: 'Work done in 4 days is 7/15. Fraction remaining = 1 - 7/15 = 8/15.'
      },
      {
        questionText: 'If 20% of A = B, then B% of 20 is equal to:',
        options: [
          { id: 0, text: '4% of A' },
          { id: 1, text: '5% of A' },
          { id: 2, text: '20% of A' },
          { id: 3, text: 'None of these' }
        ],
        correctOptionId: 0,
        marks: 2,
        negativeMarks: 0.5,
        section: 'Quantitative Aptitude',
        explanation: '(B/100)*20 = (0.2A/100)*20 = 0.04A = 4% of A.'
      },
      {
        questionText: 'Pointing to a photograph, Suresh said: "He is the son of the only son of my mother." Who is he to Suresh?',
        options: [
          { id: 0, text: 'Brother' },
          { id: 1, text: 'Uncle' },
          { id: 2, text: 'Cousin' },
          { id: 3, text: 'Father' }
        ],
        correctOptionId: 3,
        marks: 2,
        negativeMarks: 0.5,
        section: 'Logical Reasoning',
        explanation: 'Only son of mother is Suresh himself. Boy is his son. Suresh is the father.'
      },
      {
        questionText: 'In DBMS, which ACID property ensures that uncommitted transactions do not interfere with each other?',
        options: [
          { id: 0, text: 'Atomicity' },
          { id: 1, text: 'Consistency' },
          { id: 2, text: 'Isolation' },
          { id: 3, text: 'Durability' }
        ],
        correctOptionId: 2,
        marks: 2,
        negativeMarks: 0.5,
        section: 'Core Computer Science',
        explanation: 'Isolation ensures concurrent transactions execute independently.'
      },
      {
        questionText: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black)?',
        options: [
          { id: 0, text: 'O(1)' },
          { id: 1, text: 'O(log N)' },
          { id: 2, text: 'O(N)' },
          { id: 3, text: 'O(N log N)' }
        ],
        correctOptionId: 1,
        marks: 2,
        negativeMarks: 0.5,
        section: 'Programming & DSA',
        explanation: 'A balanced BST maintains height = O(log N), so search is O(log N).'
      }
    ],
    isPublished: true
  },
  {
    title: 'Core Computer Science Technical Mock Test',
    description: '30-minute test evaluating DBMS SQL Joins, OS Threading, Memory Paging, and Computer Networks.',
    category: 'Core Computer Science',
    durationMinutes: 30,
    totalMarks: 20,
    passingMarks: 12,
    questionCount: 4,
    mode: 'assessment',
    questions: [
      {
        questionText: 'Which SQL keyword is used to filter rows BEFORE grouping is applied?',
        options: [
          { id: 0, text: 'HAVING' },
          { id: 1, text: 'WHERE' },
          { id: 2, text: 'ORDER BY' },
          { id: 3, text: 'FILTER' }
        ],
        correctOptionId: 1,
        marks: 1,
        negativeMarks: 0.25,
        section: 'DBMS',
        explanation: 'WHERE filters rows before grouping; HAVING filters groups after aggregation.'
      },
      {
        questionText: 'Which OS scheduling algorithm is completely free from starvation?',
        options: [
          { id: 0, text: 'Shortest Job First' },
          { id: 1, text: 'Priority Scheduling' },
          { id: 2, text: 'Round Robin' },
          { id: 3, text: 'Multilevel Queue' }
        ],
        correctOptionId: 2,
        marks: 1,
        negativeMarks: 0.25,
        section: 'Operating Systems',
        explanation: 'Round Robin allocates a fixed time slice to every process cyclically, preventing starvation.'
      }
    ],
    isPublished: true
  }
];

module.exports = {
  users,
  studyMaterials,
  codingQuestions,
  aptitudeQuestions,
  mockTests,
  getHashedPassword
};
