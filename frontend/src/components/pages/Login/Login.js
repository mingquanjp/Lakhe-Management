import React, { useState } from "react";
import "./Login.css";
import loginPics from "../../../assets/images/loginpics.jpg";
import logoLK from "../../../assets/images/logoLK.png";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login submitted:", formData);
  }; 

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-illustration">
          <img src={loginPics} alt="Login illustration" className="login-image" />
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-container">
          <div className="login-logo">
            <img src={logoLK} alt="Lakhe Logo" className="logo-image" />
          </div>

          <h1 className="login-welcome">Chào mừng trở lại!</h1>
          <p className="login-instruction">Vui lòng đăng nhập để tiếp tục</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-wrapper">
              <input
                type="text"
                name="username"
                className="login-input"
                placeholder="Nhập tài khoản"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="login-input-wrapper password-wrapper">
              <input
                type="password"
                name="password"
                className="login-input"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="forgot-password-wrapper">
              <a href="#" className="forgot-password">
                Quên mật khẩu?
              </a>
            </div>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

