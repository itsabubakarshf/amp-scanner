import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Correct import from react-router-dom
import { postToServerNoToken } from "../helpers/request";
import { TailSpin } from "react-loader-spinner";

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and register

  // States for login and registration
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Fields are required");
      return;
    }
    setLoading(true);
    try {
      const response = await postToServerNoToken("/user/login", {
        email: loginEmail,
        password: loginPassword,
      });
      if (response.status) {
        toast.success(response.success);
        localStorage.setItem("accessToken", response.data.access);
        localStorage.setItem("userId", response.data.data._id)
        navigate("/");
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during login.");
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const response = await postToServerNoToken("/user/signup", {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      });
      if (response.status) {
        toast.success("Signup successful! Please login to continue.");
        setIsLogin(true); 
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during signup.");
    }
    setLoading(false);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setFirstName("");
    setLastName("");
    setPassword("");
    setConfirmPassword("");
    setLoginEmail("");
    setLoginPassword("");
  };

  return (
    <div
      className="container d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="row w-100">
        <div className="col-md-6 mx-auto">
          <div className="card">
            <div className="card-body">
              {/* Nav pills for toggling between login and register */}
              <ul className="nav nav-pills nav-justified mb-3">
                <li className="nav-item">
                  <button
                    className={`nav-link ${isLogin ? "active" : ""}`}
                    onClick={() => setIsLogin(true)}
                  >
                    Login
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${!isLogin ? "active" : ""}`}
                    onClick={() => setIsLogin(false)}
                  >
                    Register
                  </button>
                </li>
              </ul>

              {/* Login Form */}
              {isLogin && (
                <form onSubmit={handleLogin}>
                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="loginEmail">
                      Email
                    </label>
                    <input
                      type="email"
                      id="loginEmail"
                      className="form-control"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="loginPassword">
                      Password
                    </label>
                    <input
                      type="password"
                      id="loginPassword"
                      className="form-control"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary">
                      Sign in
                    </button>
                  </div>
                </form>
              )}
              {/* Registration Form */}
              {!isLogin && (
                <form onSubmit={handleSignUp}>
                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="firstName">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="form-control"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="lastName">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="form-control"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="email">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="password">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary">
                      Sign up
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
