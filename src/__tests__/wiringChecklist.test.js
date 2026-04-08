const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const checklistPath = path.join(process.cwd(), 'wiring-checklist.json');

describe('wiring-checklist.json validation', () => {
  let checklist;

  beforeAll(() => {
    const raw = fs.readFileSync(checklistPath, 'utf-8');
    checklist = JSON.parse(raw);
  });

  test('has valid JSON structure with wiring_checklist array', () => {
    expect(checklist).toHaveProperty('wiring_checklist');
    expect(Array.isArray(checklist.wiring_checklist)).toBe(true);
    expect(checklist.wiring_checklist.length).toBeGreaterThan(0);
  });

  test('each entry has file and verifications fields', () => {
    for (const entry of checklist.wiring_checklist) {
      expect(typeof entry.file).toBe('string');
      expect(Array.isArray(entry.verifications)).toBe(true);
      expect(entry.verifications.length).toBeGreaterThan(0);
    }
  });

  test('all referenced files exist', () => {
    const missing = [];
    for (const entry of checklist.wiring_checklist) {
      const filePath = path.join(process.cwd(), entry.file);
      if (!fs.existsSync(filePath)) {
        missing.push(entry.file);
      }
    }
    expect(missing).toEqual([]);
  });

  test('all verification commands succeed', () => {
    const failures = [];
    for (const entry of checklist.wiring_checklist) {
      for (const cmd of entry.verifications) {
        try {
          execSync(cmd, { stdio: 'pipe', cwd: process.cwd() });
        } catch {
          failures.push(`[${entry.file}]: ${cmd}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });
});
