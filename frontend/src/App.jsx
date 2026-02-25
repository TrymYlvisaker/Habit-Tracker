import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setPage("dashboard");
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clean up corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Handle successful login - store user data and redirect to dashboard
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setPage("dashboard");
  };

  // Handle logout - clear all user data and redirect to login
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setPage("login");
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '1rem' }}>
      {!isAuthenticated ? (
        <>
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPage("signup")}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                border: '1px solid #d1d5db',
                backgroundColor: page === "signup" ? '#3b82f6' : 'white',
                color: page === "signup" ? 'white' : '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (page !== "signup") {
                  e.target.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== "signup") {
                  e.target.style.backgroundColor = 'white';
                }
              }}
            >
              Sign Up
            </button>
            <button
              onClick={() => setPage("login")}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                border: '1px solid #d1d5db',
                backgroundColor: page === "login" ? '#3b82f6' : 'white',
                color: page === "login" ? 'white' : '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (page !== "login") {
                  e.target.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== "login") {
                  e.target.style.backgroundColor = 'white';
                }
              }}
            >
              Login
            </button>
          </div>
          {page === "login" && <Login onLogin={handleLogin} />}
          {page === "signup" && <Signup onSignup={handleLogin} />}
        </>
      ) : (
        <>
          <button
            onClick={handleLogout}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.5rem 1.5rem',
              borderRadius: '0.375rem',
              fontWeight: '500',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              color: '#374151',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fee2e2';
              e.target.style.color = '#dc2626';
              e.target.style.borderColor = '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#374151';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            Logout
          </button>
          <Dashboard user={user} />
        </>
      )}
    </div>
  );
}

export default App;