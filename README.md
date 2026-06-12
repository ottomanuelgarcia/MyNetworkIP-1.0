# MyNetworkIP 1.0

MyNetworkIP é um aplicativo desktop multiplataforma desenvolvido com Electron.js e React para auxiliar no gerenciamento e na descoberta de dispositivos na rede local.

## Funcionalidades

- Descoberta de dispositivos na rede local
- Categorização automática de dispositivos (mobile, printer, router, desktop, laptop)
- Dashboard com busca e filtros por categoria
- Gerenciamento de IP com modos DHCP e estático
- Validação de IP, máscara de sub-rede, gateway e DNS
- Controle de alterações de rede com resumo e histórico simples

## Tecnologias

- Electron.js
- React
- Vite
- SQLite
- Node.js

## Requisitos

- Node.js 18+
- npm 9+
- Linux, Windows ou macOS

## Instalação

```bash
npm install
```

## Execução em modo de desenvolvimento

```bash
npm run dev
```

## Build para produção

```bash
npm run build
```

## Gerar pacote Debian

```bash
npm run dist
```

O pacote .deb será gerado em dist/.

## Testes

```bash
npm test
```

## Estrutura principal

- main.js: processo principal do Electron
- preload.js: bridge segura para comunicação IPC
- src/: interface React e lógica de rede
- test/: testes automatizados

## Licença

MIT
