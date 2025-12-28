import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../../components/commons/Card/Card';
import Table from '../../../components/commons/Table/Table';
import Button from '../../../components/commons/Button/Button';
import Modal from '../../../components/commons/Modal/Modal';
import AddMemberModal from './AddMemberModal';
import { getHouseholdById, fetchHistory, getAuthToken } from '../../../utils/api';
import './HouseholdDetail.css';

const StatusBadge = ({ status }) => {
    let colorClass = '';
    let dotColor = '';
    let displayStatus = status;
    
    if (status === 'Permanent' || status === 'Thường trú') {
        colorClass = 'bg-green-100 text-green-700';
        dotColor = 'bg-green-500';
        displayStatus = 'Thường trú';
    } else if (status === 'MovedOut' || status === 'Đã chuyển đi') {
        colorClass = 'bg-yellow-100 text-yellow-700';
        dotColor = 'bg-yellow-500';
        displayStatus = 'Đã chuyển đi';
    } else if (status === 'Deceased' || status === 'Đã qua đời') {
        colorClass = 'bg-red-100 text-red-700';
        dotColor = 'bg-red-500';
        displayStatus = 'Đã qua đời';
    } else if (status === 'Temporary' || status === 'Tạm trú') {
        colorClass = 'bg-blue-100 text-blue-700';
        dotColor = 'bg-blue-500';
        displayStatus = 'Tạm trú';
    } else {
        colorClass = 'bg-gray-100 text-gray-700';
        dotColor = 'bg-gray-500';
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></span>
            {displayStatus}
        </span>
    );
};

const HouseholdDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [household, setHousehold] = useState(null);
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [addMemberType, setAddMemberType] = useState('NewBirth'); // 'NewBirth' or 'MoveIn'
    const [editingMember, setEditingMember] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [selectedResidentDetail, setSelectedResidentDetail] = useState(null); // For MovedOut/Deceased details
    const [notification, setNotification] = useState({
        isOpen: false,
        type: 'success',
        message: ''
    });

    useEffect(() => {
        fetchHouseholdDetails();
    }, [id]);

    const fetchHouseholdDetails = async () => {
        try {
            const data = await getHouseholdById(id);
            setHousehold(data.household);
            setResidents(data.residents);
        } catch (error) {
            console.error('Error fetching household details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchHistory = async () => {
        try {
            const data = await fetchHistory(id);
            setHistoryData(data.data);
            setIsHistoryModalOpen(true);
        } catch (error) {
            console.error('Error fetching history:', error);
            setNotification({
                isOpen: true,
                type: 'error',
                message: 'Không thể tải lịch sử biến động. Vui lòng thử lại sau.'
            });
        }
    };

    const handleSelectType = (type) => {
        setEditingMember(null);
        setAddMemberType(type);
        setIsAddMemberModalOpen(true);
    };

    const handleEditClick = (member) => {
        setEditingMember(member);
        // Nếu là tạm trú thì set type là MoveIn để hiện các trường tạm trú
        if (member.status === 'Temporary' || member.status === 'Tạm trú') {
            setAddMemberType('MoveIn');
        } else {
            // Nếu là thường trú thì set type khác NewBirth để hiện đầy đủ các trường (nghề nghiệp, CCCD...)
            setAddMemberType('Permanent');
        }
        setIsAddMemberModalOpen(true);
    };

    const handleDeleteClick = async (residentId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhân khẩu này?')) {
            try {
                const token = getAuthToken();
                
                const response = await fetch(`http://localhost:5000/api/residents/${residentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                    
                });

                if (response.ok) {
                    setNotification({
                        isOpen: true,
                        type: 'success',
                        message: 'Xóa nhân khẩu thành công!'
                    });
                    fetchHouseholdDetails();
                } else {
                    const errorData = await response.json();
                    setNotification({
                        isOpen: true,
                        type: 'error',
                        message: `Lỗi: ${errorData.message}`
                    });
                }
            } catch (error) {
                console.error('Error deleting resident:', error);
                setNotification({
                    isOpen: true,
                    type: 'error',
                    message: 'Có lỗi xảy ra khi xóa nhân khẩu'
                });
            }
        }
    };

    const handleSaveMember = async (memberData) => {
        try {
            const token = getAuthToken();
            
            const url = editingMember 
                ? `http://localhost:5000/api/residents/${editingMember.resident_id}`
                : 'http://localhost:5000/api/residents';
            
            const method = editingMember ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
            
                },
                body: JSON.stringify(memberData),
            });

            if (response.ok) {
                setNotification({
                    isOpen: true,
                    type: 'success',
                    message: editingMember ? 'Cập nhật nhân khẩu thành công!' : 'Thêm nhân khẩu thành công!'
                });
                setIsAddMemberModalOpen(false);
                setEditingMember(null);
                fetchHouseholdDetails(); // Refresh list
            } else {
                const errorData = await response.json();
                setNotification({
                    isOpen: true,
                    type: 'error',
                    message: `Lỗi: ${errorData.message}`
                });
            }
        } catch (error) {
            console.error('Error saving resident:', error);
            setNotification({
                isOpen: true,
                type: 'error',
                message: 'Có lỗi xảy ra khi lưu thông tin nhân khẩu'
            });
        }
    };

    const columns = [
        { key: 'identity_card_number', title: 'CCCD' },
        { key: 'full_name', title: 'Họ và tên' },
        { key: 'relationship_to_head', title: 'Quan hệ với chủ hộ' },
        { key: 'dob', title: 'Ngày sinh' },
        { key: 'occupation', title: 'Nghề nghiệp' },
        { key: 'statusDisplay', title: 'Trạng thái' },
        { key: 'actions', title: 'Hành động' },
    ];

    const createTableData = (data) => data.map(member => ({
    
        ...member,
        full_name: `${member.first_name} ${member.last_name}`,
        dob: new Date(member.dob).toLocaleDateString('vi-VN'),
        statusDisplay: <StatusBadge status={member.status} />,
        actions: (
            <div className="table-actions">
                <button 
                    className="btn-action btn-detail"
                    onClick={() => handleEditClick(member)}
                >
                    Sửa
                </button>
                <button 
                    className="btn-action btn-delete"
                    onClick={() => handleDeleteClick(member.resident_id)}
                >
                    Xóa
                </button>
            </div>
        )
    }));

    const permanentResidents = residents.filter(r => r.status === 'Permanent' || r.status === 'Thường trú');
    const temporaryResidents = residents.filter(r => r.status === 'Temporary' || r.status === 'Tạm trú');
    const historyResidents = residents.filter(r => ['MovedOut', 'Deceased', 'Đã chuyển đi', 'Đã qua đời'].includes(r.status));

    const permanentTableData = createTableData(permanentResidents);
    const temporaryTableData = createTableData(temporaryResidents);
    
    const historyTableData = historyResidents.map(member => ({
        ...member,
        full_name: `${member.first_name} ${member.last_name}`,
        dob: new Date(member.dob).toLocaleDateString('vi-VN'),
        statusDisplay: <StatusBadge status={member.status} />,
        actions: (
            <div className="table-actions">
                <button 
                    className="btn-action btn-detail"
                    onClick={() => setSelectedResidentDetail(member)}
                >
                    Xem chi tiết
                </button>
            </div>
        )
    }));


    if (loading) return <div>Loading...</div>;
    if (!household) return <div>Household not found</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="page-title">Chi tiết hộ khẩu: {household.household_code}</h2>
            </div>

            <div className="detail-card">
                <div className="detail-card-header">
                    <h2 className="detail-card-title">Thông tin chung</h2>
                </div>
                <div className="detail-card-body">
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Chủ hộ:</span>
                            <span className="info-value">{household.owner_name}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Địa chỉ:</span>
                            <span className="info-value">{household.address}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Ngày tạo:</span>
                            <span className="info-value">{new Date(household.date_created).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {household.status !== 'Temporary' && (
                <div className="detail-card">
                    <div className="detail-card-header flex-between">
                        <h2 className="detail-card-title">Danh sách thường trú</h2>
                        <Button 
                            variant="primary" 
                            className="btn-add-member"
                            onClick={() => handleSelectType('NewBirth')}
                        >
                            + Thêm mới sinh
                        </Button>
                    </div>
                    
                    <div className="detail-card-body p-0">
                        <Table 
                            columns={columns} 
                            data={permanentTableData} 
                            className="w-full"
                        />
                    </div>
                </div>
            )}

            <div className="detail-card mt-6">
                <div className="detail-card-header flex-between">
                    <h2 className="detail-card-title">Danh sách tạm trú (Chuyển đến)</h2>
                </div>
                
                <div className="detail-card-body p-0">
                    <Table 
                        columns={columns} 
                        data={temporaryTableData} 
                        className="w-full"
                    />
                </div>
            </div>

            {historyResidents.length > 0 && (
                <div className="detail-card mt-6">
                    <div className="detail-card-header">
                        <h2 className="detail-card-title">Nhân khẩu đã chuyển đi / Qua đời</h2>
                    </div>
                    <div className="detail-card-body p-0">
                        <Table 
                            columns={columns} 
                            data={historyTableData} 
                            className="w-full"
                        />
                    </div>
                </div>
            )}

            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                onSave={handleSaveMember}
                type={addMemberType}
                householdId={household.household_id}
                initialData={editingMember}
            />

            <Modal
                isOpen={!!selectedResidentDetail}
                onClose={() => setSelectedResidentDetail(null)}
                title="Chi tiết biến động nhân khẩu"
                size="medium"
            >
                {selectedResidentDetail && (
                    <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', marginBottom: '30px' }}>
                            <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #eee' }}>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8898aa', textTransform: 'uppercase', marginBottom: '5px' }}>
                                    Họ và tên
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#32325d' }}>
                                    {selectedResidentDetail.first_name} {selectedResidentDetail.last_name}
                                </div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #eee' }}>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8898aa', textTransform: 'uppercase', marginBottom: '5px' }}>
                                    Ngày sinh
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#32325d' }}>
                                    {new Date(selectedResidentDetail.dob).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8898aa', textTransform: 'uppercase', marginBottom: '5px' }}>
                                    CCCD
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#32325d' }}>
                                    {selectedResidentDetail.identity_card_number || 'Chưa có'}
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8898aa', textTransform: 'uppercase', marginBottom: '10px' }}>
                                Trạng thái
                            </div>
                            <div>
                                <StatusBadge status={selectedResidentDetail.status} />
                            </div>
                        </div>
                        
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8898aa', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Chi tiết biến động
                            </div>
                            <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                                {(() => {
                                    const notes = selectedResidentDetail.notes || '';
                                    if (!notes) return 'Không có ghi chú';

                                    // Xử lý hiển thị cho trường hợp Chuyển đi
                                    if (notes.includes('Chuyển đi ngày:')) {
                                        const dateMatch = notes.match(/Chuyển đi ngày:\s*(.*?)(?=\s*Lý do:|$)/);
                                        const reasonMatch = notes.match(/Lý do:\s*(.*?)(?=\s*Địa chỉ mới:|$)/);
                                        const addressMatch = notes.match(/Địa chỉ mới:\s*(.*)/);

                                        let moveDateDisplay = dateMatch ? dateMatch[1].trim() : '';
                                        if (moveDateDisplay) {
                                            try {
                                                const d = new Date(moveDateDisplay);
                                                if (!isNaN(d.getTime())) {
                                                    moveDateDisplay = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                }
                                            } catch (e) {}
                                        }

                                        return (
                                            <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '16px', border: '1px solid #e9ecef' }}>
                                                {dateMatch && (
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <span style={{ display: 'block', fontSize: '11px', color: '#8898aa', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                            Ngày chuyển đi
                                                        </span>
                                                        <span style={{ color: '#32325d', fontWeight: '500' }}>{moveDateDisplay}</span>
                                                    </div>
                                                )}
                                                {reasonMatch && (
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <span style={{ display: 'block', fontSize: '11px', color: '#8898aa', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                            Lý do
                                                        </span>
                                                        <span style={{ color: '#32325d', fontWeight: '500' }}>{reasonMatch[1].trim()}</span>
                                                    </div>
                                                )}
                                                {addressMatch && (
                                                    <div>
                                                        <span style={{ display: 'block', fontSize: '11px', color: '#8898aa', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                            Địa chỉ mới
                                                        </span>
                                                        <span style={{ color: '#32325d', fontWeight: '500' }}>{addressMatch[1].trim()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    // Xử lý hiển thị cho trường hợp Qua đời
                                    if (notes.includes('Mất ngày:') || notes.includes('Khai tử') || selectedResidentDetail.status === 'Deceased' || selectedResidentDetail.status === 'Đã qua đời') {
                                        let dateDisplay = '';
                                        let certDisplay = '';
                                        let reasonDisplay = '';

                                        // 1. Extract Date
                                        const datePattern = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/;
                                        const dateMatch = notes.match(datePattern);
                                        if (dateMatch) {
                                            dateDisplay = dateMatch[1];
                                            try {
                                                const d = new Date(dateDisplay);
                                                if (!isNaN(d.getTime())) {
                                                    dateDisplay = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                }
                                            } catch (e) {}
                                        }

                                        // 2. Extract Certificate (Manual parsing for robustness)
                                        const certLabelPattern = /(?:Số giấy chứng tử|Giấy chứng tử)\s*:\s*/i;
                                        const certLabelMatch = notes.match(certLabelPattern);
                                        
                                        if (certLabelMatch) {
                                            // Start after the label
                                            const startIndex = certLabelMatch.index + certLabelMatch[0].length;
                                            let content = notes.substring(startIndex);
                                            
                                            // Find the nearest delimiter: "Lý do:", "Nguyên nhân:", "|", or end of string
                                            // We look for ". Lý do:" or " Lý do:" or just "Lý do:"
                                            const delimiterPattern = /(?:\.?\s*(?:Lý do|Nguyên nhân)\s*:)|\|/i;
                                            const delimiterMatch = content.match(delimiterPattern);
                                            
                                            if (delimiterMatch) {
                                                content = content.substring(0, delimiterMatch.index);
                                            }
                                            
                                            certDisplay = content.trim().replace(/[.,;]+$/, '');
                                        }

                                        // 3. Extract Reason
                                        const reasonLabelPattern = /(?:Lý do|Nguyên nhân)\s*:\s*/i;
                                        const reasonLabelMatch = notes.match(reasonLabelPattern);
                                        
                                        if (reasonLabelMatch) {
                                            const startIndex = reasonLabelMatch.index + reasonLabelMatch[0].length;
                                            let content = notes.substring(startIndex);
                                            
                                            // Stop at pipe |
                                            const pipeIndex = content.indexOf('|');
                                            if (pipeIndex !== -1) {
                                                content = content.substring(0, pipeIndex);
                                            }
                                            
                                            reasonDisplay = content.trim().replace(/[.,;]+$/, '');
                                        } else {
                                            // Fallback: If no explicit reason, try to get text that is NOT the date and NOT the certificate
                                            let cleanNotes = notes;
                                            
                                            // Remove "Mất ngày: ..." part
                                            cleanNotes = cleanNotes.replace(/(?:Mất ngày|Ngày mất)\s*:\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/i, '');
                                            
                                            // Remove Certificate part (using the same logic as extraction)
                                            if (certLabelMatch) {
                                                const startIndex = certLabelMatch.index;
                                                let endIndex = notes.length;
                                                const contentAfterLabel = notes.substring(startIndex + certLabelMatch[0].length);
                                                const delimiterMatch = contentAfterLabel.match(/(?:\.?\s*(?:Lý do|Nguyên nhân)\s*:)|\|/i);
                                                if (delimiterMatch) {
                                                    endIndex = startIndex + certLabelMatch[0].length + delimiterMatch.index;
                                                }
                                                // Replace the whole certificate part with empty string
                                                const certPart = notes.substring(startIndex, endIndex);
                                                cleanNotes = cleanNotes.replace(certPart, '');
                                            }
                                            
                                            // Remove keywords
                                            cleanNotes = cleanNotes.replace(/Khai tử/i, '');
                                            cleanNotes = cleanNotes.replace(/\|/g, '');
                                            
                                            // Clean up punctuation
                                            cleanNotes = cleanNotes.replace(/^[.\s,]+/, '').replace(/[.\s,]+$/, '').trim();
                                            
                                            if (cleanNotes) {
                                                reasonDisplay = cleanNotes;
                                            }
                                        }

                                        return (
                                            <div style={{ backgroundColor: '#fff5f5', borderRadius: '8px', padding: '16px', border: '1px solid #feb2b2' }}>
                                                <div style={{ marginBottom: '12px' }}>
                                                    <span style={{ display: 'block', fontSize: '11px', color: '#e53e3e', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                        Ngày mất
                                                    </span>
                                                    <span style={{ color: '#c53030', fontWeight: '500' }}>{dateDisplay || 'Chưa cập nhật'}</span>
                                                </div>
                                                
                                                <div style={{ marginBottom: '12px' }}>
                                                    <span style={{ display: 'block', fontSize: '11px', color: '#e53e3e', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                        Số giấy chứng tử
                                                    </span>
                                                    <span style={{ color: '#c53030', fontWeight: '500' }}>{certDisplay || 'Chưa cập nhật'}</span>
                                                </div>
                                                
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '11px', color: '#e53e3e', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                        Lý do / Ghi chú
                                                    </span>
                                                    <span style={{ color: '#c53030', fontWeight: '500' }}>{reasonDisplay || 'Không có ghi chú'}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    return notes;
                                })()}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button 
                                className="modal-btn-cancel"
                                onClick={() => setSelectedResidentDetail(null)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                title="Lịch sử biến động"
                size="large"
            >
                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Ngày thay đổi</th>
                                <th>Loại thay đổi</th>
                                <th>Người thực hiện</th>
                                <th>Nhân khẩu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyData.length > 0 ? (
                                historyData.map((item) => (
                                    <tr key={item.history_id}>
                                        <td>{new Date(item.change_date).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span className={`history-badge ${
                                                item.change_type === 'NewBirth' ? 'badge-success' :
                                                item.change_type === 'Death' ? 'badge-danger' :
                                                item.change_type === 'MoveOut' ? 'badge-warning' :
                                                item.change_type === 'UpdateInfo' ? 'badge-info' :
                                                'badge-info'
                                            }`}>
                                                {item.change_type === 'NewBirth' ? 'Mới sinh' :
                                                 item.change_type === 'Death' ? 'Khai tử' :
                                                 item.change_type === 'MoveOut' ? 'Chuyển đi' :
                                                 item.change_type === 'Split' ? 'Tách hộ' : 
                                                 item.change_type === 'UpdateInfo' ? 'Cập nhật' : item.change_type}
                                            </span>
                                        </td>
                                        <td>{item.changed_by || 'Admin'}</td>
                                        <td>{item.first_name} {item.last_name}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-data">Chưa có lịch sử biến động</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal>
            <Modal
                isOpen={notification.isOpen}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                title={notification.type === 'success' ? 'Thành công' : 'Lỗi'}
                size="sm"
            >
                <div style={{ padding: "20px" }}>
                    <p style={{ marginBottom: "20px", color: "#333" }}>{notification.message}</p>
                    <div className="modal-footer">
                        <button 
                            className={notification.type === 'success' ? "modal-btn-success" : "modal-btn-delete"}
                            onClick={() => setNotification({ ...notification, isOpen: false })}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default HouseholdDetail;