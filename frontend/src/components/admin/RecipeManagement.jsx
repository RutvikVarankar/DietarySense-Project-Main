import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Badge,
  Alert,
  Spinner,
  Modal,
  Tabs,
  Tab,
} from "react-bootstrap";
import recipeService from "../../services/recipeService.js";

const RecipeManagement = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [recipeToAction, setRecipeToAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    description: "",
    videoLink: "",
    ingredients: [{ name: "", quantity: 0, unit: "", category: "" }],
    instructions: [{ step: 1, text: "", duration: 0 }],
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
    dietaryTags: [],
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficulty: "easy",
    cuisine: "",
    image: null, // Changed to null for file
    tags: [],
  });
  const [addRecipeLoading, setAddRecipeLoading] = useState(false);
  const [addRecipeError, setAddRecipeError] = useState("");
  const [actionError, setActionError] = useState("");


  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await recipeService.adminGetRecipes(params);
      setRecipes(data.data || data);
    } catch (err) {
      setError(err.message || "Failed to fetch recipes");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && !recipe.isApproved) ||
      (statusFilter === "approved" && recipe.isApproved);

    return matchesSearch && matchesStatus;
  });

  const pendingRecipes = recipes.filter((recipe) => !recipe.isApproved);
  const approvedRecipes = recipes.filter((recipe) => recipe.isApproved);

  const handleRecipeAction = (recipe, action) => {
    setRecipeToAction(recipe);
    setModalAction(action);
    setShowActionModal(true);
  };

  const confirmRecipeAction = async () => {
    setActionError("");
    if (!recipeToAction) return;

    try {
      let res;
      switch (modalAction) {
        case "approve":
          res = await recipeService.adminApproveRecipe(recipeToAction._id);
          break;
        case "reject":
          res = await recipeService.adminRejectRecipe(recipeToAction._id, rejectionReason);
          break;
        case "delete":
          await fetch(`http://localhost:5000/api/admin/recipes/${recipeToAction._id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setRecipes((prev) => prev.filter((r) => r._id !== recipeToAction._id));
          break;
        default:
          return;
      }

      if (modalAction !== "delete") {
        setRecipes((prev) =>
          prev.map((r) => r._id === recipeToAction._id ? res.data : r)
        );
        if (modalAction === "approve") {
          alert("✅ Recipe approved successfully! It is now visible in the public recipe section as a card.");
        }
      }

      setShowActionModal(false);
      setRecipeToAction(null);
      setRejectionReason("");
    } catch (err) {
      console.error("Recipe action error:", err);
      setActionError(err.response?.data?.message || err.message || `Failed to ${modalAction} recipe. Check console.`);
    }
  };

  const getStatusVariant = (recipe) => {
    if (!recipe.isApproved) return "warning";
    return recipe.rejectionReason ? "danger" : "success";
  };

  const getStatusText = (recipe) => {
    if (!recipe.isApproved) return "Pending Review";
    return recipe.rejectionReason ? "Rejected" : "Approved";
  };

  const getDifficultyVariant = (difficulty) => {
    const variants = {
      easy: "success",
      medium: "warning",
      hard: "danger",
    };
    return variants[difficulty] || "secondary";
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Helper functions for add recipe form
  const updateIngredient = (index, field, value) => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  const addIngredient = () => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { name: "", quantity: 0, unit: "", category: "" },
      ],
    }));
  };

  const removeIngredient = (index) => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updateInstruction = (index, field, value) => {
    setNewRecipe((prev) => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? { ...inst, [field]: value } : inst
      ),
    }));
  };

  const addInstruction = () => {
    const nextStep = newRecipe.instructions.length + 1;
    setNewRecipe((prev) => ({
      ...prev,
      instructions: [
        ...prev.instructions,
        { step: nextStep, text: "" },
      ],
    }));
  };

  const removeInstruction = (index) => {
    setNewRecipe((prev) => ({
      ...prev,
      instructions: prev.instructions
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, step: i + 1 })),
    }));
  };

  const updateNutrition = (field, value) => {
    setNewRecipe((prev) => ({
      ...prev,
      nutrition: { ...prev.nutrition, [field]: value },
    }));
  };

  const toggleDietaryTag = (tag) => {
    setNewRecipe((prev) => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter((t) => t !== tag)
        : [...prev.dietaryTags, tag],
    }));
  };

  const addTag = (tag) => {
    if (tag && !newRecipe.tags.includes(tag)) {
      setNewRecipe((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const removeTag = (tag) => {
    setNewRecipe((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    setAddRecipeLoading(true);
    setAddRecipeError("");

    try {
      // Create recipe data without image for JSON submission
      const { image, ...recipeData } = newRecipe;

      const response = await fetch("http://localhost:5000/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create recipe");
      }

      const data = await response.json();
      const createdRecipe = data.data;

      // If image was provided, upload it separately
      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        const imageResponse = await fetch(
          `http://localhost:5000/api/recipes/${createdRecipe._id}/image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          }
        );

        if (!imageResponse.ok) {
          console.warn("Recipe created but image upload failed");
        } else {
          // Update the recipe with the image URL
          const imageData = await imageResponse.json();
          createdRecipe.image = imageData.imageUrl;
        }
      }

      // Add the new recipe to the list
      setRecipes((prev) => [createdRecipe, ...prev]);

      // Reset form and close modal
      setNewRecipe({
        title: "",
        description: "",
        youtubeLink: "",
        ingredients: [{ name: "", quantity: 0, unit: "", category: "" }],
        instructions: [{ step: 1, text: "", duration: 0 }],
        nutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
        },
        dietaryTags: [],
        prepTime: 0,
        cookTime: 0,
        servings: 1,
        difficulty: "easy",
        cuisine: "",
        image: null,
        tags: [],
      });
      setShowAddRecipeModal(false);
    } catch (err) {
      setAddRecipeError(err.message);
    } finally {
      setAddRecipeLoading(false);
    }
  };

  const RecipeTable = ({ recipes: tableRecipes, showActions = true }) => (
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead className="bg-light">
          <tr>
            <th>Recipe</th>
            <th>Nutrition</th>
            <th>Time</th>
            <th>Difficulty</th>
            <th>Author</th>
            <th>Status</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tableRecipes.map((recipe) => (
            <tr key={recipe._id}>
              <td>
                <div>
                  <div className="fw-medium">{recipe.title}</div>
                  {recipe.description && (
                    <small
                      className="text-muted"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {recipe.description}
                    </small>
                  )}
                  <div className="mt-1">
                    {recipe.dietaryTags?.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        bg="outline-primary"
                        text="dark"
                        className="me-1 mb-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </td>
              <td>
                <div className="small">
                  <div>
                    Calories: <strong>{recipe.nutrition.calories}</strong>
                  </div>
                  <div>
                    Protein: <strong>{recipe.nutrition.protein}g</strong>
                  </div>
                  <div>
                    Carbs: <strong>{recipe.nutrition.carbs}g</strong>
                  </div>
                </div>
              </td>
              <td>
                <div className="small">
                  <div>Prep: {formatTime(recipe.prepTime)}</div>
                  <div>Cook: {formatTime(recipe.cookTime)}</div>
                </div>
              </td>
              <td>
                <Badge bg={getDifficultyVariant(recipe.difficulty)}>
                  {recipe.difficulty}
                </Badge>
              </td>
              <td>
                <div className="small">
                  <div>{recipe.createdBy?.name || "Unknown"}</div>
                  <div className="text-muted">{recipe.createdBy?.email}</div>
                </div>
              </td>
              <td>
                <Badge bg={getStatusVariant(recipe)}>
                  {getStatusText(recipe)}
                </Badge>
                {recipe.rejectionReason && (
                  <div
                    className="small text-muted mt-1"
                    title={recipe.rejectionReason}
                  >
                    {recipe.rejectionReason.substring(0, 50)}...
                  </div>
                )}
              </td>
              {showActions && (
                <td>
                  <div className="d-flex gap-1">
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleRecipeAction(recipe, "approve")}
                      disabled={recipe.isApproved}
                    >
                      <i className="fas fa-check"></i>
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => handleRecipeAction(recipe, "reject")}
                      disabled={!recipe.isApproved}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRecipeAction(recipe, "delete")}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {tableRecipes.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="fas fa-utensils fa-3x mb-3"></i>
          <p>No recipes found</p>
        </div>
      )}
    </div>
  );

  return (
    <Container className="my-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="bg-dark text-white rounded p-4">
            <h1 className="h2 mb-2">🍳 Recipe Management</h1>
            <p className="mb-0 opacity-75">
              Review, approve, and manage user-submitted recipes
            </p>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Recipes</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex gap-2">
              <Button
                variant="primary"
                className="ms-auto"
                onClick={() => setShowAddRecipeModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Add Recipe
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Recipes Tabs */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 p-0">
          <Tabs defaultActiveKey="all" className="px-3 pt-3">
            <Tab eventKey="all" title={`All Recipes (${recipes.length})`}>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading recipes...</p>
                  </div>
                ) : (
                  <RecipeTable recipes={filteredRecipes} />
                )}
              </Card.Body>
            </Tab>
            <Tab
              eventKey="pending"
              title={`Pending Review (${pendingRecipes.length})`}
            >
              <Card.Body className="p-0">
                <RecipeTable recipes={pendingRecipes} />
              </Card.Body>
            </Tab>
            <Tab
              eventKey="approved"
              title={`Approved (${approvedRecipes.length})`}
            >
              <Card.Body className="p-0">
                <RecipeTable recipes={approvedRecipes} showActions={false} />
              </Card.Body>
            </Tab>
          </Tabs>
        </Card.Header>
      </Card>

      {/* Action Modal */}
      <Modal show={showActionModal} onHide={() => setShowActionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalAction === "approve" && "Approve Recipe"}
            {modalAction === "reject" && "Reject Recipe"}
            {modalAction === "delete" && "Delete Recipe"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {recipeToAction && (
            <div>
              <p>
                {modalAction === "approve" &&
                  `Are you sure you want to approve "${recipeToAction.title}"?`}
                {modalAction === "reject" &&
                  `Are you sure you want to reject "${recipeToAction.title}"?`}
                {modalAction === "delete" &&
                  `Are you sure you want to permanently delete "${recipeToAction.title}"?`}
              </p>

              {actionError && (
                <Alert variant="danger" className="mb-3">
                  {actionError}
                </Alert>
              )}

              {modalAction === "reject" && (
                <Form.Group className="mt-3">
                  <Form.Label>Rejection Reason</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </Form.Group>
              )}

              {(modalAction === "delete" || modalAction === "reject") && (
                <Alert variant="warning" className="mt-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {modalAction === "delete"
                    ? "This action cannot be undone. The recipe will be permanently deleted."
                    : "The author will be notified about the rejection reason."}
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowActionModal(false)}>
            Cancel
          </Button>
          <Button
            variant={
              modalAction === "approve"
                ? "success"
                : modalAction === "reject"
                  ? "warning"
                  : "danger"
            }
            onClick={confirmRecipeAction}
            disabled={modalAction === "reject" && !rejectionReason.trim()}
          >
            {modalAction === "approve" && "Approve Recipe"}
            {modalAction === "reject" && "Reject Recipe"}
            {modalAction === "delete" && "Delete Recipe"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Recipe Modal */}
      <Modal
        show={showAddRecipeModal}
        onHide={() => setShowAddRecipeModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Recipe</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddRecipe}>
          <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {addRecipeError && (
              <Alert variant="danger" className="mb-3">
                {addRecipeError}
              </Alert>
            )}

            {/* Basic Information */}
            <h5 className="mb-3">Basic Information</h5>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newRecipe.title}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Difficulty *</Form.Label>
                  <Form.Select
                    value={newRecipe.difficulty}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({
                        ...prev,
                        difficulty: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Cuisine</Form.Label>
                  <Form.Select
                    value={newRecipe.cuisine}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({
                        ...prev,
                        cuisine: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Cuisine</option>
                    <option value="Italian">Italian</option>
                    <option value="Mexican">Mexican</option>
                    <option value="Asian">Asian</option>
                    <option value="Indian">Indian</option>
                    <option value="Mediterranean">Mediterranean</option>
                    <option value="American">American</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newRecipe.description}
                onChange={(e) =>
                  setNewRecipe((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>YouTube Link</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={newRecipe.videoLink}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({
                        ...prev,
                        videoLink: e.target.value
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Recipe Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewRecipe((prev) => ({
                        ...prev,
                        image: e.target.files[0],
                      }))
                    }
                  />
                  <Form.Text className="text-muted">
                    Upload a recipe image (optional)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Time and Servings */}
            <h5 className="mb-3">Time & Servings</h5>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Prep Time (min) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={newRecipe.prepTime}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({
                        ...prev,
                        prepTime: parseInt(e.target.value) || 0,
                      }))
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Cook Time (min) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={newRecipe.cookTime}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({
                        ...prev,
                        cookTime: parseInt(e.target.value) || 0,
                      }))
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Servings *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={newRecipe.servings}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({
                        ...prev,
                        servings: parseInt(e.target.value) || 1,
                      }))
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Ingredients */}
            <h5 className="mb-3">Ingredients</h5>
            {newRecipe.ingredients.map((ingredient, index) => (
              <Row key={index} className="mb-2 align-items-end">
                <Col md={3}>
                  <Form.Control
                    placeholder="Name"
                    value={ingredient.name}
                    onChange={(e) =>
                      updateIngredient(index, "name", e.target.value)
                    }
                    required
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Qty"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      updateIngredient(
                        index,
                        "quantity",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    required
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    placeholder="Unit"
                    value={ingredient.unit}
                    onChange={(e) =>
                      updateIngredient(index, "unit", e.target.value)
                    }
                    required
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    placeholder="Category"
                    value={ingredient.category}
                    onChange={(e) =>
                      updateIngredient(index, "category", e.target.value)
                    }
                  />
                </Col>
                <Col md={2}>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                    disabled={newRecipe.ingredients.length === 1}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="outline-primary" size="sm" onClick={addIngredient}>
              <i className="fas fa-plus me-2"></i>Add Ingredient
            </Button>

            {/* Instructions */}
            <h5 className="mb-3 mt-4">Instructions</h5>
            {newRecipe.instructions.map((instruction, index) => (
              <Row key={index} className="mb-2 align-items-end">
                <Col md={1}>
                  <Form.Control
                    type="number"
                    value={instruction.step}
                    readOnly
                    className="text-center"
                  />
                </Col>
                <Col md={8}>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Instruction text"
                    value={instruction.text}
                    onChange={(e) =>
                      updateInstruction(index, "text", e.target.value)
                    }
                    required
                  />
                </Col>
                <Col md={1}>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                    disabled={newRecipe.instructions.length === 1}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="outline-primary" size="sm" onClick={addInstruction}>
              <i className="fas fa-plus me-2"></i>Add Instruction
            </Button>

            {/* Nutrition */}
            <h5 className="mb-3 mt-4">Nutrition (per serving)</h5>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Calories *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={newRecipe.nutrition.calories}
                    onChange={(e) =>
                      updateNutrition("calories", parseInt(e.target.value) || 0)
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Protein (g) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.1"
                    value={newRecipe.nutrition.protein}
                    onChange={(e) =>
                      updateNutrition("protein", parseFloat(e.target.value) || 0)
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Carbs (g) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.1"
                    value={newRecipe.nutrition.carbs}
                    onChange={(e) =>
                      updateNutrition("carbs", parseFloat(e.target.value) || 0)
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Fats (g) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.1"
                    value={newRecipe.nutrition.fats}
                    onChange={(e) =>
                      updateNutrition("fats", parseFloat(e.target.value) || 0)
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Fiber (g)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.1"
                    value={newRecipe.nutrition.fiber}
                    onChange={(e) =>
                      updateNutrition("fiber", parseFloat(e.target.value) || 0)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Sugar (g)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.1"
                    value={newRecipe.nutrition.sugar}
                    onChange={(e) =>
                      updateNutrition("sugar", parseFloat(e.target.value) || 0)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Sodium (mg)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={newRecipe.nutrition.sodium}
                    onChange={(e) =>
                      updateNutrition("sodium", parseInt(e.target.value) || 0)
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Dietary Tags */}
            <h5 className="mb-3">Dietary Tags</h5>
            <div className="mb-3">
              {[
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
              ].map((tag) => (
                <Form.Check
                  key={tag}
                  inline
                  label={tag}
                  checked={newRecipe.dietaryTags.includes(tag)}
                  onChange={() => toggleDietaryTag(tag)}
                />
              ))}
            </div>

            {/* Tags */}
            <h5 className="mb-3">Tags</h5>
            <Row className="mb-3">
              <Col md={10}>
                <Form.Control
                  type="text"
                  placeholder="Add a tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector(
                      'input[placeholder="Add a tag and press Enter"]'
                    );
                    if (input && input.value) {
                      addTag(input.value);
                      input.value = "";
                    }
                  }}
                >
                  Add
                </Button>
              </Col>
            </Row>
            <div className="mb-3">
              {newRecipe.tags.map((tag) => (
                <Badge
                  key={tag}
                  bg="secondary"
                  className="me-2 mb-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => removeTag(tag)}
                >
                  {tag} <i className="fas fa-times ms-1"></i>
                </Badge>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowAddRecipeModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={addRecipeLoading}
            >
              {addRecipeLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating...
                </>
              ) : (
                "Create Recipe"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>


    </Container>
  );
};

export default RecipeManagement;
