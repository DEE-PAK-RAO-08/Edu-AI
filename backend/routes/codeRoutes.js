const express = require('express');
const router = express.Router();
const axios = require('axios');
const { auth } = require('../middleware/authMiddleware');

const JUDGE0_URL = 'https://ce.judge0.com/submissions?base64_encoded=false&wait=true';

// Mapping for Judge0 IDs
const JUDGE0_LANG_MAP = {
  'c': 50,      // GCC 10.2.0
  'cpp': 54,    // GCC 10.2.0
  'c++': 54,    // GCC 10.2.0
  'java': 62    // OpenJDK 13.0.1
};

const PISTON_NODES = [
  'https://piston.sh/api/v2/execute',
  'https://piston.engineer-man.ninja/api/v2/execute'
];

/**
 * @route   POST api/code/execute
 * @desc    Proxy code execution to Judge0 (Primary for compiled) or Piston (Fallback)
 * @access  Public
 */
router.post('/execute', async (req, res) => {
  const { language, version, files } = req.body;
  const code = files && files[0] ? files[0].content : '';

  if (!language || !files) {
    return res.status(400).json({ message: 'Language and files are required' });
  }

  // 1. Try Judge0 first (Modern & Open) if it's a compiled language we support
  const judge0Id = JUDGE0_LANG_MAP[language];
  if (judge0Id) {
    try {
      console.log(`📡 CodeProxy: Trying Judge0 for ${language}...`);
      const response = await axios.post(JUDGE0_URL, {
        source_code: code,
        language_id: judge0Id,
        stdin: ''
      }, { timeout: 15000 });

      if (response.data) {
        console.log(`✅ CodeProxy: Success from Judge0`);
        const { stdout, stderr, compile_output, message, status } = response.data;
        return res.json({
          run: {
            stdout: stdout || '',
            stderr: stderr || compile_output || message || '',
            output: stdout || '',
            code: status?.id === 3 ? 0 : 1
          }
        });
      }
    } catch (err) {
      console.warn(`⚠️ CodeProxy: Judge0 Failed - ${err.message}`);
    }
  }

  // 2. Fallback to Piston Nodes
  for (const node of PISTON_NODES) {
    try {
      console.log(`📡 CodeProxy: Trying Piston node ${node} for ${language}...`);
      const response = await axios.post(node, {
        language,
        version: '*',
        files
      }, { timeout: 10000 });

      if (response.data && response.data.run) {
        console.log(`✅ CodeProxy: Success from ${node}`);
        return res.json(response.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.warn(`❌ CodeProxy: Piston Node Failed: ${node} - ${errorMsg}`);
    }
  }

  res.status(502).json({ 
    message: 'The code execution engine is currently under maintenance. Please try again in a few minutes.'
  });
});

module.exports = router;
