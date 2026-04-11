import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  ListGroup,
  Badge,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import ExportOptions from "./ExportOptions";

const GroceryList = () => {
  const [groceryItems, setGroceryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    unit: "pieces",
    category: "other",
  });
  const [showExport, setShowExport] = useState(false);

  // Categories for organization
  const categories = [
    "produce",
    "dairy",
    "meat",
    "seafood",
    "grains",
    "pantry",
    "spices",
    "beverages",
    "frozen",
    "other",
  ];

  const categoryIcons = {
    produce: "🥬",
    dairy: "🥛",
    meat: "🍗",
    seafood: "🐟",
    grains: "🌾",
    pantry: "🫙",
    spices: "🌶️",
    beverages: "🥤",
    frozen: "❄️",
    other: "📦",
  };

  const categoryColors = {
    produce: "success",
    dairy: "info",
    meat: "danger",
    seafood: "primary",
    grains: "warning",
    pantry: "secondary",
    spices: "dark",
    beverages: "info",
    frozen: "primary",
    other: "secondary",
  };

  useEffect(() => {
    fetchGroceryList();
  }, []);

  const fetchGroceryList = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/grocery", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroceryItems(data.data);
      } else {
        throw new Error("Failed to load grocery list");
      }
    } catch (err) {
      setError("Failed to load grocery list");
    } finally {
      setLoading(false);
    }
  };



  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    try {
      const response = await fetch("http://localhost:5000/api/grocery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        const data = await response.json();
        setGroceryItems((prev) => [data.data, ...prev]);
        setNewItem({ name: "", quantity: 1, unit: "pieces", category: "other" });
      } else {
        throw new Error("Failed to add item");
      }
    } catch (err) {
      setError("Failed to add item");
    }
  };

  const handleTogglePurchased = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/grocery/${itemId}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroceryItems((prev) =>
          prev.map((item) =>
            item._id === itemId ? data.data : item
          )
        );
      } else {
        throw new Error("Failed to update item");
      }
    } catch (err) {
      setError("Failed to update item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/grocery/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setGroceryItems((prev) => prev.filter((item) => item._id !== itemId));
      } else {
        throw new Error("Failed to delete item");
      }
    } catch (err) {
      setError("Failed to delete item");
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setGroceryItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };



  const clearList = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/grocery", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setGroceryItems([]);
      } else {
        throw new Error("Failed to clear list");
      }
    } catch (err) {
      setError("Failed to clear list");
    }
  };

  const getItemsByCategory = () => {
    const grouped = {};
    categories.forEach((category) => {
      grouped[category] = groceryItems.filter(
        (item) => item.category === category
      );
    });
    return grouped;
  };

  const getStats = () => {
    const totalItems = groceryItems.length;
    const purchasedItems = groceryItems.filter((item) => item.purchased).length;
    const remainingItems = totalItems - purchasedItems;
    const progress =
      totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;

    return { totalItems, purchasedItems, remainingItems, progress };
  };

  const stats = getStats();
  const itemsByCategory = getItemsByCategory();

  if (showExport) {
    return (
      <ExportOptions
        groceryItems={groceryItems}
        onBack={() => setShowExport(false)}
      />
    );
  }

  return (
    <Container className="my-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="bg-success text-white rounded p-4">
            <h1 className="h2 mb-2">🛒 Grocery List</h1>
            <p className="mb-0 opacity-75">
              Organize your shopping and never forget an ingredient
            </p>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Main Content */}
        <Col lg={8}>
          {/* Stats Card */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <Row className="text-center">
                <Col xs={6} md={3} className="mb-3">
                  <div className="h4 text-primary mb-1">{stats.totalItems}</div>
                  <small className="text-muted">Total Items</small>
                </Col>
                <Col xs={6} md={3} className="mb-3">
                  <div className="h4 text-success mb-1">
                    {stats.purchasedItems}
                  </div>
                  <small className="text-muted">Purchased</small>
                </Col>
                <Col xs={6} md={3} className="mb-3">
                  <div className="h4 text-warning mb-1">
                    {stats.remainingItems}
                  </div>
                  <small className="text-muted">Remaining</small>
                </Col>
                <Col xs={6} md={3} className="mb-3">
                  <div className="h4 text-info mb-1">{stats.progress}%</div>
                  <small className="text-muted">Progress</small>
                </Col>
              </Row>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${stats.progress}%` }}
                ></div>
              </div>
            </Card.Body>
          </Card>

          {/* Add Item Form */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Add New Item</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddItem}>
                <Row className="g-2">
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      placeholder="Item name"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      type="number"
                      placeholder="Qty"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          quantity: parseInt(e.target.value) || 1,
                        }))
                      }
                      min="1"
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Select
                      value={newItem.unit}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          unit: e.target.value,
                        }))
                      }
                    >
                      <option value="pieces">pieces</option>
                      <option value="g">grams</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">liters</option>
                      <option value="cups">cups</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                      <option value="bottle">bottle</option>
                      <option value="pack">pack</option>
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Select
                      value={newItem.category}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {categoryIcons[category]} {category}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Button type="submit" variant="primary" className="w-100">
                      Add
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Grocery List by Category */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-2">Loading grocery list...</p>
            </div>
          ) : (
            <div>
              {categories.map((category) => {
                const categoryItems = itemsByCategory[category];
                if (categoryItems.length === 0) return null;

                return (
                  <Card key={category} className="border-0 shadow-sm mb-4">
                    <Card.Header
                      className={`bg-${categoryColors[category]} text-white d-flex align-items-center`}
                    >
                      <span className="me-2">{categoryIcons[category]}</span>
                      <h6 className="mb-0 text-capitalize">{category}</h6>
                      <Badge bg="light" text="dark" className="ms-2">
                        {categoryItems.length}
                      </Badge>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <ListGroup variant="flush">
                        {categoryItems.map((item) => (
                          <ListGroup.Item
                            key={item._id}
                            className={`d-flex justify-content-between align-items-center border-0 px-3 py-2 ${item.purchased ? "bg-light text-muted" : ""
                              }`}
                          >
                            <div className="d-flex align-items-center">
                              <Form.Check
                                type="checkbox"
                                checked={item.purchased}
                                onChange={() => handleTogglePurchased(item._id)}
                                className="me-3"
                              />
                              <div>
                                <div
                                  className={
                                    item.purchased
                                      ? "text-decoration-line-through"
                                      : ""
                                  }
                                >
                                  {item.name}
                                </div>
                                <small className="text-muted">
                                  Category:{" "}
                                  <span className="text-capitalize">
                                    {item.category}
                                  </span>
                                </small>
                              </div>
                            </div>

                            <div className="d-flex align-items-center">
                              {/* Quantity Controls */}
                              <div className="d-flex align-items-center me-3">
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item._id,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </Button>
                                <span className="mx-2">{item.quantity}</span>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item._id,
                                      item.quantity + 1
                                    )
                                  }
                                >
                                  +
                                </Button>
                                <span className="ms-1 text-muted small">
                                  {item.unit}
                                </span>
                              </div>

                              {/* Delete Button */}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteItem(item._id)}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                );
              })}

              {/* Empty State */}
              {groceryItems.length === 0 && !loading && (
                <Card className="border-0 shadow-sm text-center">
                  <Card.Body className="py-5">
                    <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">Your grocery list is empty</h5>
                    <p className="text-muted">
                      Add items manually or generate from a meal plan
                    </p>
                  </Card.Body>
                </Card>
              )}
            </div>
          )}
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => setShowExport(true)}
                  disabled={groceryItems.length === 0}
                >
                  <i className="fas fa-download me-2"></i>
                  Export List
                </Button>
                <Button
                  variant="outline-warning"
                  onClick={clearList}
                  disabled={groceryItems.length === 0}
                >
                  <i className="fas fa-trash me-2"></i>
                  Clear All Items
                </Button>
                <Button variant="outline-info">
                  <i className="fas fa-share-alt me-2"></i>
                  Share List
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Shopping Tips */}
          <Card className="border-0 shadow-sm bg-light">
            <Card.Body>
              <h6 className="mb-3">🛍️ Shopping Tips</h6>
              <ul className="list-unstyled small text-muted mb-0">
                <li className="mb-2">• Shop the perimeter for fresh produce</li>
                <li className="mb-2">• Check for sales and discounts</li>
                <li className="mb-2">• Buy in bulk for pantry staples</li>
                <li className="mb-2">• Don't shop hungry!</li>
                <li>• Bring reusable bags</li>
              </ul>
            </Card.Body>
          </Card>

          {/* Recent Purchases */}
          {stats.purchasedItems > 0 && (
            <Card className="border-0 shadow-sm mt-4">
              <Card.Header className="bg-white">
                <h6 className="mb-0">✅ Recently Purchased</h6>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {groceryItems
                    .filter((item) => item.purchased)
                    .slice(0, 5)
                    .map((item) => (
                      <ListGroup.Item
                        key={item._id}
                        className="px-0 py-1 small"
                      >
                        <div className="d-flex justify-content-between">
                          <span className="text-decoration-line-through text-muted">
                            {item.name}
                          </span>
                          <span className="text-muted">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default GroceryList;
