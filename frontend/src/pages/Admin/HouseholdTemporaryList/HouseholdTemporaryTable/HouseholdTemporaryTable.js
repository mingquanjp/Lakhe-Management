import React from "react";
import "./HouseholdTemporaryTable.css";
import { useNavigate } from "react-router-dom";

const HouseholdTemporaryTable = ({ data, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="table-container">
      <table className="household-table">
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "25%" }} />
          <col style={{ width: "30%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "15%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã hộ</th>
            <th>Chủ hộ</th>
            <th>Địa chỉ</th>
            <th className="text-center">Số nhân khẩu</th>
            <th className="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.stt || index + 1}</td>
              <td>{row.code}</td>
              <td className="owner-name">{row.owner}</td>
              <td>{row.address}</td>
              <td className="text-center">{row.members}</td>
              <td className="text-center action-cell">
                <button
                  className="btn-action btn-detail"
                  onClick={() => {
                    navigate(`/admin/temporary-household/${row.id}`);
                  }}
                >
                  Chi tiết
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => onDelete && onDelete(row.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan="6"
                className="text-center"
                style={{ padding: "20px", color: "#666" }}
              >
                Không có dữ liệu hiển thị
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HouseholdTemporaryTable;
