import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const { navigate, BACKEND_URL } = useContext(ChatContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setUsernameError("");
    setGeneralError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get("email")?.trim();
    const password = formData.get("password")?.trim();
    const username = formData.get("username")?.trim();
    if (!username) {
      setUsernameError("Username is required.");
      setLoading(false);
      return;
    }
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
        `${BACKEND_URL}/auth/register`,
        { email, password, username },
        {
          withCredentials: true,
        }
      );
      // if (res.statusText == "OK") {
        toast.success(res.data.message, {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
        navigate("/login");
      // } 
      // else {
      //   toast.error(res.data.message);
      // }
    } catch (err) {
      setGeneralError("Network Error");
      console.log(err);
      toast.error(err);
    }

    setLoading(false);
  };
  return (
    <div className="container">
      <div className="auth-container">
        <h2 className="auth-title">Create Account</h2>
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter username"
            />
            {usernameError && <span className="error">{usernameError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email"
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
            />
            {passwordError && <span className="error">{passwordError}</span>}
          </div>

          <button type="submit" className="btn">
            {loading ? "Registering in..." : "Register"}
          </button>
          {generalError && <span className="error">{generalError}</span>}
        </form>
        <p className="switch-auth">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
