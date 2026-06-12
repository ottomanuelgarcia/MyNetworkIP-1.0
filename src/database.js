import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'mynetworkip.db');

let db;

export async function getDatabase() {
  if (db) return db;

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT UNIQUE,
      mac_address TEXT,
      hostname TEXT,
      device_type TEXT,
      sub_type TEXT,
      status TEXT,
      last_seen TEXT,
      is_static_ip INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS device_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER UNIQUE,
      os_info TEXT,
      brand TEXT,
      model TEXT,
      dns_config TEXT,
      notes TEXT,
      FOREIGN KEY(device_id) REFERENCES devices(id)
    );
  `);

  return db;
}

export async function upsertDevice(device) {
  const database = await getDatabase();
  const { lastID } = await database.run(
    `INSERT INTO devices (ip_address, mac_address, hostname, device_type, sub_type, status, last_seen, is_static_ip)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(ip_address) DO UPDATE SET
       mac_address=excluded.mac_address,
       hostname=excluded.hostname,
       device_type=excluded.device_type,
       sub_type=excluded.sub_type,
       status=excluded.status,
       last_seen=excluded.last_seen,
       is_static_ip=excluded.is_static_ip`,
    [device.ipAddress, device.macAddress, device.hostname, device.deviceType, device.subType, device.status, device.lastSeen, device.isStaticIp ? 1 : 0]
  );

  return lastID;
}

export async function listDevices() {
  const database = await getDatabase();
  return database.all('SELECT * FROM devices ORDER BY last_seen DESC');
}

export async function updateDeviceDetails(deviceId, details) {
  const database = await getDatabase();
  await database.run(
    `INSERT INTO device_details (device_id, os_info, brand, model, dns_config, notes)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(device_id) DO UPDATE SET
       os_info=excluded.os_info,
       brand=excluded.brand,
       model=excluded.model,
       dns_config=excluded.dns_config,
       notes=excluded.notes`,
    [deviceId, details.osInfo, details.brand, details.model, details.dnsConfig, details.notes]
  );
}
