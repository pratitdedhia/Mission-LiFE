/**
 * CI Hardcoding Enforcement Test (Zero-Hardcoding Contract)
 *
 * Scans all source files under `src/**` (excluding `configService.js` and `branding.js` fallback)
 * to verify that business parameters, tariffs, emission factors, passwords, and mock prefixes
 * are strictly loaded from Firestore config/reference documents rather than hardcoded in source.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve(__dirname, '../../src');

const EXCLUDED_FILES = [
  'configService.js',
  'configService.ts',
  'branding.js',
  'branding.ts'
];

function getAllSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllSourceFiles(fullPath));
    } else if (
      entry.isFile() &&
      /\.(js|jsx|ts|tsx|json)$/.test(entry.name) &&
      !EXCLUDED_FILES.includes(entry.name)
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('Zero-Hardcoding Contract CI Guard', () => {
  const sourceFiles = getAllSourceFiles(SRC_DIR);

  it('scans a non-empty set of source files in src/', () => {
    expect(sourceFiles.length).toBeGreaterThan(10);
  });

  it('contains NO prohibited mock tokens (INITIAL_, DEMO_USERS, Password123, user_12345, SEED_)', () => {
    const bannedTokens = ['INITIAL_', 'DEMO_USERS', 'Password123', 'user_12345', 'SEED_'];
    const violations: string[] = [];

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const relPath = path.relative(SRC_DIR, file).replace(/\\/g, '/');

      for (const token of bannedTokens) {
        if (content.includes(token)) {
          violations.push(`${relPath} contains banned token "${token}"`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('contains NO prohibited hardcoded business numeric literals outside config loaders', () => {
    // 78000, 9.20, 5.40, 6.50, 6.20, 7.60, 8.5, 0.71, 0.82, 52800, 54000, 55200, 30000
    const bannedNumberRegex = /\b(78000|9\.20|5\.40|6\.50|6\.20|7\.60|8\.5|0\.71|0\.82|52800|54000|55200|30000)\b/;
    const violations: string[] = [];

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const relPath = path.relative(SRC_DIR, file).replace(/\\/g, '/');

      // Split lines to identify line numbers
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // Skip comment lines or SVG paths
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
        if (trimmed.includes('<path ') || trimmed.includes(' d="')) return;

        const match = line.match(bannedNumberRegex);
        if (match) {
          violations.push(`${relPath}:${idx + 1} has banned number literal "${match[0]}": ${line.trim()}`);
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('contains NO literal currency prefix directly followed by digits (₹[0-9]) in JSX or translation JSON', () => {
    const rupeeDigitRegex = /₹[0-9]/;
    const violations: string[] = [];

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const relPath = path.relative(SRC_DIR, file).replace(/\\/g, '/');

      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

        if (rupeeDigitRegex.test(line)) {
          violations.push(`${relPath}:${idx + 1} contains literal ₹ followed by digit: ${line.trim()}`);
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('contains NO Math.random() in non-test source files', () => {
    const violations: string[] = [];

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const relPath = path.relative(SRC_DIR, file).replace(/\\/g, '/');

      if (content.includes('Math.random()')) {
        violations.push(`${relPath} contains Math.random()`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('contains NO service account private keys or credentials in tracked source files', () => {
    const violations: string[] = [];

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const relPath = path.relative(SRC_DIR, file).replace(/\\/g, '/');

      if (content.includes('"private_key"') || content.includes('BEGIN PRIVATE KEY')) {
        violations.push(`${relPath} contains private key data`);
      }
    }

    expect(violations).toEqual([]);
  });
});
