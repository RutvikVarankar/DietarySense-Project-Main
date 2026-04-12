const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Generate recipe using AI service
exports.generateRecipe = async (req, res, next) => {
  try {
    const { ingredients, dietary_preferences, cuisine, meal_type } = req.body;

    const response = await axios.post(`${AI_SERVICE_URL}/generate-recipe`, {
      ingredients,
      dietary_preferences,
      cuisine,
      meal_type
    });

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('AI Service Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recipe from AI service'
    });
  }
};

// Analyze nutrition using AI service
exports.analyzeNutrition = async (req, res, next) => {
  try {
    const { food_description } = req.body;

    const response = await axios.post(`${AI_SERVICE_URL}/analyze-nutrition`, {
      food_description
    });

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('AI Service Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze nutrition from AI service'
    });
  }
};

// Chat with AI assistant
exports.chatWithAI = async (req, res, next) => {
  try {
    const { message, context } = req.body;

    console.log(`[AI Service] Sending chat request to ${AI_SERVICE_URL}/chat`);
    console.log(`[AI Service] Message: ${message}`);

    const response = await axios.post(`${AI_SERVICE_URL}/chat`, {
      message,
      context
    }, { timeout: 30000 });

    console.log(`[AI Service] Response received:`, response.data);

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error(`[AI Service Error] Status:`, error.response?.status);
    console.error(`[AI Service Error] Message:`, error.message);
    console.error(`[AI Service Error] Data:`, error.response?.data);
    
    res.status(500).json({
      success: false,
      message: error.response?.data?.detail || 'Failed to get response from AI chat service',
      error: error.message
    });
  }
};