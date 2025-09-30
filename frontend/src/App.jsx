import { useState } from "react";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  const [page, setPage] = useState("signup"); // "signup", "login", "dashboard"
  const [user, setUser] = useState(null);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setPage("dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div>
        {/* Navigation */}
        <div className="flex gap-4 mb-6 justify-center">
          <button onClick={() => setPage("signup")} className="px-3 py-1 bg-gray-200 rounded">
            Signup
          </button>
          <button onClick={() => setPage("login")} className="px-3 py-1 bg-gray-200 rounded">
            Login
          </button>
          <button onClick={() => setPage("dashboard")} className="px-3 py-1 bg-gray-200 rounded">
            Dashboard
          </button>
        </div>
        {/* Centered content */}
        {page === "signup" && <Signup />}
        {page === "login" && <Login onLogin={handleLogin} />}
        {page === "dashboard" && user && <Dashboard user={user} />}
      </div>
    </div>
  );
}

export default App;
