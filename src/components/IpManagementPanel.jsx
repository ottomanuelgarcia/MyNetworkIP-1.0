import { useEffect, useMemo, useState } from 'react';

function IpManagementPanel({ device, onClose, onApply }) {
  const [mode, setMode] = useState('dhcp');
  const [ip, setIp] = useState('');
  const [subnetMask, setSubnetMask] = useState('255.255.255.0');
  const [gateway, setGateway] = useState('192.168.1.1');
  const [dnsPrimary, setDnsPrimary] = useState('8.8.8.8');
  const [dnsSecondary, setDnsSecondary] = useState('8.8.4.4');
  const [useServerDns, setUseServerDns] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (device) {
      setIp(device.ip || '');
      setMode('dhcp');
      setSubnetMask('255.255.255.0');
      setGateway('192.168.1.1');
      setDnsPrimary('8.8.8.8');
      setDnsSecondary('8.8.4.4');
      setUseServerDns(false);
      setSummary(null);
      setError('');
    }
  }, [device]);

  const canEditDns = useMemo(() => !useServerDns, [useServerDns]);

  const validateStaticConfig = () => {
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Pattern.test(ip.trim())) {
      return 'Informe um IP estático válido.';
    }

    if (!ipv4Pattern.test(subnetMask.trim())) {
      return 'Informe uma máscara de sub-rede válida.';
    }

    if (!ipv4Pattern.test(gateway.trim())) {
      return 'Informe um gateway válido.';
    }

    if (!useServerDns) {
      if (!ipv4Pattern.test(dnsPrimary.trim()) || !ipv4Pattern.test(dnsSecondary.trim())) {
        return 'Informe os servidores DNS primário e secundário válidos.';
      }
    }

    return '';
  };

  const handlePreview = () => {
    if (mode === 'static') {
      const validationError = validateStaticConfig();
      if (validationError) {
        setError(validationError);
        setSummary(null);
        return;
      }
    }

    setSummary({
      ip: mode === 'dhcp' ? device.ip : ip,
      subnetMask,
      gateway,
      dnsPrimary: useServerDns ? 'Servidor DHCP/DNS' : dnsPrimary,
      dnsSecondary: useServerDns ? 'Servidor DHCP/DNS' : dnsSecondary,
      useServerDns,
      mode,
    });
    setError('');
  };

  const handleApply = async () => {
    if (!device) return;

    if (mode === 'static') {
      const validationError = validateStaticConfig();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    const payload = {
      device,
      config: {
        ip: mode === 'dhcp' ? device.ip : ip,
        subnetMask,
        gateway,
        dnsPrimary: useServerDns ? 'Servidor DHCP/DNS' : dnsPrimary,
        dnsSecondary: useServerDns ? 'Servidor DHCP/DNS' : dnsSecondary,
        useServerDns,
      },
      adminUser: 'admin',
    };

    const result = await onApply(payload);
    if (!result.success) {
      setError(result.errors?.join(' ') || 'Falha ao aplicar alteração.');
    } else {
      setError('');
      setSummary(null);
      onClose();
    }
  };

  if (!device) return null;

  return (
    <aside className="ip-panel">
      <div className="ip-panel-header">
        <h3>Gerenciar IP · {device.name}</h3>
        <button onClick={onClose}>Fechar</button>
      </div>

      <div className="ip-options">
        <label>
          <input type="radio" checked={mode === 'dhcp'} onChange={() => setMode('dhcp')} />
          Manter DHCP atual
        </label>
        <label>
          <input type="radio" checked={mode === 'static'} onChange={() => setMode('static')} />
          Atribuir IP estático
        </label>
      </div>

      {mode === 'static' && (
        <div className="ip-form">
          <label>
            Novo endereço IP
            <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="192.168.1.50" />
          </label>
          <label>
            Máscara de sub-rede
            <input value={subnetMask} onChange={(e) => setSubnetMask(e.target.value)} />
          </label>
          <label>
            Gateway padrão
            <input value={gateway} onChange={(e) => setGateway(e.target.value)} />
          </label>
          <label>
            <input type="checkbox" checked={useServerDns} onChange={() => setUseServerDns(!useServerDns)} />
            Usar configurações de DNS do servidor
          </label>
          <label>
            DNS Primário
            <input value={dnsPrimary} onChange={(e) => setDnsPrimary(e.target.value)} disabled={!canEditDns} />
          </label>
          <label>
            DNS Secundário
            <input value={dnsSecondary} onChange={(e) => setDnsSecondary(e.target.value)} disabled={!canEditDns} />
          </label>
        </div>
      )}

      <div className="ip-actions">
        <button onClick={handlePreview}>Visualizar</button>
        <button className="primary" onClick={handleApply}>Aplicar Alterações</button>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {summary ? (
        <div className="summary-box">
          <h4>Resumo da alteração</h4>
          <pre>{JSON.stringify(summary, null, 2)}</pre>
        </div>
      ) : null}
    </aside>
  );
}

export default IpManagementPanel;
