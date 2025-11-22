import React from "react";
import "./Table.css";

/**
 * EnhancedTable - Wrapper component cho Table với hỗ trợ custom rendering
 * 
 * Hỗ trợ thêm:
 * - render function để custom cell rendering
 * - headerRender function để custom header rendering
 * 
 * @param {Array} columns - Mảng columns với key, title, render (optional), headerRender (optional)
 * @param {Array} data - Mảng dữ liệu
 * @param {String} className - Custom className
 */
const EnhancedTable = ({ columns = [], data = [], className = "", ...props }) => {
  return (
    <div className={`table-container ${className}`} {...props}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="table-header">
                {column.headerRender 
                  ? column.headerRender() 
                  : column.title || ""}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="table-row">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="table-cell">
                    {column.render
                      ? column.render(column.key ? row[column.key] : undefined, row, rowIndex)
                      : column.key ? row[column.key] : ""}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EnhancedTable;

