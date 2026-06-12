import os from 'node:os';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

function parseIPv4(ip) {
  if (!ip || typeof ip !== 'string') return null;
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  const octets = parts.map((part) => Number.parseInt(part, 10));
  if (octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) return null;
  return octets;
}

function getLocalNetworkInfo() {
  const interfaces = os.networkInterfaces();
  for (const [, details] of Object.entries(interfaces)) {
    for (const detail of details || []) {
      if (detail.family === 'IPv4' && !detail.internal) {
        return {
          address: detail.address,
          netmask: detail.netmask || '255.255.255.0',
        };
      }
    }
  }
  return { address: '192.168.1.10', netmask: '255.255.255.0' };
}

export function validateIpFormat(ip) {
  return parseIPv4(ip) !== null;
}

export function isWithinSubnet(ip, subnetMask = '255.255.255.0') {
  const ipParts = parseIPv4(ip);
  const maskParts = parseIPv4(subnetMask);
  if (!ipParts || !maskParts) return false;

  const networkInfo = getLocalNetworkInfo();
  const currentParts = parseIPv4(networkInfo.address);
  const localMaskParts = parseIPv4(networkInfo.netmask);
  if (!currentParts || !localMaskParts) return false;

  const localNetwork = currentParts.map((octet, index) => octet & localMaskParts[index]);
  const candidate = ipParts.map((octet, index) => octet & maskParts[index]);
  const expected = localNetwork.map((octet, index) => octet & maskParts[index]);

  return expected.every((octet, index) => octet === candidate[index]);
}

export async function checkIpConflict(ip) {
  try {
    await execAsync(`ping -c 1 -W 1 ${ip}`);
    return true;
  } catch {
    return false;
  }
}

export function validateMac(macAddress) {
  return /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(macAddress || '');
}

export function buildIpSummary({ ip, subnetMask, gateway, dnsPrimary, dnsSecondary, useServerDns }) {
  return {
    ip,
    subnetMask,
    gateway,
    dnsPrimary: useServerDns ? 'Servidor DHCP/DNS' : dnsPrimary,
    dnsSecondary: useServerDns ? 'Servidor DHCP/DNS' : dnsSecondary,
    useServerDns,
  };
}
