import { useState } from "react";
import { signup } from "../api";

export default function Signup({ onSignup }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await signup({ name, password });
      setSuccess("Signup successful!");
      console.log(response);
      
      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        if (onSignup) {
          onSignup(response.user);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem', backgroundColor: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>Sign Up</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Name:</span>
            <input
              type="text"
              name="username"
              id="signup-username"
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
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
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
            {loading ? "Signing Up..." : "Sign Up"}
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
          
          {success && (
            <div style={{ 
              color: '#16a34a', 
              fontSize: '0.875rem', 
              backgroundColor: '#f0fdf4', 
              padding: '0.75rem', 
              borderRadius: '0.375rem', 
              border: '1px solid #86efac',
              marginTop: '1rem'
            }}>
              {success}
            </div>
          )}
        </form>
      </div>
  );
}