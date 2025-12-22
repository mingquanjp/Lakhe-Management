import "./Loading.css";

/**
 * Loading Component - Component hiển thị trạng thái đang tải
 *
 * // Loading với các tùy chọn như:
 * - size ('small', 'medium', 'large') - kích thước spinner
 * - text (chuỗi text hiển thị) - mặc định 'Đang tải...'
 * - overlay (true/false) - hiển thị loading toàn màn hình với nền mờ
 *
 * Anh em dùng Loading khi cần hiển thị trạng thái đang xử lý/tải dữ liệu
 *
 * @example
 * // Loading cơ bản
 * <Loading />
 *
 * // Loading với text tùy chỉnh
 * <Loading text="Đang xử lý..." />
 *
 * // Loading overlay (che toàn màn hình)
 * <Loading overlay={true} text="Đang xử lý, vui lòng đợi..." />
 *
 */
const Loading = ({
  size = "medium",
  text = "Đang tải...",
  overlay = false,
}) => {
  const loadingContent = (
    <div className={`loading loading-${size}`}>
      <div className="loading-spinner"></div>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );

  if (overlay) {
    return <div className="loading-overlay">{loadingContent}</div>;
  }

  return loadingContent;
};

export default Loading;
