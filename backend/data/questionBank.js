const questionBank = {
  mathematics: {
    arithmetic: [
      { id: 'm_a_1', question: 'What is 15 × 12?', options: ['170', '180', '190', '200'], answer: '180', difficulty: 1, topic: 'arithmetic' },
      { id: 'm_a_2', question: 'What is 256 ÷ 16?', options: ['14', '16', '18', '20'], answer: '16', difficulty: 1, topic: 'arithmetic' },
      { id: 'm_a_3', question: 'What is 3/4 + 5/8?', options: ['8/12', '11/8', '15/8', '7/8'], answer: '11/8', difficulty: 2, topic: 'arithmetic' },
      { id: 'm_a_4', question: 'What is √144?', options: ['10', '11', '12', '13'], answer: '12', difficulty: 1, topic: 'arithmetic' },
      { id: 'm_a_5', question: 'If x = 5, what is 3x² - 2x + 1?', options: ['66', '76', '56', '86'], answer: '66', difficulty: 3, topic: 'arithmetic' },
    ],
    algebra: [
      { id: 'm_al_1', question: 'Solve: 2x + 5 = 15', options: ['x = 3', 'x = 5', 'x = 7', 'x = 10'], answer: 'x = 5', difficulty: 1, topic: 'algebra' },
      { id: 'm_al_2', question: 'Which is the factored form of x² - 9?', options: ['(x+3)(x-3)', '(x+9)(x-1)', '(x-3)²', '(x+3)²'], answer: '(x+3)(x-3)', difficulty: 2, topic: 'algebra' },
      { id: 'm_al_3', question: 'What is the slope of y = 3x + 7?', options: ['7', '3', '-3', '10'], answer: '3', difficulty: 1, topic: 'algebra' },
      { id: 'm_al_4', question: 'Solve: x² - 5x + 6 = 0', options: ['x=2,3', 'x=1,6', 'x=-2,-3', 'x=0,5'], answer: 'x=2,3', difficulty: 2, topic: 'algebra' },
      { id: 'm_al_5', question: 'If f(x) = 2x + 3, what is f(4)?', options: ['8', '11', '14', '7'], answer: '11', difficulty: 1, topic: 'algebra' },
    ],
    geometry: [
      { id: 'm_g_1', question: 'What is the area of a circle with radius 7? (Use π ≈ 22/7)', options: ['154 sq units', '144 sq units', '164 sq units', '174 sq units'], answer: '154 sq units', difficulty: 1, topic: 'geometry' },
      { id: 'm_g_2', question: 'How many degrees are in a triangle?', options: ['90°', '180°', '270°', '360°'], answer: '180°', difficulty: 1, topic: 'geometry' },
      { id: 'm_g_3', question: 'What is the Pythagorean theorem?', options: ['a²+b²=c²', 'a+b=c', '2a+2b=c', 'a²-b²=c²'], answer: 'a²+b²=c²', difficulty: 1, topic: 'geometry' },
      { id: 'm_g_4', question: 'The volume of a cube with side 5 is:', options: ['25', '75', '100', '125'], answer: '125', difficulty: 2, topic: 'geometry' },
      { id: 'm_g_5', question: 'An angle of 90° is called:', options: ['Acute', 'Right', 'Obtuse', 'Straight'], answer: 'Right', difficulty: 1, topic: 'geometry' },
    ],
    statistics: [
      { id: 'm_s_1', question: 'What is the mean of: 4, 8, 6, 5, 7?', options: ['5', '6', '7', '8'], answer: '6', difficulty: 1, topic: 'statistics' },
      { id: 'm_s_2', question: 'What is the median of: 3, 7, 1, 9, 5?', options: ['3', '5', '7', '9'], answer: '5', difficulty: 1, topic: 'statistics' },
      { id: 'm_s_3', question: 'What is the mode of: 2, 3, 3, 5, 7, 3?', options: ['2', '3', '5', '7'], answer: '3', difficulty: 1, topic: 'statistics' },
      { id: 'm_s_4', question: 'The probability of getting heads on a fair coin is:', options: ['0.25', '0.5', '0.75', '1'], answer: '0.5', difficulty: 1, topic: 'statistics' },
      { id: 'm_s_5', question: 'Standard deviation measures:', options: ['Central tendency', 'Spread of data', 'Frequency', 'Probability'], answer: 'Spread of data', difficulty: 2, topic: 'statistics' },
    ]
  },
  physics: {
    mechanics: [
      { id: 'p_m_1', question: 'What is Newton\'s second law?', options: ['F=ma', 'E=mc²', 'F=mv', 'P=mgh'], answer: 'F=ma', difficulty: 1, topic: 'mechanics' },
      { id: 'p_m_2', question: 'A car accelerates from 0 to 60 m/s in 10s. What is the acceleration?', options: ['3 m/s²', '6 m/s²', '10 m/s²', '60 m/s²'], answer: '6 m/s²', difficulty: 2, topic: 'mechanics' },
      { id: 'p_m_3', question: 'What is the unit of force?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], answer: 'Newton', difficulty: 1, topic: 'mechanics' },
      { id: 'p_m_4', question: 'If an object is in free fall, its acceleration is approximately:', options: ['5 m/s²', '9.8 m/s²', '15 m/s²', '0 m/s²'], answer: '9.8 m/s²', difficulty: 1, topic: 'mechanics' },
      { id: 'p_m_5', question: 'Work is defined as:', options: ['Force × Distance', 'Mass × Velocity', 'Force × Time', 'Mass × Acceleration'], answer: 'Force × Distance', difficulty: 1, topic: 'mechanics' },
    ],
    thermodynamics: [
      { id: 'p_t_1', question: 'What is the boiling point of water in Celsius?', options: ['0°C', '50°C', '100°C', '212°C'], answer: '100°C', difficulty: 1, topic: 'thermodynamics' },
      { id: 'p_t_2', question: 'Heat transfers from:', options: ['Cold to hot', 'Hot to cold', 'Equal temperature', 'No transfer'], answer: 'Hot to cold', difficulty: 1, topic: 'thermodynamics' },
      { id: 'p_t_3', question: 'The SI unit of temperature is:', options: ['Celsius', 'Fahrenheit', 'Kelvin', 'Rankine'], answer: 'Kelvin', difficulty: 1, topic: 'thermodynamics' },
      { id: 'p_t_4', question: 'What is absolute zero in Celsius?', options: ['-100°C', '-273.15°C', '-300°C', '0°C'], answer: '-273.15°C', difficulty: 2, topic: 'thermodynamics' },
      { id: 'p_t_5', question: 'Which law states energy cannot be created or destroyed?', options: ['Zeroth Law', 'First Law', 'Second Law', 'Third Law'], answer: 'First Law', difficulty: 2, topic: 'thermodynamics' },
    ],
    optics: [
      { id: 'p_o_1', question: 'What is the speed of light?', options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], answer: '3×10⁸ m/s', difficulty: 1, topic: 'optics' },
      { id: 'p_o_2', question: 'A convex lens is also known as:', options: ['Diverging lens', 'Converging lens', 'Flat lens', 'Prism'], answer: 'Converging lens', difficulty: 1, topic: 'optics' },
      { id: 'p_o_3', question: 'The angle of incidence equals:', options: ['Angle of refraction', 'Angle of reflection', 'Angle of diffraction', 'Zero'], answer: 'Angle of reflection', difficulty: 1, topic: 'optics' },
      { id: 'p_o_4', question: 'Which color has the shortest wavelength?', options: ['Red', 'Green', 'Blue', 'Violet'], answer: 'Violet', difficulty: 2, topic: 'optics' },
      { id: 'p_o_5', question: 'Total internal reflection occurs when light passes from:', options: ['Rare to dense', 'Dense to rare', 'Any medium', 'Vacuum only'], answer: 'Dense to rare', difficulty: 2, topic: 'optics' },
    ],
    electricity: [
      { id: 'p_e_1', question: 'What is Ohm\'s Law?', options: ['V=IR', 'P=IV', 'E=mc²', 'F=qE'], answer: 'V=IR', difficulty: 1, topic: 'electricity' },
      { id: 'p_e_2', question: 'The unit of electrical resistance is:', options: ['Ampere', 'Volt', 'Ohm', 'Watt'], answer: 'Ohm', difficulty: 1, topic: 'electricity' },
      { id: 'p_e_3', question: 'Electric current is the flow of:', options: ['Protons', 'Neutrons', 'Electrons', 'Photons'], answer: 'Electrons', difficulty: 1, topic: 'electricity' },
      { id: 'p_e_4', question: 'In a parallel circuit, voltage is:', options: ['Different', 'Same', 'Zero', 'Infinite'], answer: 'Same', difficulty: 2, topic: 'electricity' },
      { id: 'p_e_5', question: 'Power is measured in:', options: ['Joules', 'Watts', 'Volts', 'Amperes'], answer: 'Watts', difficulty: 1, topic: 'electricity' },
    ]
  },
  'computer-science': {
    programming: [
      { id: 'c_p_1', question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Text Machine Language', 'HyperText Machine Language', 'High Tech Markup Language'], answer: 'HyperText Markup Language', difficulty: 1, topic: 'programming' },
      { id: 'c_p_2', question: 'Which data structure follows FIFO?', options: ['Stack', 'Queue', 'Tree', 'Graph'], answer: 'Queue', difficulty: 1, topic: 'programming' },
      { id: 'c_p_3', question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 'O(log n)', difficulty: 2, topic: 'programming' },
      { id: 'c_p_4', question: 'Which keyword is used to define a function in Python?', options: ['function', 'func', 'def', 'lambda'], answer: 'def', difficulty: 1, topic: 'programming' },
      { id: 'c_p_5', question: 'What is a variable?', options: ['A fixed value', 'A named storage location', 'A function', 'An operator'], answer: 'A named storage location', difficulty: 1, topic: 'programming' },
    ],
    algorithms: [
      { id: 'c_a_1', question: 'Which sorting algorithm has the best average-case time complexity?', options: ['Bubble Sort', 'Merge Sort', 'Selection Sort', 'Insertion Sort'], answer: 'Merge Sort', difficulty: 2, topic: 'algorithms' },
      { id: 'c_a_2', question: 'What is a recursive function?', options: ['A function that loops', 'A function that calls itself', 'A function with no return', 'A built-in function'], answer: 'A function that calls itself', difficulty: 1, topic: 'algorithms' },
      { id: 'c_a_3', question: 'BFS uses which data structure?', options: ['Stack', 'Queue', 'Heap', 'Array'], answer: 'Queue', difficulty: 2, topic: 'algorithms' },
      { id: 'c_a_4', question: 'Big O notation measures:', options: ['Code quality', 'Algorithm efficiency', 'Memory usage only', 'Number of variables'], answer: 'Algorithm efficiency', difficulty: 1, topic: 'algorithms' },
      { id: 'c_a_5', question: 'DFS uses which data structure?', options: ['Queue', 'Stack', 'Heap', 'Hash Table'], answer: 'Stack', difficulty: 2, topic: 'algorithms' },
    ],
    databases: [
      { id: 'c_d_1', question: 'SQL stands for:', options: ['Structured Question Language', 'Structured Query Language', 'Simple Query Language', 'Standard Query Logic'], answer: 'Structured Query Language', difficulty: 1, topic: 'databases' },
      { id: 'c_d_2', question: 'Which is a NoSQL database?', options: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle'], answer: 'MongoDB', difficulty: 1, topic: 'databases' },
      { id: 'c_d_3', question: 'A primary key must be:', options: ['Null', 'Duplicate', 'Unique', 'Empty'], answer: 'Unique', difficulty: 1, topic: 'databases' },
      { id: 'c_d_4', question: 'CRUD stands for:', options: ['Create Read Update Delete', 'Copy Run Upload Download', 'Create Run Update Deploy', 'Check Read Use Delete'], answer: 'Create Read Update Delete', difficulty: 1, topic: 'databases' },
      { id: 'c_d_5', question: 'An index in a database is used to:', options: ['Delete data', 'Speed up queries', 'Encrypt data', 'Compress data'], answer: 'Speed up queries', difficulty: 2, topic: 'databases' },
    ],
    networking: [
      { id: 'c_n_1', question: 'What does IP stand for?', options: ['Internet Protocol', 'Internal Processing', 'Internet Port', 'Interface Protocol'], answer: 'Internet Protocol', difficulty: 1, topic: 'networking' },
      { id: 'c_n_2', question: 'HTTP status code 404 means:', options: ['Success', 'Not Found', 'Server Error', 'Redirect'], answer: 'Not Found', difficulty: 1, topic: 'networking' },
      { id: 'c_n_3', question: 'Which protocol is secure?', options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'], answer: 'HTTPS', difficulty: 1, topic: 'networking' },
      { id: 'c_n_4', question: 'DNS converts:', options: ['IP to MAC', 'Domain to IP', 'IP to Domain', 'MAC to IP'], answer: 'Domain to IP', difficulty: 2, topic: 'networking' },
      { id: 'c_n_5', question: 'TCP is a __ protocol:', options: ['Connectionless', 'Connection-oriented', 'Stateless', 'Wireless'], answer: 'Connection-oriented', difficulty: 2, topic: 'networking' },
    ]
  },
  chemistry: {
    general: [
      { id: 'ch_g_1', question: 'What is the chemical symbol for Gold?', options: ['Gd', 'Go', 'Au', 'Ag'], answer: 'Au', difficulty: 1, topic: 'general' },
      { id: 'ch_g_2', question: 'Which gas is most abundant in Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'], answer: 'Nitrogen', difficulty: 1, topic: 'general' },
      { id: 'ch_g_3', question: 'What is the pH of pure water?', options: ['0', '5', '7', '14'], answer: '7', difficulty: 1, topic: 'general' },
      { id: 'ch_g_4', question: 'Which element is known as the "King of Chemicals"?', options: ['Sulfuric Acid', 'Oxygen', 'Hydrogen', 'Carbon'], answer: 'Sulfuric Acid', difficulty: 2, topic: 'general' },
      { id: 'ch_g_5', question: 'What is the chemical formula for common salt?', options: ['NaCl', 'KCl', 'MgCl₂', 'LiCl'], answer: 'NaCl', difficulty: 1, topic: 'general' },
    ]
  },
  moralscience: {
    ethics: [
      { id: 'ms_e_1', question: 'What is the meaning of "Integrity"?', options: ['Being rich', 'Being honest and having strong moral principles', 'Being clever', 'Being famous'], answer: 'Being honest and having strong moral principles', difficulty: 1, topic: 'ethics' },
      { id: 'ms_e_2', question: 'Why is empathy important?', options: ['To win arguments', 'To understand and share the feelings of others', 'To get more marks', 'To ignore others'], answer: 'To understand and share the feelings of others', difficulty: 1, topic: 'ethics' },
      { id: 'ms_e_3', question: 'Helping someone in need is an example of:', options: ['Selfishness', 'Altruism', 'Greed', 'Laziness'], answer: 'Altruism', difficulty: 1, topic: 'ethics' },
      { id: 'ms_e_4', question: 'What does "Respect" mean?', options: ['Ignoring elders', 'Valuing others and treating them with care', 'Shouting at friends', 'Taking things without asking'], answer: 'Valuing others and treating them with care', difficulty: 1, topic: 'ethics' },
      { id: 'ms_e_5', question: 'Which of these is a core value?', options: ['Dishonesty', 'Patience', 'Hatred', 'Jealousy'], answer: 'Patience', difficulty: 1, topic: 'ethics' },
    ]
  },
  english: {
    grammar: [
      { id: 'en_g_1', question: 'Which of these is a noun?', options: ['Run', 'Beautiful', 'Apple', 'Quickly'], answer: 'Apple', difficulty: 1, topic: 'grammar' },
      { id: 'en_g_2', question: 'Identify the conjunction: "I like tea and coffee."', options: ['I', 'Like', 'And', 'Tea'], answer: 'And', difficulty: 1, topic: 'grammar' },
      { id: 'en_g_3', question: 'What is the synonym of "Happy"?', options: ['Sad', 'Angry', 'Joyful', 'Tired'], answer: 'Joyful', difficulty: 1, topic: 'grammar' },
      { id: 'en_g_4', question: 'Choose the correct preposition: "The book is ___ the table."', options: ['In', 'On', 'Under', 'By'], answer: 'On', difficulty: 1, topic: 'grammar' },
      { id: 'en_g_5', question: 'Identify the adjective: "The blue sky is clear."', options: ['Sky', 'Blue', 'Clear', 'Both Blue and Clear'], answer: 'Both Blue and Clear', difficulty: 1, topic: 'grammar' },
    ]
  },
  history: {
    world: [
      { id: 'hi_w_1', question: 'Who was the first President of the United States?', options: ['Thomas Jefferson', 'Abraham Lincoln', 'George Washington', 'John Adams'], answer: 'George Washington', difficulty: 1, topic: 'world' },
      { id: 'hi_w_2', question: 'The French Revolution began in which year?', options: ['1776', '1789', '1804', '1812'], answer: '1789', difficulty: 2, topic: 'world' },
      { id: 'hi_w_3', question: 'Who discovered America in 1492?', options: ['Vasco da Gama', 'Christopher Columbus', 'Magellan', 'Marco Polo'], answer: 'Christopher Columbus', difficulty: 1, topic: 'world' },
    ]
  },
  geography: {
    world: [
      { id: 'ge_w_1', question: 'Which is the largest continent?', options: ['Africa', 'Europe', 'Asia', 'North America'], answer: 'Asia', difficulty: 1, topic: 'world' },
      { id: 'ge_w_2', question: 'Which is the longest river in the world?', options: ['Amazon', 'Nile', 'Ganga', 'Mississippi'], answer: 'Nile', difficulty: 1, topic: 'world' },
      { id: 'ge_w_3', question: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], answer: 'Paris', difficulty: 1, topic: 'world' },
    ]
  },
  tamil: {
    literature: [
      { id: 'ta_l_1', question: 'Who wrote "Thirukkural"?', options: ['Kambar', 'Thiruvalluvar', 'Bharathiyar', 'Avvaiyar'], answer: 'Thiruvalluvar', difficulty: 1, topic: 'literature' },
      { id: 'ta_l_2', question: 'How many chapters are in Thirukkural?', options: ['100', '133', '150', '200'], answer: '133', difficulty: 1, topic: 'literature' },
      { id: 'ta_l_3', question: 'What is the ancient Tamil grammar book?', options: ['Silappathikaram', 'Manimekalai', 'Tolkappiyam', 'Ettuthogai'], answer: 'Tolkappiyam', difficulty: 2, topic: 'literature' },
    ]
  }
};

const learningPaths = {
  mathematics: {
    arithmetic: [
      { level: 1, title: 'Number Basics', description: 'Addition, subtraction, and number properties', lessons: ['Place Values', 'Basic Operations', 'Order of Operations'] },
      { level: 2, title: 'Fractions & Decimals', description: 'Working with fractions, decimals, and percentages', lessons: ['Understanding Fractions', 'Decimal Operations', 'Percentages'] },
      { level: 3, title: 'Advanced Arithmetic', description: 'Powers, roots, and complex calculations', lessons: ['Exponents', 'Square Roots', 'Scientific Notation'] },
      { level: 4, title: 'Mastery Challenge', description: 'Real-world arithmetic problems', lessons: ['Word Problems', 'Financial Math', 'Speed Math'] }
    ],
    algebra: [
      { level: 1, title: 'Variables & Expressions', description: 'Introduction to algebraic thinking', lessons: ['What are Variables', 'Expressions', 'Simplification'] },
      { level: 2, title: 'Equations & Inequalities', description: 'Solving linear equations and inequalities', lessons: ['Linear Equations', 'Inequalities', 'Systems of Equations'] },
      { level: 3, title: 'Polynomials & Functions', description: 'Polynomial operations and function concepts', lessons: ['Polynomial Operations', 'Factoring', 'Function Basics'] },
      { level: 4, title: 'Advanced Algebra', description: 'Quadratics, complex numbers, and matrices', lessons: ['Quadratic Equations', 'Complex Numbers', 'Matrices'] }
    ],
    geometry: [
      { level: 1, title: 'Basic Geometry', description: 'Points, lines, and basic shapes', lessons: ['Points and Lines', 'Basic Shapes', 'Perimeter'] },
      { level: 2, title: 'Angles & Triangles', description: 'Angle relationships and triangle properties', lessons: ['Angle Types', 'Triangle Properties', 'Congruence'] },
      { level: 3, title: 'Area & Volume', description: 'Calculating areas and volumes', lessons: ['Area of Shapes', 'Surface Area', 'Volume'] },
      { level: 4, title: 'Advanced Geometry', description: 'Coordinate geometry and proofs', lessons: ['Coordinate Geometry', 'Circle Theorems', 'Geometric Proofs'] }
    ],
    statistics: [
      { level: 1, title: 'Data Basics', description: 'Collecting and organizing data', lessons: ['Data Types', 'Frequency Tables', 'Bar Charts'] },
      { level: 2, title: 'Central Tendency', description: 'Mean, median, mode', lessons: ['Mean', 'Median', 'Mode'] },
      { level: 3, title: 'Probability', description: 'Basic probability concepts', lessons: ['Simple Probability', 'Events', 'Tree Diagrams'] },
      { level: 4, title: 'Advanced Statistics', description: 'Standard deviation and distributions', lessons: ['Standard Deviation', 'Normal Distribution', 'Hypothesis Testing'] }
    ]
  },
  physics: {
    mechanics: [
      { level: 1, title: 'Motion Basics', description: 'Speed, velocity, and acceleration', lessons: ['Speed and Velocity', 'Acceleration', 'Distance-Time Graphs'] },
      { level: 2, title: 'Forces', description: 'Understanding forces and Newton\'s laws', lessons: ['Types of Forces', 'Newton\'s Laws', 'Friction'] },
      { level: 3, title: 'Work & Energy', description: 'Work, energy, and power', lessons: ['Work Done', 'Kinetic Energy', 'Potential Energy'] },
      { level: 4, title: 'Advanced Mechanics', description: 'Momentum and rotational motion', lessons: ['Momentum', 'Collisions', 'Rotational Motion'] }
    ],
    thermodynamics: [
      { level: 1, title: 'Heat & Temperature', description: 'Understanding heat and temperature', lessons: ['Temperature Scales', 'Heat Transfer', 'Thermal Equilibrium'] },
      { level: 2, title: 'States of Matter', description: 'Solids, liquids, gases, and phase changes', lessons: ['States of Matter', 'Phase Changes', 'Gas Laws'] },
      { level: 3, title: 'Laws of Thermodynamics', description: 'The fundamental laws', lessons: ['First Law', 'Second Law', 'Entropy'] },
      { level: 4, title: 'Advanced Thermal Physics', description: 'Heat engines and entropy', lessons: ['Heat Engines', 'Refrigeration', 'Statistical Mechanics'] }
    ],
    optics: [
      { level: 1, title: 'Light Basics', description: 'Nature and properties of light', lessons: ['Nature of Light', 'Reflection', 'Shadows'] },
      { level: 2, title: 'Refraction & Lenses', description: 'How light bends and lenses work', lessons: ['Refraction', 'Lenses', 'Lens Formula'] },
      { level: 3, title: 'Wave Optics', description: 'Interference and diffraction', lessons: ['Interference', 'Diffraction', 'Polarization'] },
      { level: 4, title: 'Modern Optics', description: 'Lasers and optical instruments', lessons: ['Lasers', 'Optical Instruments', 'Fiber Optics'] }
    ],
    electricity: [
      { level: 1, title: 'Electric Charge', description: 'Basics of electric charge and current', lessons: ['Electric Charge', 'Current', 'Voltage'] },
      { level: 2, title: 'Circuits', description: 'Building and analyzing circuits', lessons: ['Series Circuits', 'Parallel Circuits', 'Ohm\'s Law'] },
      { level: 3, title: 'Electromagnetism', description: 'Magnetic fields and electromagnetic induction', lessons: ['Magnetic Fields', 'Electromagnets', 'Induction'] },
      { level: 4, title: 'Advanced Electricity', description: 'AC circuits and electronics', lessons: ['AC Circuits', 'Transformers', 'Semiconductors'] }
    ]
  },
  'computer-science': {
    programming: [
      { level: 1, title: 'Programming Basics', description: 'Introduction to programming concepts', lessons: ['Variables & Types', 'Control Flow', 'Functions'] },
      { level: 2, title: 'Data Structures', description: 'Arrays, lists, and basic structures', lessons: ['Arrays', 'Linked Lists', 'Stacks & Queues'] },
      { level: 3, title: 'OOP Concepts', description: 'Object-oriented programming', lessons: ['Classes', 'Inheritance', 'Polymorphism'] },
      { level: 4, title: 'Advanced Programming', description: 'Design patterns and architecture', lessons: ['Design Patterns', 'API Design', 'Testing'] }
    ],
    algorithms: [
      { level: 1, title: 'Algorithm Basics', description: 'What are algorithms and complexity', lessons: ['What is an Algorithm', 'Time Complexity', 'Space Complexity'] },
      { level: 2, title: 'Sorting & Searching', description: 'Common sorting and searching algorithms', lessons: ['Bubble Sort', 'Merge Sort', 'Binary Search'] },
      { level: 3, title: 'Graph Algorithms', description: 'BFS, DFS, and more', lessons: ['BFS', 'DFS', 'Shortest Path'] },
      { level: 4, title: 'Advanced Algorithms', description: 'Dynamic programming and greedy algorithms', lessons: ['Dynamic Programming', 'Greedy Algorithms', 'Backtracking'] }
    ],
    databases: [
      { level: 1, title: 'Database Basics', description: 'Introduction to databases', lessons: ['What is a Database', 'SQL Basics', 'Tables & Relations'] },
      { level: 2, title: 'Querying Data', description: 'Writing effective queries', lessons: ['SELECT Statements', 'JOINs', 'Aggregation'] },
      { level: 3, title: 'Database Design', description: 'Normalization and optimization', lessons: ['Normalization', 'Indexing', 'Transactions'] },
      { level: 4, title: 'Advanced Databases', description: 'NoSQL and distributed systems', lessons: ['NoSQL', 'Replication', 'Sharding'] }
    ],
    networking: [
      { level: 1, title: 'Networking Basics', description: 'Introduction to computer networks', lessons: ['Network Types', 'OSI Model', 'TCP/IP'] },
      { level: 2, title: 'Protocols', description: 'HTTP, DNS, and other protocols', lessons: ['HTTP/HTTPS', 'DNS', 'SMTP & FTP'] },
      { level: 3, title: 'Security', description: 'Network security fundamentals', lessons: ['Encryption', 'Firewalls', 'Authentication'] },
      { level: 4, title: 'Advanced Networking', description: 'Cloud and distributed computing', lessons: ['Cloud Computing', 'CDNs', 'Microservices'] }
    ]
  }
};

function getTestQuestions(subject, count = 12) {
  const subjectQuestions = questionBank[subject];
  
  const allQuestions = [];
  if (subjectQuestions) {
    Object.values(subjectQuestions).forEach(topicQuestions => {
      allQuestions.push(...topicQuestions);
    });
  }
  
  if (allQuestions.length === 0) return [];

  let result = [];
  while(result.length < count) {
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      result = result.concat(shuffled.map((q, i) => ({ ...q, id: q.id + '_' + result.length + '_' + i })));
  }
  
  return result.slice(0, count);
}

function getAdaptiveQuestions(subject, topic, difficulty, count = 5) {
  const subjectQuestions = questionBank[subject];
  if (!subjectQuestions) return [];
  
  let questions = [];
  if (topic && subjectQuestions[topic]) {
    questions = subjectQuestions[topic];
  } else {
    Object.values(subjectQuestions).forEach(topicQuestions => {
      questions.push(...topicQuestions);
    });
  }
  
  // Filter by difficulty range
  const filtered = questions.filter(q => Math.abs(q.difficulty - difficulty) <= 1);
  const shuffled = (filtered.length > 0 ? filtered : questions).sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getLearningPath(subject, weakTopics) {
  const subjectPaths = learningPaths[subject];
  if (!subjectPaths) return [];
  
  const paths = [];
  // Prioritize weak topics
  weakTopics.forEach(topic => {
    if (subjectPaths[topic]) {
      paths.push({ topic, levels: subjectPaths[topic], priority: 'high' });
    }
  });
  
  // Add other topics
  Object.keys(subjectPaths).forEach(topic => {
    if (!weakTopics.includes(topic)) {
      paths.push({ topic, levels: subjectPaths[topic], priority: 'normal' });
    }
  });
  
  return paths;
}

module.exports = { questionBank, learningPaths, getTestQuestions, getAdaptiveQuestions, getLearningPath };
