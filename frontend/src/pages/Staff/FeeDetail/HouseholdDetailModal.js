import React, { useState, useEffect } from "react";
import "./HouseholdDetailModal.css";
import { Modal } from "../../../components/commons";
import EnhancedTable from "../../../components/commons/Table/EnhancedTable";
import { fetchHouseholdPaymentHistory, fetchHouseholdResidents } from "../../../utils/api";

const HouseholdDetailModal = ({ isOpen, onClose, household }) => {
  const [activeTab, setActiveTab] = useState("payment");
  const [paymentData, setPaymentData] = useState([]);
  const [demographicData, setDemographicData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data khi modal mở và có household
  useEffect(() => {
    if (!isOpen || !household?.household_id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [paymentsRes, residentsRes] = await Promise.all([
          fetchHouseholdPaymentHistory(household.household_id),
          fetchHouseholdResidents(household.household_id)
        ]);

        if (paymentsRes.success) {
          setPaymentData(paymentsRes.data.map((p, index) => ({
            stt: index + 1,
            feeName: p.fee_name,
            feeType: p.fee_type === 'Mandatory' ? 'mandatory' : 'donation',
            required: p.required_amount || 0,
            paid: p.paid_amount || 0,
            paymentDate: p.payment_date 
              ? new Date(p.payment_date).toLocaleDateString('vi-VN') 
              : 'Chưa nộp',
            status: p.status
          })));
        }

        if (residentsRes.success) {
          setDemographicData(residentsRes.data.map((r, index) => ({
            stt: index + 1,
            name: r.full_name,
            birthDate: r.dob ? new Date(r.dob).toLocaleDateString('vi-VN') : '',
            relationship: r.relationship_to_head,
            residenceStatus: r.residence_status === 'Temporary' ? 'temporary' 
              : r.absence_destination ? 'absent' : 'permanent'
          })));
        }
      } catch (err) {
        console.error('Error loading household data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isOpen, household]);

  if (!household) return null;

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
    { 
      key: "required", 
      title: "Phải nộp",
      render: (value) => new Intl.NumberFormat('vi-VN').format(value)
    },
    { 
      key: "paid", 
      title: "Đã nộp",
      render: (value) => new Intl.NumberFormat('vi-VN').format(value)
    },
    { key: "paymentDate", title: "Ngày nộp" },
    {
      key: "status",
      title: "Trạng thái",
      render: (value) => (
        <span className={`badge ${value === "paid" ? "badge-paid" : "badge-owing"}`}>
          {value === "paid" ? "• Đã nộp" : value === "optional" ? "• Tùy chọn" : "• Còn nợ"}
        </span>
      )
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
              <span className="info-value">{household.household_code || household.householdId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Họ và tên chủ hộ:</span>
              <span className="info-value">{household.owner_name || household.ownerName}</span>
            </div>
          </div>
          <div className="household-info-row">
            <div className="info-item">
              <span className="info-label">Địa chỉ:</span>
              <span className="info-value">{household.address || household.houseNumber}</span>
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
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : activeTab === "payment" ? (
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
