const express = require('express');
const { generateRecipe, analyzeNutrition } = require('../controllers/aiController');

const router = express.Router();

// Routes for AI functionalities
router.post('/generate-recipe', generateRecipe);
router.post('/analyze-nutrition', analyzeNutrition);


module.exports = router;