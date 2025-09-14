import React, { useState } from "react";
import "./css/signupStyle.css";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD17Rba3hlcxOe2mmDr_U1xB2lAPnuhTrA",
  authDomain: "fruit-ninja-handtracker.firebaseapp.com",
  projectId: "fruit-ninja-handtracker",
  storageBucket: "fruit-ninja-handtracker.appspot.com",
  messagingSenderId: "480626111321",
  appId: "1:480626111321:web:762bb55cb22dce3d2e9248"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function SignIn({ onSuccess }) {
  const [mode, setMode] = useState("signin"); // "signin" or "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear error when switching modes
  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
  };

  // ===== SIGN UP =====
  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Uncomment when backend is ready
      // await fetch("http://localhost:5000/signup", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     firebaseUid: user.uid,
      //     name: name,
      //     email: email,
      //     premiumStatus: 0
      //   })
      // });

      alert("Account created successfully!");
      setMode("signin");
      setName("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== SIGN IN =====
  const handleSignin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Uncomment when backend is ready
      // const res = await fetch(`http://localhost:5000/user/${user.uid}`);
      // const data = await res.json();
      // const usernameToPass = data.name || user.email;

      if (onSuccess) {
        onSuccess(user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "signin") {
      handleSignin();
    } else {
      handleSignup();
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <h1 id="title">{mode === "signup" ? "Sign Up" : "Sign In"}</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            {mode === "signup" && (
              <div className="input-field">
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div className="input-field">
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="input-field">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength="6"
              />
            </div>

            {mode === "signin" && (
              <div className="forgot-password">
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Forgot Password?
                </a>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          <div className="btn-field">
            <button
              type="submit"
              className={`primary-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Please wait...' : (mode === "signup" ? "Create Account" : "Sign In")}
            </button>
          </div>

          <div className="mode-toggle">
            {mode === "signin" ? (
              <p>
                Don't have an account?{" "}
                <span 
                  className="toggle-link" 
                  onClick={() => switchMode("signup")}
                >
                  Sign up here
                </span>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <span 
                  className="toggle-link" 
                  onClick={() => switchMode("signin")}
                >
                  Sign in here
                </span>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}