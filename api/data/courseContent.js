const courses = {
  "mathematics": {
    "algebra": {
      "title": "Algebra Masterclass",
      "videoUrl": "https://www.youtube.com/embed/LwCRRUa8yTU",
      "notes": "Algebra extends arithmetic by using variables (fields and rings). Modern abstract algebra explores groups and homomorphisms.",
      "practiceSum": "By the Fundamental Theorem of Algebra, how many complex roots does a polynomial of degree n have?",
      "practiceOptions": [
        "n",
        "n-1",
        "n+1",
        "Infinite"
      ],
      "practiceAnswer": "n"
    },
    "geometry": {
      "title": "Geometry Masterclass",
      "videoUrl": "https://www.youtube.com/embed/mLeNaZcy-hE",
      "notes": "Geometry analyzes spatial structures. Non-Euclidean geometries discard the parallel postulate, leading to spherical and hyperbolic spaces.",
      "practiceSum": "In hyperbolic geometry, the sum of angles in a triangle is:",
      "practiceOptions": [
        "Less than 180°",
        "Exactly 180°",
        "Greater than 180°",
        "Undefined"
      ],
      "practiceAnswer": "Less than 180°"
    },
    "trigonometry": {
      "title": "Trigonometry Masterclass",
      "videoUrl": "https://www.youtube.com/embed/g8VCHoSk5_o",
      "notes": "Trigonometry centers on circular functions. Euler’s formula, e^(ix) = cos(x) + i*sin(x), creates a bridge between trig and complex numbers.",
      "practiceSum": "What is the period of the function f(x) = tan(x)?",
      "practiceOptions": [
        "π",
        "2π",
        "π/2",
        "4π"
      ],
      "practiceAnswer": "π"
    }
  },
  "physics": {
    "kinematics": {
      "title": "Kinematics Masterclass",
      "videoUrl": "https://www.youtube.com/embed/ZM8ECpBuQYE",
      "notes": "Kinematics details motion through equations without addressing force. Key variables are displacement, velocity, acceleration, and time.",
      "practiceSum": "In projectile motion (ignoring air resistance), the horizontal velocity:",
      "practiceOptions": [
        "Remains constant",
        "Increases linearly",
        "Decreases exponentially",
        "Is zero"
      ],
      "practiceAnswer": "Remains constant"
    },
    "dynamics": {
      "title": "Dynamics Masterclass",
      "videoUrl": "https://www.youtube.com/embed/kKKM8Y-u7ds",
      "notes": "Dynamics analyzes forces. Newton’s Laws govern macroscopic domains, while Lagrangian mechanics offers an energy-based approach to the same problems.",
      "practiceSum": "What is the conserved quantity when the net external force on a system is zero?",
      "practiceOptions": [
        "Linear Momentum",
        "Kinetic Energy",
        "Potential Energy",
        "Angular Momentum"
      ],
      "practiceAnswer": "Linear Momentum"
    },
    "thermodynamics": {
      "title": "Thermodynamics Masterclass",
      "videoUrl": "https://www.youtube.com/embed/8N1BxHgsoOw",
      "notes": "Thermodynamics studies energy transfer. The Second Law asserts that the total entropy of an isolated system can never decrease over time.",
      "practiceSum": "In an adiabatic process, which quantity remains constant?",
      "practiceOptions": [
        "Heat (Q = 0)",
        "Temperature",
        "Pressure",
        "Volume"
      ],
      "practiceAnswer": "Heat (Q = 0)"
    },
    "astrophysics": {
      "title": "Astrophysics Masterclass",
      "videoUrl": "https://www.youtube.com/embed/TCrRs_OBN0E?si=Git5gkY3TzZnEFX_",
      "notes": "Astrophysics applies physics to space. The Chandrasekhar limit specifies the maximum mass of a stable white dwarf star.",
      "practiceSum": "What phenomenon causes the wavelength of light from distant galaxies to shift toward the red end of the spectrum?",
      "practiceOptions": [
        "Doppler Effect (Expansion of space)",
        "Gravitational Lensing",
        "Nuclear Fusion",
        "Compton Scattering"
      ],
      "practiceAnswer": "Doppler Effect (Expansion of space)"
    }
  },
  "computer-science": {
    "algorithms": {
      "title": "Algorithms Masterclass",
      "videoUrl": "https://www.youtube.com/embed/rVdBpWzZ-28",
      "notes": "Algorithms are deterministic steps. Dynamic programming optimizes recursive algorithms by caching overlapping subproblem results.",
      "practiceSum": "What is the worst-case time complexity of QuickSort?",
      "practiceOptions": [
        "O(n^2)",
        "O(n log n)",
        "O(n)",
        "O(log n)"
      ],
      "practiceAnswer": "O(n^2)"
    },
    "databases": {
      "title": "Databases Masterclass",
      "videoUrl": "https://www.youtube.com/embed/HXV3zeJZ1EQ",
      "notes": "Databases manage data using ACID properties (Atomicity, Consistency, Isolation, Durability) to guarantee transactional integrity.",
      "practiceSum": "In SQL, what constraint ensures all values in a column are unique and non-null?",
      "practiceOptions": [
        "PRIMARY KEY",
        "FOREIGN KEY",
        "UNIQUE",
        "NOT NULL"
      ],
      "practiceAnswer": "PRIMARY KEY"
    },
    "networking": {
      "title": "Networking Masterclass",
      "videoUrl": "https://www.youtube.com/embed/QiQRjzcgAQI",
      "notes": "Networking relies on protocols. The OSI model separates network operations into 7 abstract layers, with TCP operating at the Transport layer.",
      "practiceSum": "Which port is typically used for secure web traffic (HTTPS)?",
      "practiceOptions": [
        "443",
        "80",
        "22",
        "21"
      ],
      "practiceAnswer": "443"
    }
  },
  "history": {
    "ancient-egypt": {
      "title": "Ancient Egypt Masterclass",
      "videoUrl": "https://www.youtube.com/embed/ibPTKz0S9d0",
      "notes": "Ancient Egypt was characterized by pharaohs, pyramids, and a polytheistic religion. The Nile River was vital to its civilization.",
      "practiceSum": "Which river was essential to the survival and prosperity of Ancient Egypt?",
      "practiceOptions": [
        "The Nile",
        "The Amazon",
        "The Tigris",
        "The Euphrates"
      ],
      "practiceAnswer": "The Nile"
    },
    "world-war-2": {
      "title": "World War 2 Masterclass",
      "videoUrl": "https://www.youtube.com/embed/Q78COTwT7nE",
      "notes": "World War II was a global conflict that primarily pitted the Allied powers against the Axis powers, ending in 1945.",
      "practiceSum": "In which year did World War 2 end?",
      "practiceOptions": [
        "1941",
        "1945",
        "1939",
        "1918"
      ],
      "practiceAnswer": "1945"
    }
  },
  "geography": {
    "plate-tectonics": {
      "title": "Plate Tectonics Masterclass",
      "videoUrl": "https://www.youtube.com/embed/Z9Hr7VJEJ9I",
      "notes": "Plate tectonics is a scientific theory describing the large-scale motion of seven large plates and the movements of a larger number of smaller plates of Earths lithosphere.",
      "practiceSum": "What boundary occurs when two tectonic plates move away from each other?",
      "practiceOptions": [
        "Divergent boundary",
        "Convergent boundary",
        "Transform boundary",
        "Subduction zone"
      ],
      "practiceAnswer": "Divergent boundary"
    },
    "climate-change": {
      "title": "Climate Change Masterclass",
      "videoUrl": "https://www.youtube.com/embed/G4H1N_yXBiA",
      "notes": "Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, but since the 1800s, human activities have been the main driver of climate change.",
      "practiceSum": "Which greenhouse gas is most significantly contributing to human-driven climate change?",
      "practiceOptions": [
        "Carbon dioxide",
        "Methane",
        "Nitrous oxide",
        "Water vapor"
      ],
      "practiceAnswer": "Carbon dioxide"
    }
  },
  "chemistry": {
    "periodic-table": {
      "title": "Periodic Table Masterclass",
      "videoUrl": "https://www.youtube.com/embed/0RRVV4Diomg",
      "notes": "The periodic table organizes elements by atomic number. Rows are periods and columns are groups, sharing similar chemical properties.",
      "practiceSum": "Which element has the atomic number 1?",
      "practiceOptions": ["Hydrogen", "Helium", "Lithium", "Oxygen"],
      "practiceAnswer": "Hydrogen"
    },
    "organic-chemistry": {
      "title": "Intro to Organic Chemistry",
      "videoUrl": "https://www.youtube.com/embed/mH9-0cT_P94",
      "notes": "Organic chemistry focuses on carbon-based compounds. Carbon's ability to form four stable bonds allows for immense molecular complexity.",
      "practiceSum": "What is the simplest organic molecule?",
      "practiceOptions": ["Methane", "Ethane", "Propane", "Butane"],
      "practiceAnswer": "Methane"
    }
  },
  "moralscience": {
    "ethics": {
      "title": "Introduction to Ethics",
      "videoUrl": "https://www.youtube.com/embed/u399XmkjeUo",
      "notes": "Ethics explores moral principles that govern behavior. It distinguishes between right and wrong and analyzes how we should live.",
      "practiceSum": "Which term describes the study of what is morally right or wrong?",
      "practiceOptions": ["Ethics", "Biology", "Physics", "Chemistry"],
      "practiceAnswer": "Ethics"
    },
    "empathy": {
      "title": "The Power of Empathy",
      "videoUrl": "https://www.youtube.com/embed/1Evwgu369Jw",
      "notes": "Empathy is the ability to understand and share the feelings of another. It is a fundamental pillar of social interaction.",
      "practiceSum": "True/False: Empathy and Sympathy are exactly the same thing.",
      "practiceOptions": ["True", "False"],
      "practiceAnswer": "False"
    }
  },
  "english": {
    "grammar": {
      "title": "English Grammar Essentials",
      "videoUrl": "https://www.youtube.com/embed/SOfv6U0-S8E",
      "notes": "Grammar is the set of structural rules governing the composition of clauses. Mastering it improves clarity and precision in communication.",
      "practiceSum": "Identify the verb in this sentence: 'The cat jumped over the wall.'",
      "practiceOptions": ["Cat", "Jumped", "Wall", "The"],
      "practiceAnswer": "Jumped"
    }
  },
  "tamil": {
    "grammar-ilakkanam": {
      "title": "Tamil Grammar (Ilakkanam)",
      "videoUrl": "https://www.youtube.com/embed/8Vn1j5R-8Xo",
      "notes": "Tamil grammar is traditionally divided into five parts: Ezhutthu, Sol, Porul, Yaappu, and Ani.",
      "practiceSum": "How many basic categories of Tamil Ilakkanam are there?",
      "practiceOptions": ["3", "5", "7", "9"],
      "practiceAnswer": "5"
    }
  }
};

module.exports = courses;
