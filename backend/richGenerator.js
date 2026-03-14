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

const videos = {
  mathematics: "https://www.youtube.com/embed/LwCRRUa8yTU",
  physics: "https://www.youtube.com/embed/mLeNaZcy-hE",
  "computer-science": "https://www.youtube.com/embed/rVdBpWzZ-28",
  chemistry: "https://www.youtube.com/embed/Rd4a1X3B61w",
  moralscience: "https://www.youtube.com/embed/3_t4oboX2Jg",
  english: "https://www.youtube.com/embed/8Gv0H-vPoDc",
  tamil: "https://www.youtube.com/embed/A15wA48V6c0"
};

const specificFacts = {
  // Math
  'algebra': { n: 'Algebra uses variables (letters) to represent numbers in equations and formulas. The goal is to solve for the unknown.', q: 'What is the main goal in algebra?', o: ['Find the unknown', 'Draw a circle', 'Memorize answers', 'Ignore variables'], a: 'Find the unknown' },
  'geometry': { n: 'Geometry is the study of points, lines, angles, shapes, and dimensions. It is heavily used in architecture and mapping.', q: 'Which of the following is studied in geometry?', o: ['Shapes and Angles', 'Chemical bonds', 'Grammar', 'Code'], a: 'Shapes and Angles' },
  'calculus': { n: 'Calculus studies continuous change using derivatives and integrals. Sir Isaac Newton is one of its famous founders.', q: 'What does a derivative measure?', o: ['Rate of change', 'Color of an object', 'Length of a line', 'Total mass'], a: 'Rate of change' },
  'trigonometry': { n: 'Trigonometry deals with the relationships between the sides and angles of triangles (Sine, Cosine, Tangent).', q: 'What does the acronym SOH CAH TOA represent?', o: ['Trigonometric ratios', 'Algebra rules', 'Physics laws', 'Chemical formulas'], a: 'Trigonometric ratios' },
  'statistics': { n: 'Statistics involves the collection, analysis, interpretation, and presentation of large chunks of numerical data.', q: 'Which of the following is a measure of central tendency?', o: ['Mean', 'Velocity', 'Radius', 'Variable'], a: 'Mean' },
  // Physics
  'kinematics': { n: 'Kinematics is the study of motion without considering the forces that cause it. Key concepts include velocity and acceleration.', q: 'What does kinematics study?', o: ['Motion without forces', 'Chemical reactions', 'Planetary gases', 'Electrical circuits'], a: 'Motion without forces' },
  'dynamics': { n: 'Dynamics deals with the forces and their effects on motion, heavily based on Newton\'s laws of motion.', q: 'Which law states F = ma?', o: ["Newton's Second Law", "Boyle's Law", "Hooke's Law", "Ohm's Law"], a: "Newton's Second Law" },
  'thermodynamics': { n: 'Thermodynamics evaluates heat, work, and temperature, and their relation to energy and radiation.', q: 'What does the First Law of Thermodynamics state?', o: ['Energy is conserved', 'Entropy always decreases', 'Force equals mass times acceleration', 'Heat flows from cold to hot'], a: 'Energy is conserved' },
  // CS
  'data-structures': { n: 'Data structures (like Arrays, Linked Lists, Trees) are specialized formats for organizing and storing data.', q: 'What is a common data structure?', o: ['Array', 'Microphone', 'Electron', 'Verb'], a: 'Array' },
  'algorithms': { n: 'An algorithm is a step-by-step set of operations to perform a specific task, such as sorting or searching.', q: 'Which of these is a famous search algorithm?', o: ['Binary Search', 'Linear Engine', 'Quantum Leap', 'Hyper Text'], a: 'Binary Search' },
  'databases': { n: 'Databases organized data storage. SQL is used for relational databases, while NoSQL represents document structures.', q: 'What language is used to query relational databases?', o: ['SQL', 'HTML', 'CSS', 'English'], a: 'SQL' },
  // Chem
  'organic': { n: 'Organic chemistry is the study of the structure, properties, and reactions of carbon-containing compounds.', q: 'Organic chemistry primarily revolves around which element?', o: ['Carbon', 'Gold', 'Oxygen', 'Neon'], a: 'Carbon' },
  'periodic': { n: 'The Periodic Table organizes chemical elements based on their atomic number, electron configuration, and recurring properties.', q: 'How are elements ordered in the periodic table?', o: ['By atomic number', 'Alphabetically', 'By discovery date', 'By color'], a: 'By atomic number' },
  // Moral Science
  'ethics': { n: 'Ethics comprises moral principles that govern a person\'s behavior and decisions.', q: 'What do ethics help us determine?', o: ['Right and wrong', 'Math equations', 'Grammar rules', 'Weather patterns'], a: 'Right and wrong' },
  'empathy': { n: 'Empathy is the ability to understand and share the feelings of another individual.', q: 'Empathy means you can:', o: ['Understand others feelings', 'Ignore others', 'Calculate faster', 'Run longer'], a: 'Understand others feelings' },
  // English
  'grammar': { n: 'Grammar dictates the structural rules of language, including clauses, syntax, and parts of speech.', q: 'Which is a part of speech?', o: ['Noun', 'Equation', 'Element', 'Theorem'], a: 'Noun' },
  'vocabulary': { n: 'Vocabulary represents the body of words used in a particular language.', q: 'Expanding your vocabulary improves:', o: ['Communication', 'Math skills', 'Running speed', 'Vision'], a: 'Communication' },
  // Tamil
  'thirukkural': { n: 'Thirukkural is a classic Tamil language text consisting of 1,330 short couplets, authored by Thiruvalluvar.', q: 'How many couplets are in the Thirukkural?', o: ['1330', '1000', '500', '2000'], a: '1330' },
  'grammar-ilakkanam': { n: 'Tamil grammar (Ilakkanam) traditionally consists of 5 parts: Eluthu, Sol, Porul, Yappu, and Ani.', q: 'How many main parts belong to Tamil grammar?', o: ['Five', 'Three', 'Ten', 'Two'], a: 'Five' }
};

function fallbackFact(sub, top) {
  const t = top.replace(/-/g, ' ');
  return {
    n: `This topic covers the fundamental principles of ${t} in the context of ${sub}. Understanding ${t} is crucial for mastering the broader field and its real-world applications.`,
    q: `What is the core focus of the study of ${t}?`,
    o: [`The principles of ${t}`, `Irrelevant data`, `Random guessing`, `Historical myths`],
    a: `The principles of ${t}`
  };
}

let code = `const courses = {\n`;

Object.keys(subjects).forEach((sub, subIdx) => {
  code += `  "${sub}": {\n`;
  subjects[sub].forEach((topic, idx) => {
    let details = specificFacts[topic] || fallbackFact(sub, topic);
    let isLast = idx === subjects[sub].length - 1;
    code += `    "${topic}": {
      title: "${topic.replace(/-/g, ' ').replace(/\\b\\w/g, c=>c.toUpperCase())}",
      videoUrl: "${videos[sub]}",
      notes: "${details.n}",
      practiceSum: "${details.q}",
      practiceOptions: ${JSON.stringify(details.o)},
      practiceAnswer: "${details.a}"
    }${isLast ? '' : ','}\n`;
  });
  code += `  }${subIdx === Object.keys(subjects).length - 1 ? '' : ','}\n`;
});

code += `};\n\nmodule.exports = courses;\n`;

fs.writeFileSync('data/courseContent.js', code);
console.log('courseContent.js updated with rich content!');
