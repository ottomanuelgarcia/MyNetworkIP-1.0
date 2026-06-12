import { ipcMain } from 'electron';
import { startScan, getDiscoveredDevices } from './scanner.js';
import { updateDeviceDetails } from './database.js';
import { manageIpAssignment, getIpHistory } from './ipManagerMain.js';

export function registerIpcHandlers() {
  ipcMain.handle('network:scan:start', async () => {
    try {
      const devices = await startScan();
      return { success: true, devices };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('network:devices:list', async () => {
    try {
      const devices = await getDiscoveredDevices();
      return { success: true, devices };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('network:device:update', async (_event, deviceId, details) => {
    try {
      await updateDeviceDetails(deviceId, details);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('network:ip:manage', async (_event, payload) => {
    try {
      return await manageIpAssignment(payload);
    } catch (error) {
      return { success: false, errors: [error.message] };
    }
  });

  ipcMain.handle('network:ip:history', async (_event, deviceId) => {
    try {
      return { success: true, history: await getIpHistory(deviceId) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
