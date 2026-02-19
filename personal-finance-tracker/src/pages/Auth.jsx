import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="app-title">💰 Personal Finance Tracker</h1>
        <p className="app-subtitle">
          {isLogin
            ? "Welcome back! Log in to manage your finances."
            : "Create an account to start tracking your money."}
        </p>

        <div className="auth-toggle">
          <button
            className={isLogin ? "active" : ""}
            type="button"
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={!isLogin ? "active" : ""}
            type="button"
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
            />
          </label>

          {!isLogin && (
            <label>
              Confirm Password
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
              />
            </label>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login to Dashboard"
              : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;

