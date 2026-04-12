import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  Accordion,
  Tab,
  Tabs,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { nutritionAPI } from "../../services/api";
import MealCard from "./MealCard";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const WeeklyMealPlan = ({ mealPlan }) => {
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState(0);
  const [activeMealType, setActiveMealType] = useState("breakfast");
  const [nutritionData, setNutritionData] = useState({});
  const [loadingNutrition, setLoadingNutrition] = useState(false);

  if (!mealPlan || !mealPlan.days || mealPlan.days.length === 0) {
    return (
      <Card className="border-0 shadow">
        <Card.Body className="text-center py-5">
          <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">No Meal Plan Generated</h4>
          <p className="text-muted">
            Generate a meal plan to get started with your dietary journey.
          </p>
        </Card.Body>
      </Card>
    );
  }

  const mealTypes = [
    { key: "breakfast", name: "Breakfast", icon: "☕" },
    { key: "lunch", name: "Lunch", icon: "🥗" },
    { key: "dinner", name: "Dinner", icon: "🍽️" },

  ];

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Fetch nutrition data for all days in the meal plan
  useEffect(() => {
    const fetchNutritionData = async () => {
      if (!mealPlan?.days || mealPlan.days.length === 0) return;

      setLoadingNutrition(true);
      try {
        // Extract dates from meal plan days
        const dates = mealPlan.days.map(day => day.date).join(',');

        const response = await nutritionAPI.getNutritionByDates(dates);
        const data = response.data.data;

        // Create a map of date to nutrition data
        const nutritionMap = {};
        data.forEach(nutrition => {
          const dateKey = new Date(nutrition.date).toISOString().split('T')[0];
          nutritionMap[dateKey] = nutrition;
        });

        setNutritionData(nutritionMap);
      } catch (error) {
        console.error('Error fetching nutrition data:', error);
        // If API fails, fall back to calculating from meal plan data
      } finally {
        setLoadingNutrition(false);
      }
    };

    fetchNutritionData();
  }, [mealPlan]);

  const calculateDayNutrition = (day) => {
    // First try to get nutrition from database
    const dateKey = new Date(day.date).toISOString().split('T')[0];
    const dbNutrition = nutritionData[dateKey];

    if (dbNutrition && dbNutrition.dailySummary) {
      return {
        totalCalories: dbNutrition.dailySummary.totalCalories || 0,
        totalProtein: dbNutrition.dailySummary.totalProtein || 0,
        totalCarbs: dbNutrition.dailySummary.totalCarbs || 0,
        totalFats: dbNutrition.dailySummary.totalFats || 0,
      };
    }

    // Fallback: Calculate nutrition from actual recipe data instead of stored values
    const nutrition = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
    };

    // Sum nutrition from all meals in the day
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    mealTypes.forEach(mealType => {
      const meals = day.meals[mealType] || [];
      meals.forEach(meal => {
        if (meal.recipe && typeof meal.recipe === 'object' && meal.recipe.nutrition) {
          nutrition.totalCalories += meal.recipe.nutrition.calories || 0;
          nutrition.totalProtein += meal.recipe.nutrition.protein || 0;
          nutrition.totalCarbs += meal.recipe.nutrition.carbs || 0;
          nutrition.totalFats += meal.recipe.nutrition.fats || 0;
        }
      });
    });

    return nutrition;
  };

  const handleSavePlanToWork = async () => {
    try {
      // Update meal plan status to active
      const response = await fetch(`http://localhost:5000/api/mealplans/${mealPlan._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: 'active' }),
      });

      if (response.ok) {
        alert('Meal plan saved as active!');
      } else {
        alert('Failed to save meal plan.');
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('Error saving meal plan.');
    }
  };

  const handlePrintMealPlan = async () => {
    const element = document.getElementById('meal-plan-content');
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('meal-plan.pdf');
  };

  return (
    <div id="meal-plan-content">
      {/* Plan Header */}
      <Card className="border-0 bg-primary text-white mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <h3 className="mb-1">{mealPlan.title}</h3>
              <p className="mb-0 opacity-75">
                {mealPlan.duration} days •{" "}
                {mealPlan.preferences?.dietaryPreference || "Mixed"} • Avg.{" "}
                {mealPlan.nutritionSummary?.averageDailyCalories || 0}{" "}
                calories/day
              </p>
            </Col>
            <Col xs="auto">
              <Badge bg="light" text="dark" className="fs-6">
                {mealPlan.status || "Active"}
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Day Navigation */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <div className="d-flex overflow-auto pb-2">
            {mealPlan.days.map((day, index) => (
              <Button
                key={day.dayNumber}
                variant={activeDay === index ? "primary" : "outline-primary"}
                onClick={() => setActiveDay(index)}
                className="me-2 flex-shrink-0"
                style={{ minWidth: "120px" }}
              >
                <div className="small">Day {day.dayNumber}</div>
                <div className="fw-bold">{getDayName(day.date)}</div>
                <div className="small">{getFormattedDate(day.date)}</div>
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Row>
        <Col lg={8}>
          {/* Meal Type Tabs */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0">
              <Tabs
                activeKey={activeMealType}
                onSelect={(k) => setActiveMealType(k)}
                className="border-0"
              >
                {mealTypes.map((mealType) => (
                  <Tab
                    key={mealType.key}
                    eventKey={mealType.key}
                    title={
                      <span>
                        {mealType.icon} {mealType.name}
                      </span>
                    }
                  >
                    <Card.Body>
                      <h5 className="mb-3">{mealType.name} Recipes</h5>
                      {mealPlan.days[activeDay]?.meals[mealType.key]?.length >
                        0 ? (
                        <Row>
                          {mealPlan.days[activeDay].meals[mealType.key].map(
                            (meal, mealIndex) => (
                              <Col key={mealIndex} md={6} className="mb-3">
                                <MealCard
                                  meal={meal}
                                  mealType={mealType.key}
                                  dayIndex={activeDay}
                                  mealIndex={mealIndex}
                                />
                              </Col>
                            )
                          )}
                        </Row>
                      ) : (
                        <div className="text-center py-4 text-muted">
                          <i className="fas fa-utensils fa-2x mb-2"></i>
                          <p>No {mealType.name} recipes planned for this day</p>
                        </div>
                      )}
                    </Card.Body>
                  </Tab>
                ))}
              </Tabs>
            </Card.Header>
          </Card>

          {/* Day Notes */}
          {mealPlan.days[activeDay]?.notes && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-warning text-dark">
                <h6 className="mb-0">📝 Day Notes</h6>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{mealPlan.days[activeDay].notes}</p>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Day Nutrition Summary */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-success text-white">
              <h6 className="mb-0">📊 Daily Nutrition</h6>
            </Card.Header>
            <Card.Body>
              {(() => {
                const nutrition = calculateDayNutrition(
                  mealPlan.days[activeDay]
                );
                return (
                  <>
                    <div className="text-center mb-3">
                      <div className="h3 text-success">
                        {nutrition.totalCalories}
                      </div>
                      <small className="text-muted">Total Calories</small>
                    </div>
                    <Row className="text-center">
                      <Col xs={6} className="mb-2">
                        <div className="h5">{nutrition.totalProtein}g</div>
                        <small className="text-muted">Protein</small>
                      </Col>
                      <Col xs={6} className="mb-2">
                        <div className="h5">{nutrition.totalCarbs}g</div>
                        <small className="text-muted">Carbs</small>
                      </Col>
                      <Col xs={6}>
                        <div className="h5">{nutrition.totalFats}g</div>
                        <small className="text-muted">Fats</small>
                      </Col>
                      <Col xs={6}>
                        <div className="h5">
                          {Math.round(
                            (nutrition.totalCalories /
                              (mealPlan.nutritionSummary
                                ?.averageDailyCalories || 1)) *
                            100
                          )}
                          %
                        </div>
                        <small className="text-muted">of Daily Goal</small>
                      </Col>
                    </Row>
                  </>
                );
              })()}
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h6 className="mb-0">⚡ Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-success" size="sm" onClick={handleSavePlanToWork}>
                  <i className="fas fa-save me-2"></i>
                  Save Plan to Work
                </Button>
                <Button variant="outline-info" size="sm" onClick={handlePrintMealPlan}>
                  <i className="fas fa-print me-2"></i>
                  Print Meal Plan
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WeeklyMealPlan;
