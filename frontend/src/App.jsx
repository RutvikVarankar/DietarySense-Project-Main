import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Container } from "react-bootstrap";

// Layout Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Onboarding from "./components/auth/Onboarding";

// Main Components
import Dashboard from "./components/dashboard/Dashboard";
import RecipeBrowser from "./components/recipes/RecipeBrowser";
import RecipeDetail from "./components/recipes/RecipeDetail";
import SpoonacularRecipeDetail from "./components/recipes/SpoonacularRecipeDetail";
import MealPlanGenerator from "./components/mealplanner/MealPlanGenerator";
import GroceryList from "./components/grocery/GroceryList";
import Profile from "./pages/Profile";

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import RecipeManagement from "./components/admin/RecipeManagement";

// Chatbot


// Styles
import "./styles/custom.scss";

// Loading Component
const LoadingSpinner = () => (
  <Container className="d-flex justify-content-center align-items-center min-vh-100">
    <div className="text-center">
      <div className="loading-spinner mb-3"></div>
      <p className="text-muted">Loading DietarySense...</p>
    </div>
  </Container>
);

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return !user ? children : <Navigate to="/dashboard" />;
};

// Main App Component
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {user && <Navbar />}

      <main className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes"
            element={
              <ProtectedRoute>
                <RecipeBrowser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes/:id"
            element={
              <ProtectedRoute>
                <RecipeDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes/spoonacular/:id"
            element={
              <ProtectedRoute>
                <SpoonacularRecipeDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meal-planner"
            element={
              <ProtectedRoute>
                <MealPlanGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grocery-list"
            element={
              <ProtectedRoute>
                <GroceryList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/recipes"
            element={
              <ProtectedRoute requireAdmin>
                <RecipeManagement />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={<Navigate to={user ? "/dashboard" : "/login"} />}
          />

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <Container className="my-5 text-center">
                <div className="py-5">
                  <h1 className="display-1 text-muted">404</h1>
                  <h2 className="mb-3">Page Not Found</h2>
                  <p className="text-muted mb-4">
                    The page you're looking for doesn't exist.
                  </p>
                  <a href="/" className="btn btn-primary btn-lg">
                    Go Home
                  </a>
                </div>
              </Container>
            }
          />
        </Routes>


      </main>

      {user && <Footer />}
    </div>
  );
}

// Main App Wrapper
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
