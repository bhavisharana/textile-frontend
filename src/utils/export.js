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
