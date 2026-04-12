const mongoose = require("mongoose");

const recipeSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a recipe title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    ingredients: [
      {
        name: {
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
        nutrition: {
          calories: {
            type: Number,
            default: 0,
            min: [0, "Calories cannot be negative"],
          },
          protein: {
            type: Number,
            default: 0,
            min: [0, "Protein cannot be negative"],
          },
          carbs: {
            type: Number,
            default: 0,
            min: [0, "Carbs cannot be negative"],
          },
          fats: {
            type: Number,
            default: 0,
            min: [0, "Fats cannot be negative"],
          },
          fiber: {
            type: Number,
            default: 0,
            min: [0, "Fiber cannot be negative"],
          },
        },
      },
    ],
    instructions: [
      {
        step: {
          type: Number,
          required: true,
        },
        text: {
          type: String,
          required: [true, "Please add instruction text"],
          trim: true,
          maxlength: [500, "Instruction cannot be more than 500 characters"],
        },
      },
    ],
    nutrition: {
      calories: {
        type: Number,
        required: [true, "Please add calories information"],
        min: [0, "Calories cannot be negative"],
      },
      protein: {
        type: Number,
        required: [true, "Please add protein information"],
        min: [0, "Protein cannot be negative"],
      },
      carbs: {
        type: Number,
        required: [true, "Please add carbs information"],
        min: [0, "Carbs cannot be negative"],
      },
      fats: {
        type: Number,
        required: [true, "Please add fats information"],
        min: [0, "Fats cannot be negative"],
      },
      fiber: {
        type: Number,
        default: 0,
        min: [0, "Fiber cannot be negative"],
      },
      sugar: {
        type: Number,
        default: 0,
        min: [0, "Sugar cannot be negative"],
      },
      sodium: {
        type: Number,
        default: 0,
        min: [0, "Sodium cannot be negative"],
      },
    },
    dietaryTags: [
      {
        type: String,
        enum: [
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
        ],
      },
    ],
    prepTime: {
      type: Number, // in minutes
      required: [true, "Please add preparation time"],
      min: [0, "Prep time cannot be negative"],
    },
    cookTime: {
      type: Number, // in minutes
      required: [true, "Please add cooking time"],
      min: [0, "Cook time cannot be negative"],
    },
    totalTime: {
      type: Number, // in minutes
      min: [0, "Total time cannot be negative"],
    },
    servings: {
      type: Number,
      required: [true, "Please add number of servings"],
      min: [1, "Servings must be at least 1"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: [true, "Please add difficulty level"],
    },
    cuisine: {
      type: String,
      trim: true,
    },
    videoLink: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true; // Image is optional
          return /^https?:\/\/.+\..+/.test(v);
        },
        message: "Please provide a valid image URL",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot be more than 500 characters"],
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: [1, "Rating must be at least 1"],
          max: [5, "Rating cannot be more than 5"],
        },
        comment: {
          type: String,
          trim: true,
          maxlength: [500, "Comment cannot be more than 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot be more than 5"],
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total time (prep + cook)
recipeSchema.virtual("totalTimeCalc").get(function () {
  return (this.prepTime || 0) + (this.cookTime || 0);
});

// Virtual for calories per serving
recipeSchema.virtual("caloriesPerServing").get(function () {
  if (this.servings && this.nutrition.calories) {
    return Math.round(this.nutrition.calories / this.servings);
  }
  return 0;
});

// Indexes for better query performance
recipeSchema.index({ title: "text", description: "text" });
recipeSchema.index({ dietaryTags: 1 });
recipeSchema.index({ "nutrition.calories": 1 });
recipeSchema.index({ difficulty: 1 });
recipeSchema.index({ isApproved: 1 });
recipeSchema.index({ createdBy: 1 });
recipeSchema.index({ averageRating: -1 });
recipeSchema.index({ popularity: -1 });

// Pre-save middleware to calculate total time and update average rating
recipeSchema.pre("save", function (next) {
  // Calculate total time if not provided
  if (!this.totalTime) {
    this.totalTime = (this.prepTime || 0) + (this.cookTime || 0);
  }

  // Calculate average rating
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce(
      (sum, rating) => sum + rating.rating,
      0
    );
    this.averageRating = parseFloat(
      (totalRating / this.ratings.length).toFixed(1)
    );
    this.ratingCount = this.ratings.length;
  }

  next();
});

// Static method to get recipes by dietary tags
recipeSchema.statics.findByDietaryTags = function (tags) {
  return this.find({ dietaryTags: { $in: tags } });
};

// Static method to get high protein recipes
recipeSchema.statics.findHighProtein = function (minProtein = 20) {
  return this.find({ "nutrition.protein": { $gte: minProtein } });
};

// Static method to get low calorie recipes
recipeSchema.statics.findLowCalorie = function (maxCalories = 400) {
  return this.find({ "nutrition.calories": { $lte: maxCalories } });
};

// Static method to get popular recipes
recipeSchema.statics.findPopular = function (limit = 10) {
  return this.find({ isApproved: true })
    .sort({ popularity: -1, averageRating: -1 })
    .limit(limit);
};

// Instance method to add rating
recipeSchema.methods.addRating = async function (userId, rating, comment = "") {
  // Check if user already rated
  const existingRating = this.ratings.find((r) => r.user.toString() === userId);

  if (existingRating) {
    // Update existing rating
    existingRating.rating = rating;
    existingRating.comment = comment;
    existingRating.createdAt = new Date();
  } else {
    // Add new rating
    this.ratings.push({
      user: userId,
      rating,
      comment,
    });
  }

  // Recalculate average
  const totalRating = this.ratings.reduce((sum, r) => sum + r.rating, 0);
  this.averageRating = parseFloat(
    (totalRating / this.ratings.length).toFixed(1)
  );
  this.ratingCount = this.ratings.length;

  return await this.save();
};

// Instance method to increment popularity
recipeSchema.methods.incrementPopularity = async function () {
  this.popularity += 1;
  return await this.save();
};

module.exports = mongoose.model("Recipe", recipeSchema);
