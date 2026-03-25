const axios = require('axios');

const NODES = [
  'https://piston.engineer-man.ninja/api/v2/execute',
  'https://piston.sh/api/v2/execute',
  'https://api.piston.sh/api/v2/execute',
  'https://emkc.org/api/v2/piston/execute' // Should fail without token
];

async function test() {
  for (const node of NODES) {
    console.log(`Testing Node: ${node}...`);
    try {
      const res = await axios.post(node, {
        language: 'javascript',
        version: '18.15.0',
        files: [{ content: 'console.log("OK")' }]
      }, { timeout: 8000 });
      console.log(`✅ SUCCESS: ${node}`);
      console.log('Result:', res.data.run.stdout);
    } catch (err) {
      console.log(`❌ FAILED : ${node} (${err.response?.status || err.message})`);
    }
  }
}

test();
