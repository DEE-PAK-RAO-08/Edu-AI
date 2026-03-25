const { getTestQuestions } = require('./data/questionBank');
const q = getTestQuestions('mathematics', 8);
console.log('Mathematics Questions:', q.length);
if (q.length > 0) console.log('First Q Topic:', q[0].topic);

const q2 = getTestQuestions('physics', 10);
console.log('Physics Questions:', q2.length);

const q3 = getTestQuestions('non-existent', 12);
console.log('Non-existent Questions:', q3.length);
