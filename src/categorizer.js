function normalizeMac(macAddress) {
  return (macAddress || '').toUpperCase().replace(/[^A-F0-9]/g, '');
}

function isTpLinkMac(macAddress) {
  const normalized = normalizeMac(macAddress);
  return normalized.startsWith('001478') || normalized.startsWith('AC15A2');
}

function isAppleMac(macAddress) {
  const normalized = normalizeMac(macAddress);
  return normalized.startsWith('001E') || normalized.startsWith('C0EE') || normalized.startsWith('A4C1');
}

export function categorizeDevice({ hostname = '', macAddress = '', portInfo = {}, snmpInfo = '' }) {
  const host = hostname.toLowerCase();
  const mac = normalizeMac(macAddress);

  if (portInfo[9100] || portInfo[515] || portInfo[631] || /printer|hplj|epson|brother|xerox/.test(host) || /printer/i.test(snmpInfo)) {
    return { deviceType: 'printer', subType: 'Printer', confidence: 'high' };
  }

  if (isTpLinkMac(mac) || /tplink|tp-link|archer|switch|router/.test(host) || /router|switch/i.test(snmpInfo)) {
    return { deviceType: 'router', subType: 'TP-Link', confidence: 'high' };
  }

  if (/android|samsung|pixel|xiaomi|oneplus|galaxy/.test(host) || /A4|A0|B4/.test(mac) || /android/i.test(snmpInfo)) {
    return { deviceType: 'mobile', subType: 'Android', confidence: 'medium' };
  }

  if (/iphone|ipad|ios|iphone/.test(host) || isAppleMac(mac)) {
    return { deviceType: 'mobile', subType: 'iPhone', confidence: 'medium' };
  }

  if (/laptop|notebook|thinkpad|ideapad|aspire|inspiron|latitude|surface/.test(host)) {
    return { deviceType: 'laptop', subType: 'Laptop', confidence: 'medium' };
  }

  if (/desktop|pc|workstation|office|server/.test(host)) {
    return { deviceType: 'desktop', subType: 'Desktop', confidence: 'medium' };
  }

  return { deviceType: 'unknown', subType: 'Unknown', confidence: 'low' };
}
