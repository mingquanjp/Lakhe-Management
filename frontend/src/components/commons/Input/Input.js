import "./Input.css";
import React from "react";

/**
 * Input Component - Component ô nhập liệu có thể tùy chỉnh
 *
 * // Input với các tùy chọn như:
 * - type ("text", "email", "password", "number", v.v.)
 * - label (nhãn hiển thị phía trên)
 * - error (hiển thị thông báo lỗi)
 * - helptext (hiển thị gợi ý)
 * - required (đánh dấu trường bắt buộc)
 *
 * Anh em có thể dùng Input cơ bản hoặc tùy chỉnh theo nhu cầu
 *
 * @example
 * // Input cơ bản
 * <Input placeholder="Nhập họ tên" />
 *
 * // Input với label và required
 * <Input label="Email" type="email" required placeholder="example@gmail.com" />
 *
 * // Input với thông báo lỗi
 * <Input label="Mật khẩu" type="password" error="Mật khẩu quá ngắn" />
 *
 * // Input với gợi ý
 * <Input label="Số điện thoại" helptext="Nhập số điện thoại 10 số" />
 */
const Input = ({
  label,
  type = "text",
  error,
  helptext,
  placeholder,
  required = false,
  ...props
}) => {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <input
        type={type}
        className={`input-field ${error ? "input-error" : ""}`}
        placeholder={placeholder}
        {...props}
      />

      {(error || helptext) && (
        <div className={`input-message ${error ? "error" : "helper"}`}>
          {error || helptext}
        </div>
      )}
    </div>
  );
};
export default Input;