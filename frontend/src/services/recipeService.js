import { apiService } from "./api";

const RECIPE_ENDPOINTS = {
  RECIPES: "/recipes",
  RATINGS: "/recipes/ratings",
  FAVORITES: "/recipes/favorites",
};

export const recipeService = {
  // Get all recipes with filters
  getRecipes: async (filters = {}) => {
    const params = new URLSearchParams();

    // Add filter parameters
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        if (Array.isArray(filters[key])) {
          if (filters[key].length > 0) {
            params.append(key, filters[key].join(","));
          }
        } else {
          params.append(key, filters[key]);
        }
      }
    });

    const response = await apiService.get(
      `${RECIPE_ENDPOINTS.RECIPES}?${params}`
    );
    return response.data;
  },

  // Get single recipe
  getRecipe: async (id) => {
    const response = await apiService.get(`${RECIPE_ENDPOINTS.RECIPES}/${id}`);
    return response.data;
  },

  // Create new recipe
  createRecipe: async (recipeData) => {
    const response = await apiService.post(
      RECIPE_ENDPOINTS.RECIPES,
      recipeData
    );
    return response.data;
  },

  // Update recipe
  updateRecipe: async (id, recipeData) => {
    const response = await apiService.put(
      `${RECIPE_ENDPOINTS.RECIPES}/${id}`,
      recipeData
    );
    return response.data;
  },

  // Delete recipe
  deleteRecipe: async (id) => {
    const response = await apiService.delete(
      `${RECIPE_ENDPOINTS.RECIPES}/${id}`
    );
    return response.data;
  },

  // Upload recipe image
  uploadRecipeImage: async (id, imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await apiService.upload(
      `${RECIPE_ENDPOINTS.RECIPES}/${id}/image`,
      formData
    );
    return response.data;
  },

  // Add rating to recipe
  addRating: async (recipeId, ratingData) => {
    const response = await apiService.post(
      `${RECIPE_ENDPOINTS.RECIPES}/${recipeId}/ratings`,
      ratingData
    );
    return response.data;
  },

  // Get recipe ratings
  getRatings: async (recipeId) => {
    const response = await apiService.get(
      `${RECIPE_ENDPOINTS.RECIPES}/${recipeId}/ratings`
    );
    return response.data;
  },

  // Admin endpoints
  adminGetRecipes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await apiService.get(`/admin/recipes?${query}`);
    return response.data;
  },

  adminApproveRecipe: async (id) => {
    const response = await apiService.put(`/admin/recipes/${id}/approve`);
    return response.data;
  },

  adminRejectRecipe: async (id, reason) => {
    const response = await apiService.put(`/admin/recipes/${id}/reject`, { reason });
    return response.data;
  },

  // Add to favorites
  addToFavorites: async (recipeId) => {
    const response = await apiService.post(
      `${RECIPE_ENDPOINTS.FAVORITES}/${recipeId}`
    );
    return response.data;
  },

  // Remove from favorites
  removeFromFavorites: async (recipeId) => {
    const response = await apiService.delete(
      `${RECIPE_ENDPOINTS.FAVORITES}/${recipeId}`
    );
    return response.data;
  },

  // Get user favorites
  getFavorites: async () => {
    const response = await apiService.get(RECIPE_ENDPOINTS.FAVORITES);
    return response.data;
  },

  // Search recipes
  searchRecipes: async (query, filters = {}) => {
    const params = new URLSearchParams({ search: query, ...filters });
    const response = await apiService.get(
      `${RECIPE_ENDPOINTS.RECIPES}?${params}`
    );
    return response.data;
  },

  // Get recipes by dietary tags
  getRecipesByTags: async (tags) => {
    const response = await apiService.get(
      `${RECIPE_ENDPOINTS.RECIPES}?dietaryTags=${tags.join(",")}`
    );
    return response.data;
  },

  // Get popular recipes
  getPopularRecipes: async (limit = 10) => {
    const response = await apiService.get(
      `${RECIPE_ENDPOINTS.RECIPES}?sortBy=averageRating&sortOrder=desc&limit=${limit}`
    );
    return response.data;
  },
};

export default recipeService;
