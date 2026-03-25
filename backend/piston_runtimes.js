const axios = require('axios');

const NODES = [
  'https://piston.engineer-man.ninja/api/v2/runtimes',
  'https://piston.sh/api/v2/runtimes',
  'https://api.piston.sh/api/v2/runtimes'
];

async function test() {
  for (const node of NODES) {
    console.log(`Fetching Runtimes from: ${node}...`);
    try {
      const res = await axios.get(node, { timeout: 8000 });
      console.log(`✅ SUCCESS: ${node}`);
      // Print first 5 runtimes
      console.log(JSON.stringify(res.data.slice(0, 5), null, 2));
    } catch (err) {
      console.log(`❌ FAILED : ${node} (${err.message})`);
    }
  }
}

test();
