/**
 * Pagination Component
 * ------------------------------------
 * Cách dùng:
 * 
 * const [currentPage, setCurrentPage] = useState(1);
 * const totalPages = 20;
 * 
 * <Pagination
 *    currentPage={currentPage}        // trang hiện tại
 *    totalPages={totalPages}          // tổng số trang
 *    onPageChange={(page) => {        // callback đổi trang
 *        setCurrentPage(page);
 *    }}
 * />
 * 
 * Component này sẽ tự hiển thị dạng rút gọn:
 * 1 ... 4 5 6 ... 20
 */

import React from "react";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const generatePages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const pageList = generatePages();

  return (
    <div className="pagination-wrapper">
      <button
        className="page-btn prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {pageList.map((p, index) =>
        p === "..." ? (
          <span key={index} className="page-dots">...</span>
        ) : (
          <button
            key={index}
            className={`page-btn ${currentPage === p ? "active" : ""}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className="page-btn next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;