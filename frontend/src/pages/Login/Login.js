import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";
import loginPics1 from "../../assets/images/loginpics1.jpg";
import loginPics2 from "../../assets/images/loginpics2.jpg";
import loginPics3 from "../../assets/images/loginpics3.jpg";
import logoLK from "../../assets/images/logoLK.png";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Slideshow images - you can add more images here
  const images = [
    loginPics1,
    loginPics2, // Duplicate for now, replace with different images if available
    loginPics3,
  ];

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

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
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Login illustration ${index + 1}`}
              className={`login-image ${index === currentImageIndex ? 'active' : ''}`}
            />
          ))}
          <div className="slideshow-dots">
            {images.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
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

