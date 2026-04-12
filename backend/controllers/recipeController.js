const Recipe = require("../models/Recipe");
const { cloudinaryUtils } = require("../config/cloudinary");
const { validationResult } = require("express-validator"); // Recipe already imported at top

// @desc    Get all recipes with filtering and pagination
// @route   GET /api/recipes
// @access  Public
exports.getRecipes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      dietaryTags,
      maxPrepTime,
      maxCookTime,
      difficulty,
      maxCalories,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { isApproved: true };

    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Dietary tags filter
    if (dietaryTags) {
      const tags = Array.isArray(dietaryTags) ? dietaryTags : [dietaryTags];
      filter.dietaryTags = { $in: tags };
    }

    // Max prep time filter
    if (maxPrepTime) {
      filter.prepTime = { $lte: parseInt(maxPrepTime) };
    }

    // Max cook time filter
    if (maxCookTime) {
      filter.cookTime = { $lte: parseInt(maxCookTime) };
    }

    // Difficulty filter
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Max calories filter
    if (maxCalories) {
      filter["nutrition.calories"] = { $lte: parseInt(maxCalories) };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const recipes = await Recipe.find(filter)
      .populate("createdBy", "name email")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Recipe.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: recipes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: recipes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
exports.getRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new recipe
// @route   POST /api/recipes
// @access  Private
exports.createRecipe = async (req, res, next) => {
  try {
    // For JSON request, body is already parsed object
    if (req.body.ingredients && typeof req.body.ingredients === 'string') {
      req.body.ingredients = JSON.parse(req.body.ingredients);
    }
    if (req.body.instructions && typeof req.body.instructions === 'string') {
      req.body.instructions = JSON.parse(req.body.instructions);
    }
    if (req.body.nutrition && typeof req.body.nutrition === 'string') {
      req.body.nutrition = JSON.parse(req.body.nutrition);
      // Convert nutrition to numbers
      Object.keys(req.body.nutrition).forEach(key => {
        req.body.nutrition[key] = parseFloat(req.body.nutrition[key]) || 0;
      });
    }
    if (req.body.dietaryTags && typeof req.body.dietaryTags === 'string') {
      req.body.dietaryTags = JSON.parse(req.body.dietaryTags);
    }
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = JSON.parse(req.body.tags);
    }

    // Convert numeric FormData fields (strings → numbers)
    const numericFields = ['prepTime', 'cookTime', 'servings'];
    numericFields.forEach(field => {
      req.body[field] = parseInt(req.body[field]) || 1; // servings min=1
    });

    // Ensure required fields have defaults
    req.body.title = req.body.title || 'Untitled Recipe';
    req.body.difficulty = req.body.difficulty || 'easy';

    // Ensure nutrition has required fields
    if (!req.body.nutrition || typeof req.body.nutrition !== 'object') {
      req.body.nutrition = {};
    }
    const requiredNutrition = ['calories', 'protein', 'carbs', 'fats'];
    requiredNutrition.forEach(key => {
      if (req.body.nutrition[key] === undefined || req.body.nutrition[key] === '') {
        req.body.nutrition[key] = 0;
      } else {
        req.body.nutrition[key] = parseFloat(req.body.nutrition[key]) || 0;
      }
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      console.log("Request body:", req.body);
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Add createdBy field
    req.body.createdBy = req.user.id;
    req.body.isApproved = false; // Always pending for non-admin, admin can approve later


    // Calculate nutrition if not provided
    if (req.body.ingredients && !req.body.nutrition) {
      const nutrition = calculateNutritionFromIngredients(req.body.ingredients);
      req.body.nutrition = nutrition;
    }

    const recipe = await Recipe.create(req.body);

    res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private
exports.updateRecipe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // Check if user owns the recipe or is admin
    if (
      recipe.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this recipe",
      });
    }

    // Preserve existing nutrition values if not explicitly changed
    if (req.body.nutrition) {
      // Only update specific nutrition fields if provided
      recipe.nutrition = { ...recipe.nutrition, ...req.body.nutrition };
      delete req.body.nutrition; // Remove from req.body to avoid overwriting
    }

    recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Recipe updated successfully",
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private
exports.deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // Check if user owns the recipe or is admin
    if (
      recipe.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this recipe",
      });
    }

    // Delete image from Cloudinary if exists
    if (recipe.image) {
      const publicId = cloudinaryUtils.getPublicIdFromUrl(recipe.image);
      if (publicId) {
        await cloudinaryUtils.deleteImage(publicId);
      }
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload recipe image
// @route   POST /api/recipes/:id/image
// @access  Private
exports.uploadRecipeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file",
      });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // Check if user owns the recipe or is admin
    if (
      recipe.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this recipe",
      });
    }

    // Delete old image from Cloudinary if exists
    if (recipe.image) {
      const publicId = cloudinaryUtils.getPublicIdFromUrl(recipe.image);
      if (publicId) {
        await cloudinaryUtils.deleteImage(publicId);
      }
    }

    // Update recipe with new image URL
    recipe.image = req.file.path;
    await recipe.save();

    res.status(200).json({
      success: true,
      message: "Recipe image uploaded successfully",
      data: {
        image: recipe.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate nutrition from ingredients
const calculateNutritionFromIngredients = (ingredients) => {
  const nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
  };

  ingredients.forEach((ingredient) => {
    nutrition.calories += ingredient.calories || 0;
    nutrition.protein += ingredient.protein || 0;
    nutrition.carbs += ingredient.carbs || 0;
    nutrition.fats += ingredient.fats || 0;
    nutrition.fiber += ingredient.fiber || 0;
  });

  return nutrition;
};

// @desc    Add/Update rating and review for recipe
// @route   POST /api/recipes/:id/ratings  
// @access  Private
exports.addRating = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    const { rating, comment } = req.body;
    await recipe.addRating(req.user.id, rating, comment || "");


    const updatedRecipe = await Recipe.findById(recipe._id);
    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: updatedRecipe,
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Generate PDF for recipe
// @route   GET /api/recipes/:id/pdf
// @access  Public
exports.generateRecipePDF = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    // Generate PDF using pdfkit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    // Set response headers
    const title = (recipe.title || 'Recipe').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text(recipe.title || 'Untitled Recipe', { align: 'center' });
    doc.moveDown();

    if (recipe.description) {
      doc.fontSize(12).text(recipe.description);
      doc.moveDown();
    }

    // Basic info
    doc.fontSize(14).text('Recipe Information:');
    doc.fontSize(10);
    doc.text(`Prep Time: ${recipe.prepTime || 0} minutes`);
    doc.text(`Cook Time: ${recipe.cookTime || 0} minutes`);
    doc.text(`Difficulty: ${recipe.difficulty || 'N/A'}`);
    doc.text(`Servings: ${recipe.servings || 1}`);
    doc.moveDown();

    // Nutrition
    doc.fontSize(14).text('Nutrition per Serving:');
    doc.fontSize(10);
    doc.text(`Calories: ${recipe.nutrition?.calories || 0}`);
    doc.text(`Protein: ${recipe.nutrition?.protein || 0}g`);
    doc.text(`Carbohydrates: ${recipe.nutrition?.carbs || 0}g`);
    doc.text(`Fats: ${recipe.nutrition?.fats || 0}g`);
    doc.moveDown();

    // Ingredients
    doc.fontSize(14).text('Ingredients:');
    doc.fontSize(10);
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      recipe.ingredients.forEach((ingredient, index) => {
        if (ingredient && ingredient.name) {
          doc.text(`${index + 1}. ${ingredient.name} - ${ingredient.quantity || 0} ${ingredient.unit || ''}`);
        }
      });
    } else {
      doc.text('No ingredients listed.');
    }
    doc.moveDown();

    // Instructions
    doc.fontSize(14).text('Instructions:');
    doc.fontSize(10);
    if (recipe.instructions && Array.isArray(recipe.instructions)) {
      recipe.instructions.forEach((instruction, index) => {
        if (instruction && instruction.text) {
          doc.text(`${index + 1}. ${instruction.text}`);
          if (instruction.duration) {
            doc.text(`   Duration: ${instruction.duration} minutes`);
          }
        }
      });
    } else {
      doc.text('No instructions listed.');
    }

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    next(error);
  }
};
