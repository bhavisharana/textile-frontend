import * as XLSX from 'xlsx'

/**
 * Formats a date string/object to YYYY-MM-DD for Excel sheets.
 * @param {string|Date|null|undefined} dateVal 
 * @returns {string}
 */
export function formatDateForExcel(dateVal) {
  if (!dateVal) return '-'
  try {
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return String(dateVal)
    return d.toISOString().split('T')[0]
  } catch {
    return String(dateVal)
  }
}

/**
 * Export JSON records array to an Excel (.xlsx) spreadsheet.
 * @param {Array<Object>} data - Array of row objects to convert to sheet
 * @param {string} fileName - File name to download as
 * @param {string} [sheetName='Sheet1'] - Sheet name in the workbook
 * @param {Array<{wch: number}>} [colWidths] - Array of column width specifications
 */
export function exportJsonToExcel(data, fileName = 'export', sheetName = 'Sheet1', colWidths = null) {
  if (!data || data.length === 0) {
    throw new Error('No data available to export')
  }

  // Create worksheet from json data
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Apply column widths if provided
  if (colWidths && Array.isArray(colWidths)) {
    worksheet['!cols'] = colWidths
  }

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Ensure .xlsx extension
  const finalFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`

  // Trigger download in browser
  XLSX.writeFile(workbook, finalFileName)
}

/**
 * Filter data by party and date range, then export to Excel.
 * @param {Object} options
 * @param {'labdips'|'orders'} options.type
 * @param {Array<Object>} options.data - Raw data array
 * @param {string|null} options.partyName - Name of the party to filter by
 * @param {string} options.dateFrom - YYYY-MM-DD
 * @param {string} options.dateTo - YYYY-MM-DD
 * @param {string} options.dateField - The field name in data to check against date range
 */
export function filterAndExport({ type, data, partyName, dateFrom, dateTo, dateField }) {
  if (!data || !data.length) {
    throw new Error('No data available to export');
  }

  // Set default dates if not provided
  let from = dateFrom;
  let to = dateTo;
  if (!from || !to) {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Format YYYY-MM-DD local time
    to = to || today.toLocaleDateString('en-CA'); // 'en-CA' outputs YYYY-MM-DD
    from = from || firstDay.toLocaleDateString('en-CA');
  }
  
  const fromTime = new Date(from).getTime();
  const toTime = new Date(to).getTime();

  // Filter data
  const filteredData = data.filter(item => {
    // 1. Party Filter
    if (partyName && item.party_name !== partyName) {
      return false;
    }

    // 2. Date Filter
    const itemDateVal = item[dateField];
    if (!itemDateVal) return false; // If there's no date on the record, skip or include? We'll skip for strict range.

    const itemTime = new Date(itemDateVal).getTime();
    if (isNaN(itemTime)) return false;

    // Zero out time components for strict date comparison
    const itemDateOnly = new Date(new Date(itemDateVal).toDateString()).getTime();
    const fromDateOnly = new Date(new Date(from).toDateString()).getTime();
    const toDateOnly = new Date(new Date(to).toDateString()).getTime();

    if (itemDateOnly < fromDateOnly || itemDateOnly > toDateOnly) {
      return false;
    }

    return true;
  });

  if (!filteredData.length) {
    throw new Error('No records match the selected filters');
  }

  // Map to export format
  let exportData = [];
  let colWidths = [];
  
  if (type === 'labdips') {
    exportData = filteredData.map((item, index) => ({
      'Sr. No.': index + 1,
      'Labdip No': item.labdip_no || '-',
      'Party Name': item.party_name || '-',
      'Quality': item.quality_name || '-',
      'Color': item.color || '-',
      'Status': item.status || '-',
      'Received Date': formatDateForExcel(item.received_date),
      'Sending Date': formatDateForExcel(item.sending_date),
      'Remarks': item.remarks || '-'
    }));
    colWidths = [{ wch: 8 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];
  } else if (type === 'orders') {
    exportData = filteredData.map((item, index) => ({
      'Sr. No.': index + 1,
      'Order ID': item.order_id || '-',
      'Labdip Ref': item.labdip_no || '-',
      'Party Name': item.party_name || '-',
      'Status': item.status || '-',
      'Quantity (MTR)': item.quantity || 0,
      'Date': formatDateForExcel(item.created_at || item.order_date)
    }));
    colWidths = [{ wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  } else {
    throw new Error('Invalid export type');
  }

  const fileName = `${type}_export_${from}_to_${to}`;
  exportJsonToExcel(exportData, fileName, type.charAt(0).toUpperCase() + type.slice(1), colWidths);
}
