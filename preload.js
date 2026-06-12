import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getLocalDomain: () => ipcRenderer.invoke('get-local-domain'),
  startNetworkScan: () => ipcRenderer.invoke('network:scan:start'),
  listNetworkDevices: () => ipcRenderer.invoke('network:devices:list'),
  updateNetworkDevice: (deviceId, details) => ipcRenderer.invoke('network:device:update', deviceId, details),
  manageIpAssignment: (payload) => ipcRenderer.invoke('network:ip:manage', payload),
  getIpHistory: (deviceId) => ipcRenderer.invoke('network:ip:history', deviceId),
});
