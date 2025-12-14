import React from "react";
import "./TemporaryAbsenceList.css";

const TemporaryAbsenceTable = ({ data, onDetail }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="table-container">
      <table className="household-table">
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "25%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ tên</th>
            <th>CMND/CCCD</th>
            <th>Nơi tạm vắng</th>
            <th>Từ ngày</th>
            <th>Đến ngày</th>
            <th>Lý do</th>
            <th className="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.id}</td>
              <td className="owner-name">{row.last_name} {row.first_name}</td>
              <td>{row.identity_card_number}</td>
              <td>{row.temporary_address}</td>
              <td>{formatDate(row.start_date)}</td>
              <td>{formatDate(row.end_date)}</td>
              <td>{row.reason}</td>
              <td className="text-center action-cell">
                <button 
                  className="btn-action btn-detail"
                  onClick={() => onDetail(row)}
                >
                  Chi tiết
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center">Không có dữ liệu</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TemporaryAbsenceTable;