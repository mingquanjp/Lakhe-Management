import React, { useState } from "react";
import "./HouseholdDetailModal.css";
import { Modal } from "../../../commons";
import EnhancedTable from "../../../commons/Table/EnhancedTable";

const HouseholdDetailModal = ({ isOpen, onClose, household }) => {
  const [activeTab, setActiveTab] = useState("payment");

  if (!household) return null;

  // Payment history data
  const paymentData = [
    {
      stt: 1,
      feeName: "Phí vệ sinh năm 2024",
      feeType: "mandatory",
      required: 360000,
      paid: 360000,
      paymentDate: "07/01/2025",
      status: "paid"
    },
    {
      stt: 2,
      feeName: "Ngày thương binh liệt sỹ 27/07 năm 2025",
      feeType: "donation",
      required: 0,
      paid: 100000,
      paymentDate: "20/07/2025",
      status: "paid"
    },
    {
      stt: 3,
      feeName: "Phí vệ sinh năm 2025",
      feeType: "mandatory",
      required: 360000,
      paid: 0,
      paymentDate: "NULL",
      status: "owing"
    },
    {
      stt: 4,
      feeName: "Tết trung thu 2025",
      feeType: "donation",
      required: 0,
      paid: 50000,
      paymentDate: "22/08/2025",
      status: "paid"
    }
  ];

  const paymentColumns = [
    { key: "stt", title: "STT" },
    { key: "feeName", title: "Tên đợt thu" },
    {
      key: "feeType",
      title: "Loại phí",
      render: (value) => (
        <span className={`badge ${value === "mandatory" ? "badge-mandatory" : "badge-donation"}`}>
          {value === "mandatory" ? "• Bắt buộc" : "• Ủng hộ"}
        </span>
      )
    },
    { key: "required", title: "Phải nộp" },
    { key: "paid", title: "Đã nộp" },
    { key: "paymentDate", title: "Ngày nộp" },
    {
      key: "status",
      title: "Trạng thái",
      render: (value) => (
        <span className={`badge ${value === "paid" ? "badge-paid" : "badge-owing"}`}>
          {value === "paid" ? "• Đã nộp" : "• Còn nợ"}
        </span>
      )
    }
  ];

  // Demographic data
  const demographicData = [
    {
      stt: 1,
      name: "Nguyễn Minh Quân",
      birthDate: "36/36/2036",
      relationship: "Chủ hộ",
      residenceStatus: "permanent"
    },
    {
      stt: 2,
      name: "Phạm Phương Linh",
      birthDate: "36/36/2036",
      relationship: "Vợ",
      residenceStatus: "permanent"
    },
    {
      stt: 3,
      name: "Nguyễn Minh Tùng",
      birthDate: "36/36/2036",
      relationship: "Con trai",
      residenceStatus: "permanent"
    },
    {
      stt: 4,
      name: "Phạm Minh Mai",
      birthDate: "36/36/2036",
      relationship: "Con gái",
      residenceStatus: "temporary"
    },
    {
      stt: 5,
      name: "Nguyễn Minh Long",
      birthDate: "36/36/2036",
      relationship: "Con trai",
      residenceStatus: "absent"
    }
  ];

  const demographicColumns = [
    { key: "stt", title: "STT" },
    { key: "name", title: "Họ và tên" },
    { key: "birthDate", title: "Ngày sinh" },
    { key: "relationship", title: "Quan hệ với chủ hộ" },
    {
      key: "residenceStatus",
      title: "Trạng thái cư trú",
      render: (value) => {
        let badgeClass = "badge-permanent";
        let text = "• Thường trú";
        if (value === "temporary") {
          badgeClass = "badge-temporary";
          text = "• Tạm trú";
        } else if (value === "absent") {
          badgeClass = "badge-absent";
          text = "• Tạm vắng";
        }
        return <span className={`badge ${badgeClass}`}>{text}</span>;
      }
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thông tin chi tiết hộ khẩu"
      size="large"
      className="household-detail-modal-wrapper"
    >
      <div className="household-detail-content">
        <div className="household-info-card">
          <div className="household-info-row">
            <div className="info-item">
              <span className="info-label">Số hộ khẩu:</span>
              <span className="info-value">{household.householdId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Họ và tên chủ hộ:</span>
              <span className="info-value">{household.ownerName}</span>
            </div>
          </div>
          <div className="household-info-row">
            <div className="info-item">
              <span className="info-label">Địa chỉ:</span>
              <span className="info-value">{household.houseNumber}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Xã:</span>
              <span className="info-value">Yên Sơn</span>
            </div>
            <div className="info-item">
              <span className="info-label">Huyện:</span>
              <span className="info-value">Quốc Oai</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          <button
            className={`tab-button ${activeTab === "payment" ? "active" : ""}`}
            onClick={() => setActiveTab("payment")}
          >
            Lịch sử thu/nộp
          </button>
          <button
            className={`tab-button ${activeTab === "demographic" ? "active" : ""}`}
            onClick={() => setActiveTab("demographic")}
          >
            Chi tiết nhân khẩu
          </button>
        </div>

            <div className="tab-content-wrapper">
          {activeTab === "payment" ? (
            <div className="table-container">
              <EnhancedTable columns={paymentColumns} data={paymentData} className="detail-table" />
            </div>
          ) : (
            <div className="table-container">
              <EnhancedTable columns={demographicColumns} data={demographicData} className="detail-table" />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default HouseholdDetailModal;

