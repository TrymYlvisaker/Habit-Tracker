import { useState, useEffect } from "react";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
    setPage("dashboard");

    localStorage.setItem("user", JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setPage("login");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div>
        {!isAuthenticated && (
          <div className="flex gap-4 mb-6 justify-center">
            <button 
              onClick={() => setPage("signup")} 
              className={`px-3 py-1 rounded ${page === "signup" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Signup
            </button>
            <button 
              onClick={() => setPage("login")} 
              className={`px-3 py-1 rounded ${page === "login" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Login
            </button>
          </div>
        )}

        {isAuthenticated && (
          <div className="flex justify-center mb-6">
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        )}

        {!isAuthenticated && page === "signup" && <Signup onSignup={handleLogin} />}
        {!isAuthenticated && page === "login" && <Login onLogin={handleLogin} />}
        {isAuthenticated && user && <Dashboard user={user} />}
      </div>
    </div>
  );
}

export default App;
