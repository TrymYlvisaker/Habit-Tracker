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
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem', backgroundColor: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>Login</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Name:</span>
            <input
              type="text"
              name="username"
              id="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              style={{ border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', width: '100%', boxSizing: 'border-box' }}
              required
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Password:</span>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              style={{ border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', width: '100%', boxSizing: 'border-box' }}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              padding: '0.75rem 1rem', 
              borderRadius: '0.375rem', 
              color: 'white', 
              fontWeight: '500',
              backgroundColor: loading ? '#93c5fd' : '#3b82f6',
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {loading ? "Logging In..." : "Login"}
          </button>

          {error && (
            <div style={{ 
              color: '#dc2626', 
              fontSize: '0.875rem', 
              backgroundColor: '#fef2f2', 
              padding: '0.75rem', 
              borderRadius: '0.375rem', 
              border: '1px solid #fecaca',
              marginTop: '1rem'
            }}>
              {error}
            </div>
          )}
        </form>
      </div>
  );
}