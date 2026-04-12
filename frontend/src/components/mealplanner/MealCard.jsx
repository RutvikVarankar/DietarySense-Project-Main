import React, { useState } from "react";
import { Card, Button, Badge, Modal, Form, Row, Col } from "react-bootstrap";

const MealCard = ({ meal, mealType, dayIndex, mealIndex }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [consumed, setConsumed] = useState(meal?.consumed || false);
  const [rating, setRating] = useState(meal?.feedback?.rating || 0);
  const [comment, setComment] = useState(meal?.feedback?.comment || "");

  // Handle recipe data - could be populated object or just ID
  const recipe = (meal && meal.recipe && typeof meal.recipe === 'object' && meal.recipe.nutrition)
    ? meal.recipe
    : {
      _id: meal?.recipe || "1",
      title: "Sample Recipe",
      description: "A delicious and nutritious meal",
      prepTime: 15,
      cookTime: 30,
      difficulty: "medium",
      nutrition: {
        calories: 450,
        protein: 25,
        carbs: 45,
        fats: 15,
      },
      dietaryTags: ["healthy", "balanced"],
      image: null,
    };

  const getMealTypeIcon = (type) => {
    const icons = {
      breakfast: "☕",
      lunch: "🥗",
      dinner: "🍽️",

    };
    return icons[type] || "🍴";
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "success",
      medium: "warning",
      hard: "danger",
    };
    return colors[difficulty] || "secondary";
  };



  const handleSubmitFeedback = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/mealplans/${meal.planId}/days/${dayIndex}/meals/${mealType}/${mealIndex}/feedback`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      if (response.ok) {
        setShowDetails(false);
        alert("Feedback submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <>
      <Card className="h-100 border-0 shadow-sm meal-card">
        <Card.Body className="d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Badge bg="light" text="dark" className="fs-6">
              {getMealTypeIcon(mealType)} {mealType}
            </Badge>
            {consumed && (
              <Badge bg="success" className="ms-2">
                ✓ Consumed
              </Badge>
            )}
          </div>

          <h6 className="card-title flex-grow-1">{recipe.title}</h6>

          {recipe.title !== "No recipe assigned" && recipe.title !== "Recipe data not loaded" ? (
            <>
              <div className="mb-2">
                <small className="text-muted">
                  ⏱️ {recipe.prepTime + recipe.cookTime} min •
                  <Badge
                    bg={getDifficultyColor(recipe.difficulty)}
                    className="ms-1"
                  >
                    {recipe.difficulty}
                  </Badge>
                </small>
              </div>

              <div className="nutrition-info mb-3">
                <Row className="text-center g-1">
                  <Col xs={3}>
                    <div className="bg-primary text-white rounded p-1">
                      <small>{recipe.nutrition.calories}</small>
                    </div>
                    <small className="text-muted">cal</small>
                  </Col>
                  <Col xs={3}>
                    <div className="bg-success text-white rounded p-1">
                      <small>{recipe.nutrition.protein}g</small>
                    </div>
                    <small className="text-muted">prot</small>
                  </Col>
                  <Col xs={3}>
                    <div className="bg-info text-white rounded p-1">
                      <small>{recipe.nutrition.carbs}g</small>
                    </div>
                    <small className="text-muted">carbs</small>
                  </Col>
                  <Col xs={3}>
                    <div className="bg-warning text-white rounded p-1">
                      <small>{recipe.nutrition.fats}g</small>
                    </div>
                    <small className="text-muted">fats</small>
                  </Col>
                </Row>
              </div>

              <div className="dietary-tags mb-3">
                {recipe.dietaryTags?.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    bg="outline-secondary"
                    text="dark"
                    className="me-1 mb-1"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-3 text-muted">
              <small>No recipe assigned to this meal slot</small>
            </div>
          )}

          <div className="mt-auto">
            <div className="d-grid gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowDetails(true)}
              >
                View Details
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Meal Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {getMealTypeIcon(mealType)} {recipe.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h6>Nutrition Information</h6>
              <div className="bg-light rounded p-3 mb-3">
                <Row className="text-center">
                  <Col xs={3}>
                    <div className="fw-bold text-primary">
                      {recipe.nutrition.calories}
                    </div>
                    <small>Calories</small>
                  </Col>
                  <Col xs={3}>
                    <div className="fw-bold text-success">
                      {recipe.nutrition.protein}g
                    </div>
                    <small>Protein</small>
                  </Col>
                  <Col xs={3}>
                    <div className="fw-bold text-info">
                      {recipe.nutrition.carbs}g
                    </div>
                    <small>Carbs</small>
                  </Col>
                  <Col xs={3}>
                    <div className="fw-bold text-warning">
                      {recipe.nutrition.fats}g
                    </div>
                    <small>Fats</small>
                  </Col>
                </Row>
              </div>

              <h6>Preparation</h6>
              <div className="bg-light rounded p-3 mb-3">
                <Row>
                  <Col xs={6}>
                    <small className="text-muted">Prep Time</small>
                    <div className="fw-bold">{recipe.prepTime} min</div>
                  </Col>
                  <Col xs={6}>
                    <small className="text-muted">Cook Time</small>
                    <div className="fw-bold">{recipe.cookTime} min</div>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col xs={12}>
                    <small className="text-muted">Difficulty</small>
                    <div>
                      <Badge bg={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty}
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>

            <Col md={6}>
              <h6>Dietary Information</h6>
              <div className="d-flex flex-wrap gap-1 mb-3">
                {recipe.dietaryTags?.map((tag) => (
                  <Badge key={tag} bg="outline-primary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h6>Meal Feedback</h6>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Rating</Form.Label>
                  <div>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant={star <= rating ? "warning" : "outline-warning"}
                        size="sm"
                        onClick={() => setRating(star)}
                        className="me-1"
                      >
                        ⭐
                      </Button>
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Comments</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How was this meal?"
                  />
                </Form.Group>
              </Form>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmitFeedback}>
            Submit Feedback
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .meal-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .meal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        .nutrition-info .bg-primary,
        .nutrition-info .bg-success,
        .nutrition-info .bg-info,
        .nutrition-info .bg-warning {
          font-size: 0.75rem;
        }
      `}</style>
    </>
  );
};

export default MealCard;
