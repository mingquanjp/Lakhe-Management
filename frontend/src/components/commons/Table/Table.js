import "./Table.css";

/**
 * Table Component - Component bảng 
 *
 * // Table với các tùy chọn như:
 * - columns (mảng định nghĩa các cột với key và title)
 * - data (mảng dữ liệu để hiển thị)
 * - className (thêm class tùy chỉnh)
 *

 * // Định nghĩa columns
 * const columns = [
 *   { key: 'householdNumber', title: 'Số hộ khẩu' },
 *   { key: 'ownerName', title: 'Họ và tên chủ hộ' },
 *   { key: 'address', title: 'Địa chỉ' }
 * ];
 *
 * // Dữ liệu
 * const data = [
 *   { householdNumber: 'H001', ownerName: 'Nguyễn Văn A', address: '36 La Khê' },
 *   { householdNumber: 'H002', ownerName: 'Trần Văn B', address: '37 La Khê' }
 * ];
 *
 * // Sử dụng Table
 * <Table columns={columns} data={data} />
 *
 * // Table với custom className
 * <Table columns={columns} data={data} className="custom-table" />
 */

const Table = ({ columns = [], data = [], className = "", ...props }) => {
  return (
    <div className={`table-container ${className}`} {...props}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="table-header">
                {column.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="table-row">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="table-cell">
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && <div className="table-empty">Không có dữ liệu</div>}
    </div>
  );
};

export default Table;
