import React, { useState } from "react";
import "./HouseholdDetailModal.css";
import { Modal } from "../../../commons";

const HouseholdDetailModal = ({ isOpen, onClose, household }) => {
  const [activeTab, setActiveTab] = useState("payment");

  if (!household) return null;

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
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên đợt thu</th>
                    <th>Loại phí</th>
                    <th>Phải nộp</th>
                    <th>Đã nộp</th>
                    <th>Ngày nộp</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Phí vệ sinh năm 2024</td>
                    <td>
                      <span className="badge badge-mandatory">• Bắt buộc</span>
                    </td>
                    <td>360000</td>
                    <td>360000</td>
                    <td>07/01/2025</td>
                    <td>
                      <span className="badge badge-paid">• Đã nộp</span>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Ngày thương binh liệt sỹ 27/07 năm 2025</td>
                    <td>
                      <span className="badge badge-donation">• Ủng hộ</span>
                    </td>
                    <td>0</td>
                    <td>100000</td>
                    <td>20/07/2025</td>
                    <td>
                      <span className="badge badge-paid">• Đã nộp</span>
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Phí vệ sinh năm 2025</td>
                    <td>
                      <span className="badge badge-mandatory">• Bắt buộc</span>
                    </td>
                    <td>360000</td>
                    <td>0</td>
                    <td>NULL</td>
                    <td>
                      <span className="badge badge-owing">• Còn nợ</span>
                    </td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>Tết trung thu 2025</td>
                    <td>
                      <span className="badge badge-donation">• Ủng hộ</span>
                    </td>
                    <td>0</td>
                    <td>50000</td>
                    <td>22/08/2025</td>
                    <td>
                      <span className="badge badge-paid">• Đã nộp</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-container">
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ và tên</th>
                    <th>Ngày sinh</th>
                    <th>Quan hệ với chủ hộ</th>
                    <th>Trạng thái cư trú</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Nguyễn Minh Quân</td>
                    <td>36/36/2036</td>
                    <td>Chủ hộ</td>
                    <td>
                      <span className="badge badge-permanent">• Thường trú</span>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Phạm Phương Linh</td>
                    <td>36/36/2036</td>
                    <td>Vợ</td>
                    <td>
                      <span className="badge badge-permanent">• Thường trú</span>
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Nguyễn Minh Tùng</td>
                    <td>36/36/2036</td>
                    <td>Con trai</td>
                    <td>
                      <span className="badge badge-permanent">• Thường trú</span>
                    </td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>Phạm Minh Mai</td>
                    <td>36/36/2036</td>
                    <td>Con gái</td>
                    <td>
                      <span className="badge badge-temporary">• Tạm trú</span>
                    </td>
                  </tr>
                  <tr>
                    <td>5</td>
                    <td>Nguyễn Minh Long</td>
                    <td>36/36/2036</td>
                    <td>Con trai</td>
                    <td>
                      <span className="badge badge-absent">• Tạm vắng</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default HouseholdDetailModal;

