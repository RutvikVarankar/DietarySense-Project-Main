const mongoose = require("mongoose");

const mealPlanSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please add a user reference"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
      default: "My Meal Plan",
    },
    duration: {
      type: Number,
      required: [true, "Please add plan duration"],
      min: [1, "Duration must be at least 1 day"],
      max: [30, "Duration cannot be more than 30 days"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    preferences: {
      dietaryPreference: {
        type: String,
        enum: ["", "vegetarian", "non-vegetarian", "vegan", "gluten-free", "none"],
        default: "",
      },
      maxPrepTime: {
        type: Number,
        min: [0, "Prep time cannot be negative"],
        default: 60,
      },
      maxCookTime: {
        type: Number,
        min: [0, "Cook time cannot be negative"],
        default: 60,
      },
      excludedIngredients: [
        {
          type: String,
          trim: true,
        },
      ],
      cuisine: [
        {
          type: String,
          trim: true,
        },
      ],
      maxPrepTime: {
        type: Number,
        min: [0, "Prep time cannot be negative"],
      },
      maxCookTime: {
        type: Number,
        min: [0, "Cook time cannot be negative"],
      },
    },
    days: [
      {
        date: {
          type: Date,
          required: true,
        },
        dayNumber: {
          type: Number,
          required: true,
          min: [1, "Day number must be at least 1"],
        },
        meals: {
          breakfast: [
            {
              recipe: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Recipe",
              },
              scheduledTime: {
                type: String,
                match: [
                  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                  "Please use HH:MM format",
                ],
              },
              consumed: {
                type: Boolean,
                default: false,
              },
              feedback: {
                rating: {
                  type: Number,
                  min: [1, "Rating must be at least 1"],
                  max: [5, "Rating cannot be more than 5"],
                },
                comment: {
                  type: String,
                  trim: true,
                  maxlength: [
                    500,
                    "Comment cannot be more than 500 characters",
                  ],
                },
              },
            },
          ],
          lunch: [
            {
              recipe: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Recipe",
              },
              scheduledTime: {
                type: String,
                match: [
                  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                  "Please use HH:MM format",
                ],
              },
              consumed: {
                type: Boolean,
                default: false,
              },
              feedback: {
                rating: {
                  type: Number,
                  min: [1, "Rating must be at least 1"],
                  max: [5, "Rating cannot be more than 5"],
                },
                comment: {
                  type: String,
                  trim: true,
                  maxlength: [
                    500,
                    "Comment cannot be more than 500 characters",
                  ],
                },
              },
            },
          ],
          dinner: [
            {
              recipe: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Recipe",
              },
              scheduledTime: {
                type: String,
                match: [
                  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                  "Please use HH:MM format",
                ],
              },
              consumed: {
                type: Boolean,
                default: false,
              },
              feedback: {
                rating: {
                  type: Number,
                  min: [1, "Rating must be at least 1"],
                  max: [5, "Rating cannot be more than 5"],
                },
                comment: {
                  type: String,
                  trim: true,
                  maxlength: [
                    500,
                    "Comment cannot be more than 500 characters",
                  ],
                },
              },
            },
          ],
          snacks: [
            {
              recipe: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Recipe",
              },
              scheduledTime: {
                type: String,
                match: [
                  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                  "Please use HH:MM format",
                ],
              },
              consumed: {
                type: Boolean,
                default: false,
              },
              feedback: {
                rating: {
                  type: Number,
                  min: [1, "Rating must be at least 1"],
                  max: [5, "Rating cannot be more than 5"],
                },
                comment: {
                  type: String,
                  trim: true,
                  maxlength: [
                    500,
                    "Comment cannot be more than 500 characters",
                  ],
                },
              },
            },
          ],
        },
        nutrition: {
          totalCalories: {
            type: Number,
            default: 0,
            min: [0, "Calories cannot be negative"],
          },
          totalProtein: {
            type: Number,
            default: 0,
            min: [0, "Protein cannot be negative"],
          },
          totalCarbs: {
            type: Number,
            default: 0,
            min: [0, "Carbs cannot be negative"],
          },
          totalFats: {
            type: Number,
            default: 0,
            min: [0, "Fats cannot be negative"],
          },
        },
        notes: {
          type: String,
          trim: true,
          maxlength: [1000, "Notes cannot be more than 1000 characters"],
        },
      },
    ],
    groceryList: [
      {
        ingredient: {
          type: String,
          required: [true, "Please add ingredient name"],
          trim: true,
        },
        quantity: {
          type: Number,
          required: [true, "Please add ingredient quantity"],
          min: [0, "Quantity cannot be negative"],
        },
        unit: {
          type: String,
          required: [true, "Please add ingredient unit"],
          trim: true,
        },
        category: {
          type: String,
          trim: true,
        },
        purchased: {
          type: Boolean,
          default: false,
        },
      },
    ],
    nutritionSummary: {
      totalCalories: {
        type: Number,
        default: 0,
        min: [0, "Calories cannot be negative"],
      },
      totalProtein: {
        type: Number,
        default: 0,
        min: [0, "Protein cannot be negative"],
      },
      totalCarbs: {
        type: Number,
        default: 0,
        min: [0, "Carbs cannot be negative"],
      },
      totalFats: {
        type: Number,
        default: 0,
        min: [0, "Fats cannot be negative"],
      },
      averageDailyCalories: {
        type: Number,
        default: 0,
        min: [0, "Calories cannot be negative"],
      },
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    completionRate: {
      type: Number,
      default: 0,
      min: [0, "Completion rate cannot be negative"],
      max: [100, "Completion rate cannot be more than 100"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// CORRECTED: Changed recipeSchema to mealPlanSchema
mealPlanSchema.virtual("progress").get(function () {
  const totalMeals = this.days.reduce((total, day) => {
    return (
      total +
      (day.meals.breakfast?.length || 0) +
      (day.meals.lunch?.length || 0) +
      (day.meals.dinner?.length || 0) +
      (day.meals.snacks?.length || 0)
    );
  }, 0);

  const consumedMeals = this.days.reduce((total, day) => {
    const breakfastConsumed =
      day.meals.breakfast?.filter((m) => m.consumed).length || 0;
    const lunchConsumed =
      day.meals.lunch?.filter((m) => m.consumed).length || 0;
    const dinnerConsumed =
      day.meals.dinner?.filter((m) => m.consumed).length || 0;
    const snacksConsumed =
      day.meals.snacks?.filter((m) => m.consumed).length || 0;

    return (
      total +
      breakfastConsumed +
      lunchConsumed +
      dinnerConsumed +
      snacksConsumed
    );
  }, 0);

  return totalMeals > 0 ? Math.round((consumedMeals / totalMeals) * 100) : 0;
});

// Indexes for better query performance
mealPlanSchema.index({ user: 1 });
mealPlanSchema.index({ startDate: 1 });
mealPlanSchema.index({ status: 1 });
mealPlanSchema.index({ "preferences.dietaryPreference": 1 });
mealPlanSchema.index({ isFavorite: 1 });

// Pre-save middleware to calculate end date and nutrition summary
mealPlanSchema.pre("save", function (next) {
  // Calculate end date
  if (this.startDate && this.duration && !this.endDate) {
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + this.duration - 1);
    this.endDate = endDate;
  }

  // Calculate nutrition summary
  if (this.days && this.days.length > 0) {
    const summary = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
    };

    this.days.forEach((day) => {
      summary.totalCalories += day.nutrition.totalCalories || 0;
      summary.totalProtein += day.nutrition.totalProtein || 0;
      summary.totalCarbs += day.nutrition.totalCarbs || 0;
      summary.totalFats += day.nutrition.totalFats || 0;
    });

    this.nutritionSummary = summary;
    this.nutritionSummary.averageDailyCalories =
      this.duration > 0 ? Math.round(summary.totalCalories / this.duration) : 0;
  }

  // Calculate completion rate
  const totalMeals = this.days.reduce((total, day) => {
    return (
      total +
      (day.meals.breakfast?.length || 0) +
      (day.meals.lunch?.length || 0) +
      (day.meals.dinner?.length || 0) +
      (day.meals.snacks?.length || 0)
    );
  }, 0);

  const consumedMeals = this.days.reduce((total, day) => {
    const breakfastConsumed =
      day.meals.breakfast?.filter((m) => m.consumed).length || 0;
    const lunchConsumed =
      day.meals.lunch?.filter((m) => m.consumed).length || 0;
    const dinnerConsumed =
      day.meals.dinner?.filter((m) => m.consumed).length || 0;
    const snacksConsumed =
      day.meals.snacks?.filter((m) => m.consumed).length || 0;

    return (
      total +
      breakfastConsumed +
      lunchConsumed +
      dinnerConsumed +
      snacksConsumed
    );
  }, 0);

  this.completionRate =
    totalMeals > 0 ? Math.round((consumedMeals / totalMeals) * 100) : 0;

  next();
});

// Static method to find active meal plans for a user
mealPlanSchema.statics.findActiveByUser = function (userId) {
  return this.find({
    user: userId,
    status: "active",
    endDate: { $gte: new Date() },
  });
};

// Static method to find completed meal plans
mealPlanSchema.statics.findCompletedByUser = function (userId) {
  return this.find({
    user: userId,
    status: "completed",
  });
};

// Instance method to mark meal as consumed
mealPlanSchema.methods.markMealAsConsumed = async function (
  dayIndex,
  mealType,
  mealIndex
) {
  if (this.days[dayIndex] && this.days[dayIndex].meals[mealType]) {
    const meal = this.days[dayIndex].meals[mealType][mealIndex];
    if (meal) {
      meal.consumed = true;
      return await this.save();
    }
  }
  throw new Error("Meal not found");
};

// Instance method to add feedback to meal
mealPlanSchema.methods.addMealFeedback = async function (
  dayIndex,
  mealType,
  mealIndex,
  rating,
  comment = ""
) {
  if (this.days[dayIndex] && this.days[dayIndex].meals[mealType]) {
    const meal = this.days[dayIndex].meals[mealType][mealIndex];
    if (meal) {
      meal.feedback = { rating, comment };
      return await this.save();
    }
  }
  throw new Error("Meal not found");
};

module.exports = mongoose.model("MealPlan", mealPlanSchema);
