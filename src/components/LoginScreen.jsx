function LoginScreen({ domain, username, password, error, onUsernameChange, onPasswordChange, onSubmit }) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>MyNetworkIP</h1>
        <p>Monitoramento de rede local</p>
        <div className="domain-pill">Domínio detectado: {domain || 'detectando...'}</div>
        <form onSubmit={onSubmit}>
          <label>
            Usuário administrador
            <input value={username} onChange={onUsernameChange} placeholder="admin" />
          </label>
          <label>
            Senha administrador
            <input type="password" value={password} onChange={onPasswordChange} placeholder="admin123" />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default LoginScreen;
