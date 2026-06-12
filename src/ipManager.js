export async function manageIpAssignment(payload) {
  return window.electronAPI.manageIpAssignment(payload);
}

export async function getIpHistory(deviceId) {
  return window.electronAPI.getIpHistory(deviceId);
}
