import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";
import loginPics from "../../assets/images/loginpics.jpg";
import logoLK from "../../assets/images/logoLK.png";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        // Redirect based on user role
        if (result.user.role === "admin") {
          navigate("/admin");
        } else if (result.user.role === "staff") {
          navigate("/staff");
        }
      } else {
        setError(result.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Lỗi kết nối server. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
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

          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-wrapper">
              <input
                type="text"
                name="username"
                className="login-input"
                placeholder="Nhập tài khoản"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                required
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
                disabled={loading}
                required
              />
            </div>
            <div className="forgot-password-wrapper">
              <a href="#" className="forgot-password">
                Quên mật khẩu?
              </a>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

