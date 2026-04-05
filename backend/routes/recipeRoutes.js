const express = require("express");
const {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  uploadRecipeImage,
  generateRecipePDF,
  addRating,
} = require("../controllers/recipeController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  validateRecipe,
  validateId,
  validatePagination,
  validateRecipeQuery,
} = require("../middleware/validationMiddleware");
const { body } = require("express-validator");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { upload } = require("../config/cloudinary");

const router = express.Router();

// @desc    Get all recipes (public)
router.get(
  "/",
  validateRecipeQuery,
  validatePagination,
  asyncHandler(getRecipes)
);

// @desc    Get single recipe (public)
router.get("/:id", validateId, asyncHandler(getRecipe));

// @desc    Generate PDF for recipe (public)
router.get("/:id/pdf", validateId, asyncHandler(generateRecipePDF));

// All routes below are protected
router.use(protect);

// @desc    Create new recipe (FormData - validation in controller)
router.post("/", protect, asyncHandler(createRecipe));

// @desc    Update recipe
router.put("/:id", validateId, validateRecipe, asyncHandler(updateRecipe));

// @desc    Delete recipe
router.delete("/:id", validateId, asyncHandler(deleteRecipe));

// @desc    Upload recipe image
router.post(
  "/:id/image",
  validateId,
  upload.single("image"),
  asyncHandler(uploadRecipeImage)
);

// @desc    Add rating/review
router.post(
  "/:id/ratings",
  validateId,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Comment cannot exceed 500 characters"),
  ],
  protect,
  asyncHandler(addRating)
);

module.exports = router;
