const axios = require('axios');
const fs = require('fs');

async function list() {
  try {
    const res = await axios.get('https://piston.sh/api/v2/runtimes');
    fs.writeFileSync('runtimes.json', JSON.stringify(res.data, null, 2));
    console.log('Saved runtimes.json');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

list();
