import React from "react";
import "./HouseholdTable.css";

const HouseholdTable = ({ data, onSplit, onDelete }) => {
  return (
    <div className="table-container">
      <table className="household-table">
        <colgroup>
          <col style={{ width: "8%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "30%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "15%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Số thứ tự</th>
            <th>Số hộ khẩu</th>
            <th>Chủ hộ</th>
            <th>Địa chỉ</th>
            <th className="text-center">Số nhân khẩu</th>
            <th className="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.stt}</td>
              <td>{row.code}</td>
              <td className="owner-name">{row.owner}</td>
              <td>{row.address}</td>
              <td className="text-center">{row.members}</td>
              <td className="text-center action-cell">
                <button
                  className="btn-action btn-split"
                  onClick={() => onSplit && onSplit(row)}
                >
                  Tách hộ khẩu
                </button>
                <button className="btn-action btn-detail">Chi tiết</button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => onDelete(row.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HouseholdTable;
