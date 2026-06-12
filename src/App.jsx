import { useEffect, useMemo, useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import IpManagementPanel from './components/IpManagementPanel';
import { manageIpAssignment } from './ipManager';

const initialDevices = [
  {
    id: 1,
    name: 'Samsung Galaxy S24',
    ip: '192.168.1.12',
    mac: 'A4:34:F1:22:AB:11',
    status: 'Online',
    type: 'Android',
    subtype: 'Android 14',
    category: 'mobile',
    icon: '📱',
  },
  {
    id: 2,
    name: 'iPhone 15 Pro',
    ip: '192.168.1.18',
    mac: 'B4:5D:50:12:7A:9C',
    status: 'Online',
    type: 'iPhone',
    subtype: 'iOS 17',
    category: 'mobile',
    icon: '📱',
  },
  {
    id: 3,
    name: 'HP LaserJet Pro',
    ip: '192.168.1.25',
    mac: '00:11:32:44:55:66',
    status: 'Offline',
    type: 'Impressora',
    subtype: 'HP LaserJet',
    category: 'printer',
    icon: '🖨️',
  },
  {
    id: 4,
    name: 'TP-Link Archer C6',
    ip: '192.168.1.1',
    mac: '14:CC:20:12:34:56',
    status: 'Online',
    type: 'Roteador',
    subtype: 'TP-Link Archer C6',
    category: 'router',
    icon: '🌐',
  },
  {
    id: 5,
    name: 'Dell Inspiron 15',
    ip: '192.168.1.40',
    mac: '38:00:25:2A:6F:7D',
    status: 'Online',
    type: 'Laptop',
    subtype: 'Windows 11',
    category: 'laptop',
    icon: '💻',
  },
  {
    id: 6,
    name: 'Workstation Office',
    ip: '192.168.1.55',
    mac: 'A0:B1:C2:D3:E4:F5',
    status: 'Offline',
    type: 'Desktop',
    subtype: 'Windows 10',
    category: 'desktop',
    icon: '🖥️',
  },
];

const categories = [
  { key: 'all', label: 'Todos', icon: '🔎' },
  { key: 'mobile', label: 'Dispositivos Móveis', icon: '📱' },
  { key: 'printer', label: 'Impressoras', icon: '🖨️' },
  { key: 'router', label: 'Roteadores e Switches', icon: '🌐' },
  { key: 'desktop', label: 'PCs Desktop', icon: '🖥️' },
  { key: 'laptop', label: 'Laptops', icon: '💻' },
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [devices, setDevices] = useState(initialDevices);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    async function loadDomain() {
      const detected = await window.electronAPI.getLocalDomain();
      setDomain(detected);
    }

    async function loadDevices() {
      const response = await window.electronAPI.listNetworkDevices();
      if (response.success && response.devices?.length) {
        const mapped = response.devices.map((device) => ({
          id: device.id,
          name: device.hostname || device.ip_address,
          ip: device.ip_address,
          mac: device.mac_address || 'N/A',
          status: device.status,
          type: device.device_type,
          subtype: device.sub_type,
          category: device.device_type === 'mobile' ? 'mobile' : device.device_type === 'printer' ? 'printer' : device.device_type === 'router' ? 'router' : device.device_type === 'laptop' ? 'laptop' : device.device_type === 'desktop' ? 'desktop' : 'unknown',
          icon: device.device_type === 'printer' ? '🖨️' : device.device_type === 'router' ? '🌐' : device.device_type === 'desktop' ? '🖥️' : device.device_type === 'laptop' ? '💻' : '📱',
        }));
        setDevices(mapped);
      }
    }

    loadDomain();
    loadDevices();
  }, []);

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesCategory = activeCategory === 'all' || device.category === activeCategory;
      const haystack = `${device.name} ${device.ip} ${device.mac} ${device.type} ${device.subtype}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, devices, search]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Informe usuário e senha de administrador da rede.');
      return;
    }
    if (username === 'admin' && password === 'admin123') {
      const scanResponse = await window.electronAPI.startNetworkScan();
      if (scanResponse.success) {
        const response = await window.electronAPI.listNetworkDevices();
        if (response.success && response.devices?.length) {
          const mapped = response.devices.map((device) => ({
            id: device.id,
            name: device.hostname || device.ip_address,
            ip: device.ip_address,
            mac: device.mac_address || 'N/A',
            status: device.status,
            type: device.device_type,
            subtype: device.sub_type,
            category: device.device_type === 'mobile' ? 'mobile' : device.device_type === 'printer' ? 'printer' : device.device_type === 'router' ? 'router' : device.device_type === 'laptop' ? 'laptop' : device.device_type === 'desktop' ? 'desktop' : 'unknown',
            icon: device.device_type === 'printer' ? '🖨️' : device.device_type === 'router' ? '🌐' : device.device_type === 'desktop' ? '🖥️' : device.device_type === 'laptop' ? '💻' : '📱',
          }));
          setDevices(mapped);
        }
      }
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Credenciais inválidas. Use admin / admin123 para demo.');
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        domain={domain}
        username={username}
        password={password}
        error={error}
        onUsernameChange={(e) => setUsername(e.target.value)}
        onPasswordChange={(e) => setPassword(e.target.value)}
        onSubmit={handleLogin}
      />
    );
  }

  const handleApplyIpChange = async (payload) => {
    return manageIpAssignment(payload);
  };

  return (
    <div className="dashboard-layout">
      <Dashboard
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        filteredDevices={filteredDevices}
        onSelectDevice={setSelectedDevice}
      />
      <IpManagementPanel
        device={selectedDevice}
        onClose={() => setSelectedDevice(null)}
        onApply={handleApplyIpChange}
      />
    </div>
  );
}

export default App;
