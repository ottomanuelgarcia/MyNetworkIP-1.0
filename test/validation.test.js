import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import { validateIpFormat, validateMac } from '../src/validation.js';
import { manageIpAssignment } from '../src/ipManagerMain.js';

function getLocalAddress() {
  const interfaces = os.networkInterfaces();
  for (const details of Object.values(interfaces)) {
    for (const detail of details || []) {
      if (detail.family === 'IPv4' && !detail.internal) {
        return detail.address;
      }
    }
  }
  return '192.168.1.10';
}

test('valida formato de IP corretamente', () => {
  assert.equal(validateIpFormat('192.168.1.10'), true);
  assert.equal(validateIpFormat('999.168.1.10'), false);
  assert.equal(validateIpFormat('192.168.1'), false);
});

test('valida endereço MAC corretamente', () => {
  assert.equal(validateMac('AA:BB:CC:DD:EE:FF'), true);
  assert.equal(validateMac('AA-BB-CC-DD-EE-FF'), false);
});

test('aplica configuração estática quando os dados são válidos', async () => {
  const localAddress = getLocalAddress();
  const octets = localAddress.split('.').slice(0, 3);
  const validIp = `${octets.join('.')}.99`;

  const result = await manageIpAssignment({
    device: { name: 'Notebook teste', mac: 'AA:BB:CC:DD:EE:FF' },
    config: {
      ip: validIp,
      subnetMask: '255.255.255.0',
      gateway: `${octets.join('.')}.1`,
      dnsPrimary: '8.8.8.8',
      dnsSecondary: '8.8.4.4',
      useServerDns: false,
    },
    adminUser: 'admin',
  });

  assert.equal(result.success, true);
  assert.equal(result.summary.ip, validIp);
});
