const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
async function t() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
  try {
    // In @google/generative-ai, listing models is done via the client
    // but wait, the simple SDK might not have a direct listModels.
    // Actually, it's not in the 'GoogleGenerativeAI' class directly in some versions.
    // It's usually in the underlying REST call.
    // However, we can try to hit the listModels endpoint manually.
    const apiKey = process.env.GEMINI_API_KEY.trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
      console.log("AVAILABLE_MODELS:", data.models.map(m => m.name).join(", "));
    } else {
      console.log("NO_MODELS_FOUND:", JSON.stringify(data));
    }
  } catch (e) {
    console.log("LIST_MODELS_FAIL:", e.message);
  }
}
t();
