export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const cfg = (window as Window & { __APP_CONFIG__?: { apiUrl: string } }).__APP_CONFIG__;
    if (cfg?.apiUrl) return cfg.apiUrl;
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://b2b-bck.onrender.com';
}
