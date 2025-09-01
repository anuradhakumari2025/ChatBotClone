import { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Login = () => {
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const { navigate, BACKEND_URL, setUser } = useContext(ChatContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setGeneralError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get("email")?.trim();
    const password = formData.get("password")?.trim();

    if (!email) {
      setEmailError("Email is required.");
      setLoading(false);
      return;
    }
    if (!password) {
      setPasswordError("Password is required.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${BACKEND_URL}/auth/login`,
        { email, password },
        {
          withCredentials: true,
        }
      );
      if (res.statusText == "OK") {
        toast.success(res.data.message, {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
        setUser(res.data.user);
        navigate("/");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      setGeneralError("Network Error");
      toast.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h2 className="auth-title">Welcome Back</h2>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email"
              disabled={loading}
            />
            {emailError && <span className="error">{emailError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              disabled={loading}
            />
            {passwordError && <span className="error">{passwordError}</span>}
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {generalError && <span className="error">{generalError}</span>}
        </form>
        <p className="switch-auth">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
