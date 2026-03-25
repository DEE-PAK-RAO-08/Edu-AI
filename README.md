# Edu AI - AI-Driven Personalized Learning Platform v2.0

Edu AI is a comprehensive, gamified learning platform built on the MERN stack (MongoDB, Express, React, Node.js) with deep AI integrations using Google Gemini. It offers adaptive testing, personalized learning paths, interactive simulations, and intelligent tutoring.

## 🚀 Features Matrix

### Core Platform
- **Authentication**: JWT-based secure login and Google OAuth via Firebase.
- **Gamification**: XP points, leveling up system, unlocking badges, and daily streaks.
- **Progress Tracking**: Detailed performance analytics and personalized dashboards.
- **Multi-language**: Built-in 8-language i18n support for global accessibility.
- **Theme Support**: Seamless Dark/Light mode toggle.

### 🧠 AI & Smart Features (Powered by Gemini 2.0)
- **AI Tutor Chat**: Context-aware 24/7 conversational assistant for explaining concepts.
- **Smart Study Planner**: AI-generated weekly study routines based on your weak areas.
- **Dynamic Flashcards**: Automatically generated 3D flashcards with mastery tracking.
- **Adaptive Question Engine**: Real-time difficulty adjustment based on performance.
- **Content Summarizer**: Instant bullet-point summaries of long notes or lessons.
- **Answer Explanations**: Detailed reasoning for why an answer is correct or incorrect.

### 📚 Learning & Engagement
- **Code Playground**: In-browser execution engine for JS, Python, Java, C, C++, and TS.
- **Discussion Forums**: Ask questions, provide answers, earn XP, and Like helpful posts.
- **Certificates**: Generate and download shareable PNG certificates for course mastery.
- **Interactive Simulations**: Visual learning tools for complex subjects.

### 🛡️ Security & Architecture
- **Modular Backend**: Clean, scalable MVC architecture with modular routes and controllers.
- **Rate Limiting**: Protection against brute-force attacks and AI-endpoint abuse.
- **Robust Validation**: Custom middleware for request body verification.
- **Global Error Handling**: Centralized catch mechanism for uniform API responses.

## 🛠️ Tech Stack

- **Frontend**: 
  - **Framework**: React 19, Vite
  - **Styling**: Custom CSS Variables, Flexbox/Grid, Responsive Design
  - **Animations**: Framer Motion
  - **Data Visualization**: Chart.js, React-Chartjs-2
  - **Icons**: Lucide React
  - **State/Routing**: React Router Dom
  - **API Client**: Axios
  - **Auth/Backend**: Firebase Client SDK

- **Backend**: 
  - **Runtime**: Node.js, Express.js
  - **Database**: MongoDB (Mongoose ODM)
  - **AI Integration**: Google Generative AI (Gemini 2.0 Flash), OpenAI SDK
  - **NLP**: Natural (Natural Language Processing for Node.js)
  - **Authentication**: JWT, BCryptJS, Firebase Admin SDK
  - **File Handling**: Multer (for uploads), OfficeParser (docs), PDF-Parse
  - **Utilities**: Luxon (dates), UUID, Nodemailer (emails)

- **DevOps**: 
  - **Containerization**: Docker, Docker Compose
  - **Deployment**: Configured for scalable microservices
  - **Execution Engine**: Piston API (Code Playground integration)

## 🏃‍♂️ Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or a MongoDB Atlas URI)
- A Google Gemini API Key

### 1. Backend Setup

```bash
cd backend
npm install

# Create a .env file based on the provided variables
echo "PORT=5000" > .env
echo "MONGODB_URI=mongodb://127.0.0.1:27017/edu_ai" >> .env
echo "JWT_SECRET=your_super_secret_key" >> .env
echo "GEMINI_API_KEY=your_gemini_api_key_here" >> .env
echo "FRONTEND_URL=http://localhost:5173" >> .env

# Start the development server
node index.js
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🐳 Running with Docker

You can easily spin up the entire stack using Docker Compose.

```bash
docker-compose up --build -d
```

Ensure you update the `docker-compose.yml` file with your `GEMINI_API_KEY` and `JWT_SECRET` before running the command.

## 📝 License

This project is open-source and available under the MIT License.
