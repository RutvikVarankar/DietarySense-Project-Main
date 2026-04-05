const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
require('dotenv').config();

const sampleRecipes = [
  {
    title: "Greek Yogurt Parfait",
    description: "Protein-rich layered yogurt parfait with granola and berries",
    ingredients: [
      {
        name: "Greek Yogurt",
        quantity: 150,
        unit: "g",
        nutrition: { calories: 100, protein: 15, carbs: 6, fats: 0 }
      },
      {
        name: "Granola",
        quantity: 30,
        unit: "g",
        nutrition: { calories: 140, protein: 4, carbs: 20, fats: 5 }
      },
      {
        name: "Mixed Berries",
        quantity: 100,
        unit: "g",
        nutrition: { calories: 57, protein: 1, carbs: 14, fats: 0 }
      },
      {
        name: "Honey",
        quantity: 10,
        unit: "g",
        nutrition: { calories: 30, protein: 0, carbs: 8, fats: 0 }
      }
    ],
    instructions: [
      { step: 1, text: "Layer yogurt, granola, and berries in a glass" },
      { step: 2, text: "Drizzle honey on top" },
      { step: 3, text: "Serve immediately" }
    ],
    nutrition: {
      calories: 327,
      protein: 20,
      carbs: 48,
      fats: 5,
      fiber: 4
    },
    dietaryTags: ["high-protein", "vegetarian"],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: "easy",
    cuisine: "International"
  },
  {
    title: "Mixed Nuts Trail Mix",
    description: "Healthy snack mix with nuts and dried fruits",
    ingredients: [
      {
        name: "Almonds",
        quantity: 30,
        unit: "g",
        nutrition: { calories: 174, protein: 6, carbs: 6, fats: 15 }
      },
      {
        name: "Walnuts",
        quantity: 20,
        unit: "g",
        nutrition: { calories: 131, protein: 3, carbs: 3, fats: 13 }
      },
      {
        name: "Dried Cranberries",
        quantity: 20,
        unit: "g",
        nutrition: { calories: 71, protein: 0, carbs: 18, fats: 0 }
      },
      {
        name: "Pumpkin Seeds",
        quantity: 20,
        unit: "g",
        nutrition: { calories: 112, protein: 6, carbs: 11, fats: 5 }
      }
    ],
    instructions: [
      { step: 1, text: "Mix all ingredients in a bowl" },
      { step: 2, text: "Portion into snack bags" },
      { step: 3, text: "Store in airtight container" }
    ],
    nutrition: {
      calories: 488,
      protein: 15,
      carbs: 38,
      fats: 33,
      fiber: 6
    },
    dietaryTags: ["vegan", "gluten-free", "high-protein"],
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    difficulty: "easy",
    cuisine: "International"
  },
  {
    title: "Oatmeal with Fresh Fruits",
    description: "A healthy and filling breakfast with oats and seasonal fruits",
    ingredients: [
      {
        name: "Rolled Oats",
        quantity: 50,
        unit: "g",
        nutrition: { calories: 194, protein: 6, carbs: 33, fats: 3 }
      },
      {
        name: "Banana",
        quantity: 1,
        unit: "piece",
        nutrition: { calories: 105, protein: 1, carbs: 27, fats: 0 }
      },
      {
        name: "Mixed Berries",
        quantity: 100,
        unit: "g",
        nutrition: { calories: 57, protein: 1, carbs: 14, fats: 0 }
      },
      {
        name: "Almond Milk",
        quantity: 200,
        unit: "ml",
        nutrition: { calories: 60, protein: 1, carbs: 8, fats: 2 }
      }
    ],
    instructions: [
      { step: 1, text: "Combine oats and almond milk in a saucepan" },
      { step: 2, text: "Cook over medium heat for 5-7 minutes, stirring occasionally" },
      { step: 3, text: "Slice banana and wash berries" },
      { step: 4, text: "Serve oatmeal topped with fresh fruits" }
    ],
    nutrition: {
      calories: 416,
      protein: 9,
      carbs: 82,
      fats: 5,
      fiber: 8
    },
    dietaryTags: ["vegetarian", "vegan", "gluten-free"],
    prepTime: 5,
    cookTime: 7,
    servings: 1,
    difficulty: "easy",
    cuisine: "International"
  },
  {
    title: "Grilled Chicken Salad",
    description: "Protein-packed salad with grilled chicken and fresh vegetables",
    ingredients: [
      {
        name: "Chicken Breast",
        quantity: 150,
        unit: "g",
        nutrition: { calories: 248, protein: 46, carbs: 0, fats: 5 }
      },
      {
        name: "Mixed Greens",
        quantity: 100,
        unit: "g",
        nutrition: { calories: 25, protein: 2, carbs: 5, fats: 0 }
      },
      {
        name: "Cherry Tomatoes",
        quantity: 100,
        unit: "g",
        nutrition: { calories: 18, protein: 1, carbs: 4, fats: 0 }
      },
      {
        name: "Cucumber",
        quantity: 100,
        unit: "g",
        nutrition: { calories: 15, protein: 1, carbs: 3, fats: 0 }
      },
      {
        name: "Olive Oil",
        quantity: 15,
        unit: "ml",
        nutrition: { calories: 119, protein: 0, carbs: 0, fats: 14 }
      }
    ],
    instructions: [
      { step: 1, text: "Season chicken breast with salt and pepper" },
      { step: 2, text: "Grill chicken for 6-8 minutes each side" },
      { step: 3, text: "Chop vegetables and prepare salad base" },
      { step: 4, text: "Slice grilled chicken and add to salad" },
      { step: 5, text: "Drizzle with olive oil and serve" }
    ],
    nutrition: {
      calories: 425,
      protein: 50,
      carbs: 12,
      fats: 19,
      fiber: 4
    },
    dietaryTags: ["high-protein", "low-carb"],
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    difficulty: "easy",
    cuisine: "Mediterranean"
  },
  {
    title: "Vegetable Stir Fry",
    description: "Quick and healthy vegetable stir fry with tofu",
    ingredients: [
      {
        name: "Tofu",
        quantity: 200,
        unit: "g",
        nutrition: { calories: 180, protein: 20, carbs: 4, fats: 10 }
      },
      {
        name: "Broccoli",
        quantity: 150,
        unit: "g",
        nutrition: { calories: 51, protein: 4, carbs: 10, fats: 1 }
      },
      {
        name: "Bell Peppers",
        quantity: 100,
        unit: "g",
        nutrition: { calories: 31, protein: 1, carbs: 6, fats: 0 }
      },
      {
        name: "Carrots",
        quantity: 100,
        unit: "g",
        nutrition: { calories: 41, protein: 1, carbs: 10, fats: 0 }
      },
      {
        name: "Soy Sauce",
        quantity: 30,
        unit: "ml",
        nutrition: { calories: 18, protein: 3, carbs: 2, fats: 0 }
      }
    ],
    instructions: [
      { step: 1, text: "Press and cube tofu" },
      { step: 2, text: "Chop all vegetables into bite-sized pieces" },
      { step: 3, text: "Stir-fry tofu until golden brown" },
      { step: 4, text: "Add vegetables and stir-fry for 5-7 minutes" },
      { step: 5, text: "Add soy sauce and cook for another 2 minutes" }
    ],
    nutrition: {
      calories: 321,
      protein: 28,
      carbs: 32,
      fats: 11,
      fiber: 8
    },
    dietaryTags: ["vegetarian", "vegan", "high-protein"],
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    difficulty: "medium",
    cuisine: "Asian"
  }
];

const seedRecipes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing recipes
    await Recipe.deleteMany({});
    console.log('Cleared existing recipes');

    // Get admin user to set as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Add createdBy field to all recipes
    const recipesWithCreator = sampleRecipes.map(recipe => ({
      ...recipe,
      createdBy: adminUser._id,
      isApproved: true
    }));

    // Insert sample recipes
    await Recipe.insertMany(recipesWithCreator);
    console.log('Sample recipes added successfully');

    // Display added recipes
    const count = await Recipe.countDocuments();
    console.log(`Total recipes in database: ${count}`);

  } catch (error) {
    console.error('Error seeding recipes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  seedRecipes();
}

module.exports = { sampleRecipes, seedRecipes };