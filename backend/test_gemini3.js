require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash"});
async function run() {
  try {
    const result = await model.generateContent("hello");
    const response = await result.response;
    console.log(response.text());
  } catch (error) {
    console.error("ERROR:", error);
  }
}
run();
