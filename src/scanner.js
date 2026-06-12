import os from 'node:os';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { categorizeDevice } from './categorizer.js';
import { upsertDevice, listDevices, updateDeviceDetails } from './database.js';

const execAsync = promisify(exec);

function getLocalSubnet() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [, details] of Object.entries(interfaces)) {
    for (const detail of details) {
      if (detail.family === 'IPv4' && !detail.internal) {
        const [ip, prefix] = detail.address.split('.');
        const mask = detail.netmask.split('.');
        if (prefix && mask) {
          candidates.push({ address: detail.address, prefix: detail.prefixLength || 24 });
        }
      }
    }
  }

  return candidates[0] ? candidates[0].address.split('.').slice(0, 3).join('.') : '192.168.1';
}

async function pingHost(ip) {
  try {
    await execAsync(`ping -c 1 -W 1 ${ip}`);
    return true;
  } catch {
    return false;
  }
}

async function detectPorts(ip) {
  const commonPorts = [80, 443, 22, 9100, 515, 631];
  const results = {};

  for (const port of commonPorts) {
    try {
      await execAsync(`bash -lc "echo > /dev/tcp/${ip}/${port}"`);
      results[port] = true;
    } catch {
      results[port] = false;
    }
  }

  return results;
}

async function scanNetwork() {
  const subnet = getLocalSubnet();
  const discovered = [];

  for (let i = 1; i <= 20; i += 1) {
    const ip = `${subnet}.${i}`;
    const online = await pingHost(ip);
    if (!online) continue;

    const portInfo = await detectPorts(ip);
    const hostname = `${ip}`;
    const classification = categorizeDevice({ hostname, macAddress: '', portInfo, snmpInfo: '' });

    const device = {
      ipAddress: ip,
      macAddress: '',
      hostname,
      deviceType: classification.deviceType,
      subType: classification.subType,
      status: 'Online',
      lastSeen: new Date().toISOString(),
      isStaticIp: true,
    };

    const deviceId = await upsertDevice(device);
    await updateDeviceDetails(deviceId, {
      osInfo: 'Detected via network scan',
      brand: classification.deviceType === 'router' ? 'TP-Link' : '',
      model: classification.subType,
      dnsConfig: '',
      notes: 'Auto-discovered',
    });

    discovered.push(device);
  }

  return discovered;
}

export async function startScan() {
  return scanNetwork();
}

export async function getDiscoveredDevices() {
  return listDevices();
}
