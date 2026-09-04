// Құрылғы/браузер анықтау — login_history және user_devices үшін
export interface DeviceInfo {
  device_name: string;
  os: string;
  browser: string;
}

export function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent;
  let os = "Белгісіз";
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/iPhone/.test(ua)) os = "iOS (iPhone)";
  else if (/iPad/.test(ua)) os = "iPadOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let browser = "Белгісіз";
  if (/Edg\//.test(ua)) browser = "Microsoft Edge";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";

  const isMobile = /iPhone|Android|iPad|Mobile/.test(ua);
  const kind = /iPad|Tablet/.test(ua) ? "Планшет" : isMobile ? "Мобильді" : "Компьютер";

  return { device_name: `${kind} · ${os}`, os, browser };
}

let cachedIp: string | null = null;

export async function detectIp(): Promise<string | null> {
  if (cachedIp) return cachedIp;
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const json = await res.json();
    cachedIp = json?.ip ?? null;
  } catch {
    cachedIp = null;
  }
  return cachedIp;
}

const DEVICE_KEY_STORAGE = "bilim_device_key";

/** Осы браузер/құрылғы үшін тұрақты бірегей кілт (сеанстарды басқару үшін) */
export function getDeviceKey(): string {
  let key = localStorage.getItem(DEVICE_KEY_STORAGE);
  if (!key) {
    key = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(DEVICE_KEY_STORAGE, key);
  }
  return key;
}
