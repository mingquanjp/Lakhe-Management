import React from "react";
import "./Buttons.css";

/**
 * Button Component - Component nút bấm có thể tùy chỉnh
 *
 * // Button với các tùy chọn khác như 
 * - variant ("primary", "secondary", "outline")
 * - size ("small", "medium", "large")
 * - disabled ("false","true")
 * 
 * Anh em có thể tự chọn các tùy chọn trên hoặc dùng Button basic cho nhanh
 * <Button onClick={handleClick}>Click me</Button>
 * 
 
 */
const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  onClick,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${
        disabled ? "btn-disabled" : ""
      }`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
