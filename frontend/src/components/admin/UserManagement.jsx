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
  InputGroup,
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import jsPDF from "jspdf";

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );





  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers((prev) => prev.filter((user) => user._id !== userToDelete._id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };



  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const getDietaryPreference = (user) => {
    return user.profile?.dietaryPreference || "Not set";
  };

  const handleViewUserDetails = (user) => {
    setUserDetails(user);
    setNewRole(user.role);
    setShowUserDetailsModal(true);
  };

  const handleUpdateUserRole = async () => {
    if (!userDetails || !newRole) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userDetails._id}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      const data = await response.json();

      // Update the user in the local state
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userDetails._id ? { ...user, role: newRole } : user
        )
      );

      setUserDetails((prev) => ({ ...prev, role: newRole }));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportUsers = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("User Management Report", 20, 20);

    let yPosition = 40;
    users.forEach((user, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text(`User ${index + 1}: ${user.name}`, 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.text(`Email: ${user.email}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Role: ${user.role}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Joined: ${formatDate(user.createdAt)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Last Login: ${formatDate(user.lastLogin)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Goal: ${user.profile?.goal || "Not set"}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Dietary Preference: ${getDietaryPreference(user)}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Activity Level: ${user.profile?.activityLevel || "Not set"}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Daily Calories: ${user.profile?.dailyCalories || "Not set"}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Age: ${user.profile?.age || "Not set"}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Gender: ${user.profile?.gender || "Not set"}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Height: ${user.profile?.height ? `${user.profile.height} cm` : "Not set"}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Weight: ${user.profile?.weight ? `${user.profile.weight} kg` : "Not set"}`, 20, yPosition);
      yPosition += 8;
      doc.text(`BMI: ${user.profile?.bmi || "Not set"}`, 20, yPosition);
      yPosition += 20;
    });

    doc.save("users_report.pdf");
  };

  return (
    <Container className="my-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="bg-dark text-white rounded p-4">
            <h1 className="h2 mb-2">👥 User Management</h1>
            <p className="mb-0 opacity-75">
              Manage user accounts and monitor activity
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
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <i className="fas fa-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex gap-2">
              <Button variant="outline-primary" onClick={handleExportUsers}>
                <i className="fas fa-download me-2"></i>
                Export
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Users ({filteredUsers.length})</h5>
        </Card.Header>

        {loading ? (
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading users...</p>
          </Card.Body>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>

                  <th>User</th>
                  <th>Dietary Preference</th>
                  <th>Goal</th>
                  <th>Last Login</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>

                    <td>
                      <div>
                        <div className="fw-medium">{user.name}</div>
                        <small className="text-muted">{user.email}</small>
                        <div>
                          <Badge
                            bg={user.role === "admin" ? "danger" : "secondary"}
                            className="me-1"
                          >
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg="outline-primary" text="dark">
                        {getDietaryPreference(user)}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg="outline-success" text="dark">
                        {user.profile?.goal || "Not set"}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(user.lastLogin)}
                      </small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(user.createdAt)}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-1">

                        <Button
                          variant="outline-info"
                          size="sm"
                          title="View Profile"
                          onClick={() => handleViewUserDetails(user)}
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-users fa-3x mb-3"></i>
                <p>No users found</p>
                {searchTerm && (
                  <Button
                    variant="outline-primary"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <div>
              <p>Are you sure you want to delete the following user?</p>
              <div className="bg-light p-3 rounded">
                <strong>{userToDelete.name}</strong>
                <br />
                <small className="text-muted">{userToDelete.email}</small>
              </div>
              <Alert variant="warning" className="mt-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                This action cannot be undone. All user data including recipes
                and meal plans will be permanently deleted.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteUser}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Deleting...
              </>
            ) : (
              "Delete User"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* User Details Modal */}
      <Modal
        show={showUserDetailsModal}
        onHide={() => setShowUserDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userDetails && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h6>Basic Information</h6>
                  <p><strong>Name:</strong> {userDetails.name}</p>
                  <p><strong>Email:</strong> {userDetails.email}</p>
                  <p><strong>Joined:</strong> {formatDate(userDetails.createdAt)}</p>
                  <p><strong>Last Login:</strong> {formatDate(userDetails.lastLogin)}</p>
                </Col>
                <Col md={6}>
                  <h6>Profile Information</h6>
                  <p><strong>Goal:</strong> {userDetails.profile?.goal || "Not set"}</p>
                  <p><strong>Dietary Preference:</strong> {getDietaryPreference(userDetails)}</p>
                  <p><strong>Activity Level:</strong> {userDetails.profile?.activityLevel || "Not set"}</p>
                  <p><strong>Daily Calories:</strong> {userDetails.profile?.dailyCalories || "Not set"}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <h6>Physical Information</h6>
                  <p><strong>Age:</strong> {userDetails.profile?.age || "Not set"}</p>
                  <p><strong>Gender:</strong> {userDetails.profile?.gender || "Not set"}</p>
                  <p><strong>Height:</strong> {userDetails.profile?.height ? `${userDetails.profile.height} cm` : "Not set"}</p>
                  <p><strong>Weight:</strong> {userDetails.profile?.weight ? `${userDetails.profile.weight} kg` : "Not set"}</p>
                  <p><strong>BMI:</strong> {userDetails.profile?.bmi || "Not set"}</p>
                </Col>
                <Col md={6}>
                  <h6>Change Role</h6>
                  <Form.Group>
                    <Form.Label>Current Role: <Badge bg={userDetails.role === "admin" ? "danger" : "secondary"}>{userDetails.role}</Badge></Form.Label>
                    <Form.Select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      disabled={actionLoading || userDetails._id === currentUser._id}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                    {userDetails._id === currentUser._id && (
                      <Form.Text className="text-muted">
                        You cannot change your own role.
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowUserDetailsModal(false)}
            disabled={actionLoading}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateUserRole}
            disabled={actionLoading || newRole === userDetails?.role}
          >
            {actionLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Updating...
              </>
            ) : (
              "Update Role"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;
