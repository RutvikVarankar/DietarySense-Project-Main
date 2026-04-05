import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import WeeklyMealPlan from "./WeeklyMealPlan";

const MealPlanGenerator = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    duration: 7,
    dietaryPreference: user?.profile?.dietaryPreference || "",
    excludedIngredients: [],
    maxPrepTime: 60,
    maxCookTime: 60,
    cuisine: [],
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGeneratedPlan, setShowGeneratedPlan] = useState(false);

  const cuisineOptions = [
    "Italian",
    "Mexican",
    "Asian",
    "Indian",
    "Mediterranean",
    "American",
  ];
  const ingredientOptions = [
    "Dairy",
    "Nuts",
    "Gluten",
    "Shellfish",
    "Eggs",
    "Soy",
  ];



  useEffect(() => {
    if (user?.profile) {
      setPreferences((prev) => ({
        ...prev,
        dietaryPreference: user.profile.dietaryPreference || "",
        excludedIngredients: (user.profile.allergies || []).map(a => a.toLowerCase()),
      }));
    }
  }, [user]);

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleArrayToggle = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const generateMealPlan = async () => {
    if (!user?.profile?.dailyCalories) {
      setError("Please complete your profile with calorie targets first.");
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Sending request to backend with preferences:", preferences);

      const response = await fetch(
        "http://localhost:5000/api/mealplans/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            duration: preferences.duration,
            preferences: {
              dietaryPreference: preferences.dietaryPreference,
              excludedIngredients: preferences.excludedIngredients,
              cuisine: preferences.cuisine,
              maxPrepTime: preferences.maxPrepTime,
              maxCookTime: preferences.maxCookTime,
            },
          }),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data);

      setGeneratedPlan(data.data);
      setShowGeneratedPlan(true);
    } catch (err) {
      console.error("Meal plan generation error:", err);
      setError(err.message || "Failed to generate meal plan. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };



  if (showGeneratedPlan && generatedPlan) {
    return (
      <Container className="my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Your Generated Meal Plan</h2>
          <div>
            <Button
              variant="outline-secondary"
              onClick={() => setShowGeneratedPlan(false)}
              className="me-2"
            >
              ← Back to Generator
            </Button>
          </div>
        </div>
        <WeeklyMealPlan mealPlan={generatedPlan} />
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="border-0 shadow">
            <Card.Header className="bg-primary text-white py-3">
              <h2 className="mb-0">Generate Your Meal Plan</h2>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Row>
                <Col md={6}>
                  {/* Basic Settings */}
                  <Card className="border-0 bg-light mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Basic Settings</h5>

                      <Form.Group className="mb-3">
                        <Form.Label>Plan Duration</Form.Label>
                        <Form.Select
                          value={preferences.duration}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "duration",
                              parseInt(e.target.value)
                            )
                          }
                        >
                          <option value={3}>3 Days</option>
                          <option value={7}>7 Days</option>
                          <option value={14}>14 Days</option>
                          <option value={30}>30 Days</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Dietary Preference</Form.Label>
                        <div className="d-flex align-items-center">
                          <Badge
                            bg={preferences.dietaryPreference ? "primary" : "secondary"}
                            className="me-2"
                          >
                            {preferences.dietaryPreference
                              ? preferences.dietaryPreference.charAt(0).toUpperCase() +
                              preferences.dietaryPreference.slice(1)
                              : "No Preference"}
                          </Badge>
                          <small className="text-muted">
                            (Set in your profile - cannot be changed here)
                          </small>
                        </div>
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  {/* Time Constraints */}
                  <Card className="border-0 bg-light mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Time Constraints</h5>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          Max Preparation Time: {preferences.maxPrepTime}{" "}
                          minutes
                        </Form.Label>
                        <Form.Range
                          min="10"
                          max="120"
                          step="5"
                          value={preferences.maxPrepTime}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "maxPrepTime",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          Max Cooking Time: {preferences.maxCookTime} minutes
                        </Form.Label>
                        <Form.Range
                          min="10"
                          max="120"
                          step="5"
                          value={preferences.maxCookTime}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "maxCookTime",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  {/* Cuisine Preferences */}
                  <Card className="border-0 bg-light mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Cuisine Preferences</h5>
                      <p className="text-muted small mb-3">
                        Select your preferred cuisines
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        {cuisineOptions.map((cuisine) => (
                          <Badge
                            key={cuisine}
                            bg={
                              preferences.cuisine.includes(cuisine)
                                ? "primary"
                                : "outline-primary"
                            }
                            style={{
                              cursor: "pointer",
                              color: preferences.cuisine.includes(cuisine)
                                ? "white"
                                : "black",
                            }}
                            onClick={() =>
                              handleArrayToggle("cuisine", cuisine)
                            }
                            className="p-2"
                          >
                            {cuisine}
                          </Badge>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Exclude Ingredients */}
                  <Card className="border-0 bg-light mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Exclude Ingredients</h5>
                      <p className="text-muted small mb-3">
                        Excluded ingredients from your profile (allergies)
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        {preferences.excludedIngredients.length > 0 ? (
                          preferences.excludedIngredients.map((ingredient) => (
                            <Badge
                              key={ingredient}
                              bg="danger"
                              className="p-2"
                            >
                              {ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted">None</span>
                        )}
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Nutrition Summary */}
                  <Card className="border-0 bg-info text-white">
                    <Card.Body>
                      <h5 className="mb-3">Your Nutrition Targets</h5>
                      <Row className="text-center">
                        <Col xs={6} className="mb-2">
                          <div className="h4 mb-1">
                            {user?.profile?.dailyCalories || "--"}
                          </div>
                          <small>Daily Calories</small>
                        </Col>
                        <Col xs={6} className="mb-2">
                          <div className="h4 mb-1">
                            {user?.profile?.protein || "--"}g
                          </div>
                          <small>Protein</small>
                        </Col>
                        <Col xs={6}>
                          <div className="h4 mb-1">
                            {user?.profile?.carbs || "--"}g
                          </div>
                          <small>Carbs</small>
                        </Col>
                        <Col xs={6}>
                          <div className="h4 mb-1">
                            {user?.profile?.fats || "--"}g
                          </div>
                          <small>Fats</small>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="text-center mt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={generateMealPlan}
                  disabled={loading || !user?.profile?.dailyCalories}
                  className="px-5"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Generating Plan...
                    </>
                  ) : (
                    "Generate Meal Plan"
                  )}
                </Button>

                {!user?.profile?.dailyCalories && (
                  <Alert variant="warning" className="mt-3">
                    Please complete your profile with calorie targets to generate a meal plan.
                  </Alert>
                )}


              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MealPlanGenerator;