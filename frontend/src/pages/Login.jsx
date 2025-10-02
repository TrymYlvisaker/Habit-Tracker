import { useState } from "react";
import { login } from "../api";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login({ name, password });

      if (response.error) {
        setError(response.error);
      } else {
        // Store JWT for later API calls
        localStorage.setItem("token", response.token);
        onLogin(response.user);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          <label className="flex flex-col">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className={`py-2 rounded text-white ${
              loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Logging In..." : "Login"}
          </button>

          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
      </div>
  );
}
