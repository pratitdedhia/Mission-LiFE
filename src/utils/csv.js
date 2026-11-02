/**
 * Mission LiFE RFC 4180 Compliant CSV Utility
 * Includes Formula Injection (CSV Injection) Prevention and UTF-8 BOM.
 */

const FORMULA_INJECTION_CHARS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Sanitizes and escapes a single CSV cell according to RFC 4180
 * and applies a leading apostrophe guard against spreadsheet formula injection.
 */
export function escapeCsvField(value) {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Formula injection defense:
  // If string starts with =, +, -, @, \t, or \r and is not a plain number, prepend a single quote (')
  if (typeof value === 'string' && FORMULA_INJECTION_CHARS.some(char => str.startsWith(char))) {
    // Check if it's just a regular negative or positive number (e.g. -12.5 or +5)
    const isPureNumber = /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(str);
    if (!isPureNumber) {
      str = `'${str}`;
    }
  }

  // RFC 4180 Quoting:
  // If field contains comma, double quote, newline, or carriage return, enclose in double quotes
  // and double up any existing double quotes.
  const requiresQuotes = /[",\n\r]/.test(str);
  if (requiresQuotes) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Formats an array of row values into an RFC 4180 compliant CSV line.
 */
export function formatCsvRow(fields) {
  return fields.map(escapeCsvField).join(',');
}

/**
 * Generates an RFC 4180 CSV string with UTF-8 BOM from headers and rows.
 */
export function generateCsv(headers = [], rows = []) {
  const lines = [];
  if (headers && headers.length > 0) {
    lines.push(formatCsvRow(headers));
  }
  for (const row of rows) {
    lines.push(formatCsvRow(row));
  }
  return lines.join('\r\n');
}

/**
 * Triggers a client-side CSV download using Blob and URL.createObjectURL.
 * Never uses fragile data: URIs which fail on '#' or large datasets.
 */
export function downloadCsv(filename, headers = [], rows = []) {
  const csvContent = generateCsv(headers, rows);
  downloadCsvContent(filename, csvContent);
}

/**
 * Triggers download of a raw CSV string with UTF-8 BOM via Blob
 */
export function downloadCsvContent(filename, csvString) {
  // UTF-8 Byte Order Mark (BOM) ensures Excel renders UTF-8 correctly
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
  const cleanFilename = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;

  if (typeof window !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', cleanFilename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }
}

