const fs = require('fs');

const subjects = {
  mathematics: ['algebra', 'geometry', 'calculus', 'trigonometry', 'statistics', 'probability', 'arithmetic', 'fractions', 'decimals', 'percentages', 'ratios', 'proportions', 'logarithms', 'matrices', 'vectors', 'complex-numbers', 'set-theory', 'logic', 'combinatorics', 'graph-theory', 'topology', 'number-theory', 'diff-eq', 'linear-prog', 'game-theory', 'cryptography', 'boolean', 'functions', 'polynomials', 'limits'],
  physics: ['kinematics', 'dynamics', 'thermodynamics', 'astrophysics', 'optics', 'electromagnetism', 'quantum', 'relativity', 'mechanics', 'acoustics', 'fluid', 'nuclear', 'plasma', 'solid-state', 'particle', 'atomic', 'molecular', 'biophysics', 'geophysics', 'atmospheric', 'string-theory', 'statistical', 'classical', 'modern', 'waves', 'electricity', 'magnetism', 'circuits', 'relativity-special', 'gravitation'],
  "computer-science": ['data-structures', 'algorithms', 'databases', 'networking', 'os', 'architecture', 'compilers', 'pl', 'se', 'ai', 'ml', 'dl', 'cv', 'nlp', 'graphics', 'hci', 'security', 'crypto', 'distributed', 'cloud', 'web', 'mobile', 'iot', 'robotics', 'quantum-comp', 'bioinformatics', 'theoretical', 'automata', 'complexity', 'data-science'],
  chemistry: ['organic', 'inorganic', 'physical', 'analytical', 'biochemistry', 'polymer', 'environmental', 'industrial', 'nuclear', 'materials', 'theoretical', 'computational', 'thermo', 'electro', 'kinetics', 'quantum-chem', 'spectroscopy', 'chromatography', 'lab', 'safety', 'periodic', 'bonding', 'states', 'stoicho', 'acids', 'bases', 'redox', 'equilibrium', 'crystals', 'polymers'],
  moralscience: ['ethics', 'values', 'empathy', 'honesty', 'integrity', 'respect', 'responsibility', 'fairness', 'citizenship', 'courage', 'compassion', 'discipline', 'gratitude', 'forgiveness', 'humility', 'tolerance', 'peace', 'justice', 'loyalty', 'perseverance', 'self-control', 'cooperation', 'charity', 'kindness', 'sharing', 'moderation', 'truth', 'wisdom', 'patience', 'modesty'],
  english: ['grammar', 'syntax', 'vocabulary', 'reading', 'writing', 'listening', 'speaking', 'phonics', 'essays', 'poetry', 'drama', 'prose', 'literature', 'idioms', 'proverbs', 'spelling', 'punctuation', 'composition', 'comprehension', 'analysis', 'rhetoric', 'debate', 'journalism', 'linguistics', 'semantics', 'pragmatics', 'history', 'dialects', 'styles', 'editing'],
  tamil: ['grammar-ilakkanam', 'literature', 'poetry', 'prose', 'sangam', 'thirukkural', 'epics', 'modern', 'semantics', 'syntax', 'vocabulary', 'writing', 'reading', 'speaking', 'listening', 'idioms', 'proverbs', 'history-tamil', 'dialects', 'translation', 'essay', 'letter', 'journalism', 'drama', 'linguistics', 'phonetics', 'inscriptions', 'authors', 'novels', 'short-stories']
};

const defaultVideos = {
  mathematics: "https://www.youtube.com/embed/LwCRRUa8yTU",
  physics: "https://www.youtube.com/embed/mLeNaZcy-hE",
  "computer-science": "https://www.youtube.com/embed/rVdBpWzZ-28",
  chemistry: "https://www.youtube.com/embed/Rd4a1X3B61w",
  moralscience: "https://www.youtube.com/embed/3_t4oboX2Jg",
  english: "https://www.youtube.com/embed/8Gv0H-vPoDc",
  tamil: "https://www.youtube.com/embed/A15wA48V6c0"
};

const customVideoMap = {
  'mathematics-algebra': 'https://www.youtube.com/embed/LwCRRUa8yTU',
  'mathematics-geometry': 'https://www.youtube.com/embed/mLeNaZcy-hE',
  'mathematics-trigonometry': 'https://www.youtube.com/embed/g8VCHoSk5_o',
  'physics-kinematics': 'https://www.youtube.com/embed/ZM8ECpBuQYE',
  'physics-dynamics': 'https://www.youtube.com/embed/kKKM8Y-u7ds',
  'physics-thermodynamics': 'https://www.youtube.com/embed/8N1BxHgsoOw',
  'physics-astrophysics': 'https://www.youtube.com/embed/TCrRs_OBN0E?si=Git5gkY3TzZnEFX_',
  'computer-science-algorithms': 'https://www.youtube.com/embed/rVdBpWzZ-28',
  'computer-science-databases': 'https://www.youtube.com/embed/HXV3zeJZ1EQ',
  'computer-science-networking': 'https://www.youtube.com/embed/QiQRjzcgAQI'
};

function capitalize(str) {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

let code = `const courses = {\n`;

Object.keys(subjects).forEach((sub, subIdx) => {
  code += `  "${sub}": {\n`;
  subjects[sub].forEach((topic, idx) => {
    let videoUrl = customVideoMap[`${sub}-${topic}`] || defaultVideos[sub];
    let isLast = idx === subjects[sub].length - 1;
    code += `    "${topic}": {
      title: "${capitalize(topic)} Overview",
      videoUrl: "${videoUrl}",
      notes: "This is a comprehensive overview of ${capitalize(topic)} in the field of ${capitalize(sub)}. In this lesson, you will learn the fundamental concepts, history, and applications of this subject.",
      practiceSum: "What is the primary focus of ${capitalize(topic).toLowerCase()}?",
      practiceOptions: ["Understanding core principles of ${capitalize(topic)}", "Memorizing random facts", "Skipping the basics", "None of the above"],
      practiceAnswer: "Understanding core principles of ${capitalize(topic)}"
    }${isLast ? '' : ','}\n`;
  });
  code += `  }${subIdx === Object.keys(subjects).length - 1 ? '' : ','}\n`;
});

code += `};\n\nmodule.exports = courses;\n`;

fs.writeFileSync('data/courseContent.js', code);
console.log('courseContent.js generated successfully!');
