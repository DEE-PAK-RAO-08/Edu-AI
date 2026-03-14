const https = require('https');

function checkEmbeddable(id) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

function searchYouTube(query) {
  return new Promise((resolve) => {
    const url = `https://html.duckduckgo.com/html/?q=site:youtube.com+${encodeURIComponent(query)}`;
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', async () => {
        const regex = /v=([a-zA-Z0-9_-]{11})/g;
        const matches = [...body.matchAll(regex)].map(m => m[1]);
        const uniqueMatches = [...new Set(matches)];
        
        for (const id of uniqueMatches) {
          if (await checkEmbeddable(id)) {
            return resolve(id);
          }
        }
        resolve(null);
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  const topics = [
    'khan academy algebra introduction', 
    'khan academy geometry introduction', 
    'khan academy trigonometry introduction', 
    'khan academy kinematics', 
    'khan academy newtons laws of motion dynamics', 
    'khan academy thermodynamics', 
    'khan academy gravity astrophysics', 
    'freecodecamp data structures', 
    'freecodecamp algorithms', 
    'freecodecamp databases', 
    'freecodecamp networking', 
    'khan academy ancient egypt', 
    'khan academy world war 2', 
    'khan academy plate tectonics', 
    'khan academy climate change'
  ];
  for (const t of topics) {
    const id = await searchYouTube(t);
    console.log(`${t}: ${id}`);
  }
}
run();
