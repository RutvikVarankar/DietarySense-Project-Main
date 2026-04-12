const MealPlan = require("../models/MealPlan");
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const { generateMealPlan } = require("../utils/generateMealPlan");
const { validationResult } = require("express-validator");

// @desc    Generate meal plan
// @route   POST /api/mealplans/generate
// @access  Private
exports.generateMealPlan = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { duration = 7, preferences = {} } = req.body;

    // Get user with profile data
    const user = await User.findById(req.user.id);
    if (!user.profile.dailyCalories) {
      return res.status(400).json({
        success: false,
        message: "Please complete your profile first to generate meal plans",
      });
    }

    // Generate meal plan based on user preferences and nutrition targets
    const mealPlanData = await generateMealPlan(user, duration, preferences);

    // Create meal plan document
    const mealPlan = await MealPlan.create({
      user: req.user.id,
      duration,
      preferences,
      ...mealPlanData,
    });

    // Populate recipe data before returning
    const populatedMealPlan = await MealPlan.findById(mealPlan._id).populate(
      "days.meals.breakfast.recipe days.meals.lunch.recipe days.meals.dinner.recipe"
    );

    res.status(201).json({
      success: true,
      message: "Meal plan generated successfully",
      data: populatedMealPlan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user meal plans
// @route   GET /api/mealplans
// @access  Private
exports.getUserMealPlans = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const mealPlans = await MealPlan.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MealPlan.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: mealPlans.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: mealPlans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single meal plan
// @route   GET /api/mealplans/:id
// @access  Private
exports.getMealPlan = async (req, res, next) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id).populate(
      "days.meals.breakfast days.meals.lunch days.meals.dinner"
    );

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    // Check if user owns the meal plan or is admin
    if (mealPlan.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this meal plan",
      });
    }

    res.status(200).json({
      success: true,
      data: mealPlan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meal plan
// @route   PUT /api/mealplans/:id
// @access  Private
exports.updateMealPlan = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    let mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    // Check if user owns the meal plan
    if (mealPlan.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this meal plan",
      });
    }

    mealPlan = await MealPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(
      "days.meals.breakfast days.meals.lunch days.meals.dinner"
    );

    res.status(200).json({
      success: true,
      message: "Meal plan updated successfully",
      data: mealPlan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete meal plan
// @route   DELETE /api/mealplans/:id
// @access  Private
exports.deleteMealPlan = async (req, res, next) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    // Check if user owns the meal plan
    if (mealPlan.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this meal plan",
      });
    }

    await MealPlan.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Meal plan deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get grocery list for meal plan
// @route   GET /api/mealplans/:id/grocery-list
// @access  Private
exports.getGroceryList = async (req, res, next) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id).populate(
      "days.meals.breakfast days.meals.lunch days.meals.dinner"
    );

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    // Check if user owns the meal plan
    if (mealPlan.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this meal plan",
      });
    }

    // Generate grocery list from meal plan
    const groceryList = generateGroceryListFromMealPlan(mealPlan);

    res.status(200).json({
      success: true,
      data: groceryList,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate grocery list
const generateGroceryListFromMealPlan = (mealPlan) => {
  const ingredientsMap = new Map();

  mealPlan.days.forEach((day) => {
    const meals = ["breakfast", "lunch", "dinner"];

    meals.forEach((mealType) => {
      const meal = day.meals[mealType];
      if (meal && Array.isArray(meal)) {
        meal.forEach((recipe) => {
          if (recipe.ingredients) {
            recipe.ingredients.forEach((ingredient) => {
              const key = ingredient.name.toLowerCase();
              if (ingredientsMap.has(key)) {
                const existing = ingredientsMap.get(key);
                existing.quantity += ingredient.quantity || 0;
              } else {
                ingredientsMap.set(key, {
                  name: ingredient.name,
                  quantity: ingredient.quantity || 0,
                  unit: ingredient.unit || "unit",
                  category: ingredient.category || "other",
                });
              }
            });
          }
        });
      }
    });
  });

  return Array.from(ingredientsMap.values());
};
