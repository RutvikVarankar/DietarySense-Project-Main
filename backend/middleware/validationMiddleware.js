const { body, validationResult, param, query } = require("express-validator");

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Auth validation rules
exports.validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  handleValidationErrors,
];

exports.validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

// User validation rules
exports.validateUserProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("age")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be between 1 and 120"),

  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),

  body("height")
    .optional()
    .isFloat({ min: 50, max: 250 })
    .withMessage("Height must be between 50 and 250 cm"),

  body("weight")
    .optional()
    .isFloat({ min: 20, max: 300 })
    .withMessage("Weight must be between 20 and 300 kg"),

  body("goal")
    .optional()
    .isIn(["weight_loss", "maintenance", "muscle_gain"])
    .withMessage("Goal must be weight_loss, maintenance, or muscle_gain"),

  body("activityLevel")
    .optional()
    .isIn(["sedentary", "light", "moderate", "active", "very_active"])
    .withMessage("Invalid activity level"),

  body("dietaryPreference")
    .optional()
    .isIn(["vegetarian", "non-vegetarian", "vegan", "gluten-free"])
    .withMessage("Invalid dietary preference"),

  body("allergies")
    .optional()
    .isArray()
    .withMessage("Allergies must be an array"),

  body("restrictions")
    .optional()
    .isArray()
    .withMessage("Restrictions must be an array"),

  handleValidationErrors,
];

exports.validateCalorieCalculation = [
  body("age")
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be between 1 and 120"),

  body("gender")
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),

  body("height")
    .isFloat({ min: 50, max: 250 })
    .withMessage("Height must be between 50 and 250 cm"),

  body("weight")
    .isFloat({ min: 20, max: 300 })
    .withMessage("Weight must be between 20 and 300 kg"),

  body("goal")
    .isIn(["weight_loss", "maintenance", "muscle_gain"])
    .withMessage("Goal must be weight_loss, maintenance, or muscle_gain"),

  body("activityLevel")
    .isIn(["sedentary", "light", "moderate", "active", "very_active"])
    .withMessage("Invalid activity level"),

  handleValidationErrors,
];

// Recipe validation rules
exports.validateRecipe = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Recipe title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be less than 500 characters"),

  body("ingredients")
    .isArray({ min: 1 })
    .withMessage("At least one ingredient is required"),

  body("ingredients.*.name")
    .trim()
    .notEmpty()
    .withMessage("Ingredient name is required"),

  body("ingredients.*.quantity")
    .isFloat({ min: 0 })
    .withMessage("Quantity must be a positive number"),

  body("ingredients.*.unit").trim().notEmpty().withMessage("Unit is required"),

  body("instructions")
    .isArray({ min: 1 })
    .withMessage("At least one instruction is required"),

  body("instructions.*.step")
    .isInt({ min: 1 })
    .withMessage("Instruction step must be a positive integer"),

  body("instructions.*.text")
    .trim()
    .notEmpty()
    .withMessage("Instruction text is required"),

  body("instructions.*.duration")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Instruction duration must be a non-negative integer"),

  body("prepTime")
    .isInt({ min: 0 })
    .withMessage("Prep time must be a positive number"),

  body("cookTime")
    .isInt({ min: 0 })
    .withMessage("Cook time must be a positive number"),

  body("servings")
    .isInt({ min: 1 })
    .withMessage("Servings must be at least 1"),

  body("difficulty")
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be easy, medium, or hard"),

  body("dietaryTags")
    .optional()
    .isArray()
    .withMessage("Dietary tags must be an array"),

  body("dietaryTags.*")
    .isIn([
      "vegetarian",
      "vegan",
      "gluten-free",
      "dairy-free",
      "nut-free",
      "low-carb",
      "high-protein",
      "low-fat",
      "keto",
      "paleo",
      "mediterranean",
    ])
    .withMessage("Invalid dietary tag"),

  body("nutrition.calories")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Calories must be a positive number"),

  body("nutrition.protein")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Protein must be a positive number"),

  body("nutrition.carbs")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Carbs must be a positive number"),

  body("nutrition.fats")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Fats must be a positive number"),

  handleValidationErrors,
];

// Meal Plan validation rules
exports.validateMealPlan = [
  body("duration")
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage("Duration must be between 1 and 30 days"),

  body("preferences.dietaryPreference")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true;
      return ["vegetarian", "non-vegetarian", "vegan", "gluten-free"].includes(value);
    })
    .withMessage("Invalid dietary preference"),

  body("preferences.maxPrepTime")
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage("Max prep time must be between 1-180 minutes"),

  body("preferences.maxCookTime")
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage("Max cook time must be between 1-180 minutes"),

  body("preferences.excludedIngredients")
    .optional()
    .isArray()
    .withMessage("Excluded ingredients must be an array"),

  body("preferences.cuisine")
    .optional()
    .isArray()
    .withMessage("Cuisine must be an array"),

  handleValidationErrors,
];

// ID parameter validation
exports.validateId = [
  param("id").isMongoId().withMessage("Invalid ID format"),

  handleValidationErrors,
];

// Pagination validation
exports.validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  handleValidationErrors,
];

// Recipe query validation
exports.validateRecipeQuery = [
  query("search")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Search query too long"),

  query("maxPrepTime")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Max prep time must be a positive number"),

  query("maxCookTime")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Max cook time must be a positive number"),

  query("maxCalories")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Max calories must be a positive number"),

  query("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be easy, medium, or hard"),

  query("sortBy")
    .optional()
    .isIn(["title", "createdAt", "prepTime", "cookTime", "nutrition.calories"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),

  handleValidationErrors,
];

// Admin validation rules
exports.validateAdminActions = [
  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Reason must be less than 500 characters"),

  handleValidationErrors,
];
