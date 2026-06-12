import test from 'node:test';
import assert from 'node:assert/strict';
import { categorizeDevice } from '../src/categorizer.js';

test('categoriza Android via hostname e MAC', () => {
  const result = categorizeDevice({
    hostname: 'samsung-galaxy',
    macAddress: 'A4:34:F1:22:AB:11',
    portInfo: { 80: true },
  });

  assert.equal(result.deviceType, 'mobile');
  assert.equal(result.subType, 'Android');
});

test('categoriza impressora via porta 9100 e SNMP', () => {
  const result = categorizeDevice({
    hostname: 'hplj-1020',
    portInfo: { 9100: true },
    snmpInfo: 'Printer',
  });

  assert.equal(result.deviceType, 'printer');
  assert.equal(result.subType, 'Printer');
});

test('categoriza roteador TP-Link via OUI', () => {
  const result = categorizeDevice({
    hostname: 'tp-link-archer',
    macAddress: '14:CC:20:12:34:56',
    portInfo: { 80: true },
  });

  assert.equal(result.deviceType, 'router');
  assert.equal(result.subType, 'TP-Link');
});
