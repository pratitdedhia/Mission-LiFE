import { describe, it, expect } from 'vitest';
import { escapeCsvField, formatCsvRow, generateCsv } from '../../src/utils/csv';

describe('CSV Sanitization & RFC 4180 Compliance (M1)', () => {
  it('escapes fields containing commas with enclosing double quotes', () => {
    const raw = 'Ahmedabad, Gujarat';
    const escaped = escapeCsvField(raw);
    expect(escaped).toBe('"Ahmedabad, Gujarat"');
  });

  it('escapes fields containing double quotes by doubling them up', () => {
    const raw = 'Solar "High Efficiency" Panel';
    const escaped = escapeCsvField(raw);
    expect(escaped).toBe('"Solar ""High Efficiency"" Panel"');
  });

  it('escapes fields containing newlines with quotes', () => {
    const raw = "Line 1\nLine 2\r\nLine 3";
    const escaped = escapeCsvField(raw);
    expect(escaped).toBe('"Line 1\nLine 2\r\nLine 3"');
  });

  it('preserves hash signs (#) and does not truncate text', () => {
    const raw = 'Project #1234 - GEDA Phase 2';
    const escaped = escapeCsvField(raw);
    expect(escaped).toBe('Project #1234 - GEDA Phase 2');
  });

  it('neutralizes spreadsheet formula injection (=, +, -, @)', () => {
    const formulaPayload = "=cmd|' /C calc'!A0";
    const escaped = escapeCsvField(formulaPayload);
    // Must prepend single quote to treat cell as text
    expect(escaped).toBe("'=cmd|' /C calc'!A0");

    const plusPayload = "+SUM(A1:A10)";
    expect(escapeCsvField(plusPayload)).toBe("'+SUM(A1:A10)");

    const atPayload = "@SUM(1+1)";
    expect(escapeCsvField(atPayload)).toBe("'@SUM(1+1)");
  });

  it('preserves valid negative and positive numeric values without prepending quote', () => {
    expect(escapeCsvField('-15.5')).toBe('-15.5');
    expect(escapeCsvField('+42')).toBe('+42');
    expect(escapeCsvField(100)).toBe('100');
    expect(escapeCsvField(0)).toBe('0');
  });

  it('generates well-formed CSV rows and multi-line output', () => {
    const headers = ['Entity', 'Points', 'Description'];
    const rows = [
      ['District A, East', 50, 'Standard, verified'],
      ['=EVIL_FORMULA()', -10, 'Note with "quotes" and #hash']
    ];

    const csvOutput = generateCsv(headers, rows);
    const lines = csvOutput.split('\r\n');

    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('Entity,Points,Description');
    expect(lines[1]).toBe('"District A, East",50,"Standard, verified"');
    expect(lines[2]).toBe("'=EVIL_FORMULA(),-10,\"Note with \"\"quotes\"\" and #hash\"");
  });
});

