function Dashboard({ search, onSearchChange, categories, activeCategory, onCategoryChange, filteredDevices, onSelectDevice }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h2>MyNetworkIP Dashboard</h2>
          <p>Gerencie dispositivos conectados em sua rede local</p>
        </div>
        <div className="search-box">
          <input value={search} onChange={onSearchChange} placeholder="Buscar por nome, IP, MAC ou tipo..." />
        </div>
      </header>

      <nav className="nav-categories">
        {categories.map((category) => (
          <button
            key={category.key}
            className={activeCategory === category.key ? 'active' : ''}
            onClick={() => onCategoryChange(category.key)}
          >
            <span>{category.icon}</span> {category.label}
          </button>
        ))}
      </nav>

      <section className="devices-section">
        <div className="section-header">
          <h3>Dispositivos encontrados</h3>
          <span>{filteredDevices.length} itens</span>
        </div>

        <div className="device-list">
          {filteredDevices.map((device) => (
            <article className="device-card" key={device.id} onClick={() => onSelectDevice(device)}>
              <div className="device-main">
                <div className="device-icon">{device.icon}</div>
                <div>
                  <h4>{device.name}</h4>
                  <p>{device.subtype}</p>
                </div>
              </div>
              <div className="device-meta">
                <span><strong>IP:</strong> {device.ip}</span>
                <span><strong>MAC:</strong> {device.mac}</span>
                <span><strong>Status:</strong> {device.status}</span>
                <span><strong>Tipo:</strong> {device.type}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
