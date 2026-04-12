const Recipe = require("../models/Recipe");

const generateMealPlan = async (user, duration = 7, preferences = {}) => {
  try {
    const userProfile = user.profile;

    if (!userProfile.dailyCalories) {
      throw new Error(
        "User profile incomplete. Please complete profile first."
      );
    }

    // Build basic query filters
    const queryFilters = {
      isApproved: true,
    };

    // Filter by dietary preference if set
    if (
      userProfile.dietaryPreference &&
      userProfile.dietaryPreference !== "none"
    ) {
      queryFilters.dietaryTags = { $in: [userProfile.dietaryPreference] };
    }

    // Filter by cuisine preferences if set
    if (preferences.cuisine && preferences.cuisine.length > 0) {
      queryFilters.cuisine = { $in: preferences.cuisine };
    }

    // Filter by excluded ingredients if set
    if (preferences.excludedIngredients && preferences.excludedIngredients.length > 0) {
      queryFilters["ingredients.name"] = { $nin: preferences.excludedIngredients };
    }

    // Filter by max preparation time if set
    if (preferences.maxPrepTime && preferences.maxPrepTime > 0) {
      queryFilters.prepTime = { $lte: preferences.maxPrepTime };
    }

    // Filter by max cooking time if set
    if (preferences.maxCookTime && preferences.maxCookTime > 0) {
      queryFilters.cookTime = { $lte: preferences.maxCookTime };
    }

    // Get recipes that match the filters
    const matchingRecipes = await Recipe.find(queryFilters).limit(50);

    if (matchingRecipes.length === 0) {
      throw new Error(
        "No recipes found matching your dietary requirements. Please adjust your preferences."
      );
    }

    // Generate meal plan days
    const days = [];
    const startDate = new Date();

    for (let i = 0; i < duration; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      // Select recipes based on available count
      const numMeals = Math.min(3, matchingRecipes.length);
      const selectedRecipes = getRandomRecipes(matchingRecipes, numMeals);

      // Create meal structure
      const meals = {
        breakfast: [],
        lunch: [],
        dinner: [],

      };

      // Assign recipes to meals
      if (selectedRecipes[0]) meals.breakfast = [{ recipe: selectedRecipes[0]._id }];
      if (selectedRecipes[1]) meals.lunch = [{ recipe: selectedRecipes[1]._id }];
      if (selectedRecipes[2]) meals.dinner = [{ recipe: selectedRecipes[2]._id }];


      const dailyNutrition = calculateDailyNutrition(selectedRecipes);

      days.push({
        date: currentDate,
        dayNumber: i + 1,
        meals,
        nutrition: dailyNutrition,
      });
    }

    // Generate simple grocery list
    const groceryList = generateSimpleGroceryList();

    // Calculate nutrition summary
    const nutritionSummary = calculateNutritionSummary(days);

    return {
      title: `${duration}-Day ${userProfile.dietaryPreference ? userProfile.dietaryPreference + " " : ""
        }Meal Plan`,
      duration,
      preferences: preferences,
      days,
      groceryList,
      nutritionSummary,
      status: "active",
      user: user._id,
    };
  } catch (error) {
    console.error("Meal plan generation error:", error);
    throw new Error(`Meal plan generation failed: ${error.message}`);
  }
};

// Helper function to get random recipes
const getRandomRecipes = (recipes, count) => {
  const shuffled = [...recipes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to calculate daily nutrition
const calculateDailyNutrition = (recipes) => {
  return recipes.reduce(
    (total, recipe) => ({
      totalCalories: total.totalCalories + (recipe.nutrition.calories || 0),
      totalProtein: total.totalProtein + (recipe.nutrition.protein || 0),
      totalCarbs: total.totalCarbs + (recipe.nutrition.carbs || 0),
      totalFats: total.totalFats + (recipe.nutrition.fats || 0),
    }),
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
    }
  );
};

// Helper function to generate simple grocery list
const generateSimpleGroceryList = () => {
  return [
    {
      ingredient: "Mixed Vegetables",
      quantity: 500,
      unit: "g",
      category: "produce",
      purchased: false,
    },
    {
      ingredient: "Chicken Breast",
      quantity: 1000,
      unit: "g",
      category: "meat",
      purchased: false,
    },
    {
      ingredient: "Brown Rice",
      quantity: 500,
      unit: "g",
      category: "grains",
      purchased: false,
    },
    {
      ingredient: "Olive Oil",
      quantity: 1,
      unit: "bottle",
      category: "pantry",
      purchased: false,
    },
    {
      ingredient: "Eggs",
      quantity: 12,
      unit: "pieces",
      category: "dairy",
      purchased: false,
    },
    {
      ingredient: "Whole Wheat Bread",
      quantity: 1,
      unit: "loaf",
      category: "bakery",
      purchased: false,
    },
  ];
};

// Helper function to calculate nutrition summary
const calculateNutritionSummary = (days) => {
  const summary = days.reduce(
    (total, day) => ({
      totalCalories: total.totalCalories + (day.nutrition.totalCalories || 0),
      totalProtein: total.totalProtein + (day.nutrition.totalProtein || 0),
      totalCarbs: total.totalCarbs + (day.nutrition.totalCarbs || 0),
      totalFats: total.totalFats + (day.nutrition.totalFats || 0),
    }),
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
    }
  );

  summary.averageDailyCalories =
    days.length > 0 ? Math.round(summary.totalCalories / days.length) : 0;

  return summary;
};

module.exports = { generateMealPlan };
