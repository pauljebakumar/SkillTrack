const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 AI queries per minute per user/IP
  message: {
    success: false,
    message: 'AI request limit reached. Please wait a minute before sending another AI query.'
  }
});

const codeExecutionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 code executions per minute
  message: {
    success: false,
    message: 'Code execution limit reached. Please wait a minute before submitting again.'
  }
});

module.exports = { apiLimiter, aiLimiter, codeExecutionLimiter };
