import { applyDhcpChange, getDhcpHistory } from './dhcpController.js';
import { buildIpSummary, checkIpConflict, isWithinSubnet, validateIpFormat, validateMac } from './validation.js';

export async function manageIpAssignment({ device, config, adminUser }) {
  const errors = [];
  const macAddress = device?.macAddress || device?.mac || '';
  const targetIp = config?.ip;
  const subnetMask = config?.subnetMask || '255.255.255.0';

  if (!validateIpFormat(targetIp)) {
    errors.push('Formato de IP inválido.');
  }

  if (targetIp && !isWithinSubnet(targetIp, subnetMask)) {
    errors.push('O IP informado está fora da faixa da subnet local.');
  }

  if (macAddress && !validateMac(macAddress)) {
    errors.push('MAC address inválido.');
  }

  if (targetIp) {
    const conflict = await checkIpConflict(targetIp);
    if (conflict) {
      errors.push('O IP informado já está em uso.');
    }
  }

  if (errors.length) {
    return { success: false, errors };
  }

  const summary = buildIpSummary({ ...config, ip: targetIp, subnetMask });
  const result = await applyDhcpChange({ device, config: summary, adminUser });

  return { success: true, summary, result };
}

export async function getIpHistory(deviceId) {
  return getDhcpHistory(deviceId);
}
