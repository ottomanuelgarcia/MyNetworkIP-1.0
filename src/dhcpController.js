import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const historyStore = new Map();

export async function applyDhcpChange({ device, config, adminUser }) {
  const { ip, subnetMask, gateway, dnsPrimary, dnsSecondary, useServerDns } = config;
  const command = [
    `echo "Aplicando alteração para ${device?.ip || 'desconhecido'} -> ${ip}"`,
    `echo "Admin: ${adminUser}"`,
    `echo "Máscara: ${subnetMask}"`,
    `echo "Gateway: ${gateway}"`,
    `echo "DNS: ${useServerDns ? 'servidor' : `${dnsPrimary}/${dnsSecondary}`}"`,
  ].join(' && ');

  await execAsync(command);

  const deviceId = device?.id || device?.ip || 'default';
  const entry = {
    id: `${deviceId}-${Date.now()}`,
    deviceId,
    oldIp: device?.ip || 'desconhecido',
    newIp: ip,
    changeType: 'static',
    timestamp: new Date().toISOString(),
    adminUser,
  };
  historyStore.set(deviceId, [...(historyStore.get(deviceId) || []), entry]);

  return {
    success: true,
    message: `Configuração aplicada para ${device?.name || device?.ip || 'dispositivo'}`,
  };
}

export async function getDhcpHistory(deviceId) {
  return historyStore.get(deviceId) || [];
}
