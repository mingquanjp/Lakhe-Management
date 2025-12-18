import * as XLSX from 'xlsx';
/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Name of the file (without extension)
 * @param {String} sheetName - Name of the sheet
 */
export const exportToExcel = (data, fileName = 'export', sheetName = 'Sheet1') => {
  try {
    // Tạo worksheet từ data
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Tạo workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Xuất file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

/**
 * Export với custom headers (tiếng Việt)
 */
export const exportToExcelWithHeaders = (data, headers, fileName = 'export', sheetName = 'Sheet1') => {
  try {
    // Chuyển đổi data theo headers
    const transformedData = data.map(row => {
      const newRow = {};
      Object.keys(headers).forEach(key => {
        newRow[headers[key]] = row[key];
      });
      return newRow;
    });
    
    // Tạo worksheet
    const worksheet = XLSX.utils.json_to_sheet(transformedData);
    
    // Tùy chỉnh độ rộng cột
    const columnWidths = Object.keys(headers).map(() => ({ wch: 20 }));
    worksheet['!cols'] = columnWidths;
    
    // Tạo workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
     
    // Xuất file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

/**
 * Format date cho Excel
 */
export const formatDateForExcel = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format currency cho Excel
 */
export const formatCurrencyForExcel = (amount) => {
  if (!amount && amount !== 0) return '-';
  return new Intl.NumberFormat('vi-VN').format(amount);
};