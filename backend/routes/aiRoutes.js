const express = require('express');
const { generateRecipe, analyzeNutrition, chatWithAI } = require('../controllers/aiController');

const router = express.Router();

// Routes for AI functionalities
router.post('/generate-recipe', generateRecipe);
router.post('/analyze-nutrition', analyzeNutrition);
router.post('/chat', chatWithAI);

module.exports = router;