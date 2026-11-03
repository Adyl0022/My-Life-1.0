import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { useStored } from './store';

export const ZONES: { code: string; name: string; lat: number; lon: number }[] = [
  { code: 'WLY01', name: 'Kuala Lumpur & Putrajaya', lat: 3.139, lon: 101.687 },
  { code: 'SGR01', name: 'Selangor (Shah Alam, Petaling, Gombak)', lat: 3.0738, lon: 101.5183 },
  { code: 'JHR02', name: 'Johor Bahru', lat: 1.4927, lon: 103.7414 },
  { code: 'PNG01', name: 'Pulau Pinang', lat: 5.4141, lon: 100.3288 },
  { code: 'PRK02', name: 'Ipoh, Perak', lat: 4.5975, lon: 101.0901 },
  { code: 'KDH01', name: 'Alor Setar, Kedah', lat: 6.1248, lon: 100.3678 },
  { code: 'MLK01', name: 'Melaka', lat: 2.1896, lon: 102.2501 },
  { code: 'NGS01', name: 'Seremban, Negeri Sembilan', lat: 2.7258, lon: 101.9424 },
  { code: 'PHG02', name: 'Kuantan, Pahang', lat: 3.8077, lon: 103.326 },
  { code: 'TRG01', name: 'Kuala Terengganu', lat: 5.3296, lon: 103.137 },
  { code: 'KTN03', name: 'Kota Bharu, Kelantan', lat: 6.1254, lon: 102.2381 },
  { code: 'PLS01', name: 'Kangar, Perlis', lat: 6.4414, lon: 100.1986 },
  { code: 'SBH07', name: 'Kota Kinabalu, Sabah', lat: 5.9804, lon: 116.0735 },
  { code: 'SWK08', name: 'Kuching, Sarawak', lat: 1.5535, lon: 110.3593 },
];
export const qiblaBearing = (lat: number, lon: number) => {
  const r = Math.PI / 180, kl = 21.4225 * r, p = lat * r, d = (39.8262 - lon) * r;
  const y = Math.sin(d) * Math.cos(kl), x = Math.cos(p) * Math.sin(kl) - Math.sin(p) * Math.cos(kl) * Math.cos(d);
  return Math.round(((Math.atan2(y, x) / r) + 360) % 360);
};
export type PT = { key: string; name: string; h: number; m: number; time12: string };
const NAMES: [string, string][] = [['fajr', 'Subuh'], ['syuruk', 'Syuruk'], ['dhuhr', 'Zohor'], ['asr', 'Asar'], ['maghrib', 'Maghrib'], ['isha', 'Isyak']];
export const f12 = (h: number, m: number) => ((h % 12) || 12) + ':' + String(m).padStart(2, '0') + (h < 12 ? ' am' : ' pm');
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const myNow = () => new Date(Date.now() + 8 * 3600 * 1000); // wall clock in Malaysia (UTC+8) read via getUTC*
const mk = (key: string, name: string, h: number, m: number): PT => ({ key, name, h, m, time12: f12(h, m) });

export type Place = { zone: string; lat: number; lon: number; auto: boolean };
type Month = { zone: string; prayers: any[]; src: 'waktusolat' | 'jakim' };
const HOSTS = ['https://api.waktusolat.app/v2', 'https://api.waktusolat.app/api/v2'];

async function getJson(url: string) { const r = await fetch(url); if (!r.ok) throw new Error('http ' + r.status); return r.json(); }
async function monthByGps(lat: number, lon: number, y: number, mo: number): Promise<Month> {
  let err: any;
  for (const h of HOSTS) {
    try {
      const j = await getJson(`${h}/solat/gps/${lat.toFixed(4)}/${lon.toFixed(4)}?year=${y}&month=${mo}`);
      if (j && j.zone && Array.isArray(j.prayers) && j.prayers.length) return { zone: j.zone, prayers: j.prayers, src: 'waktusolat' };
    } catch (e) { err = e; }
  }
  throw err || new Error('gps failed');
}
async function monthByZoneWs(zone: string, y: number, mo: number): Promise<Month> {
  let err: any;
  for (const h of HOSTS) {
    try { const j = await getJson(`${h}/solat/${zone}?year=${y}&month=${mo}`); if (j && Array.isArray(j.prayers) && j.prayers.length) return { zone, prayers: j.prayers, src: 'waktusolat' }; } catch (e) { err = e; }
  }
  throw err || new Error('zone failed');
}
async function monthJakim(zone: string): Promise<Month> {
  const j = await getJson('https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat&period=month&zone=' + zone);
  if (!j || !Array.isArray(j.prayerTime) || !j.prayerTime.length) throw new Error('empty');
  return { zone, prayers: j.prayerTime, src: 'jakim' };
}
function dayFrom(m: Month, d: Date): PT[] | null {
  if (m.src === 'waktusolat') {
    const row = m.prayers.find((x) => x.day === d.getUTCDate()); if (!row) return null;
    return NAMES.map(([k, n]) => { const s = ((row[k] + 8 * 3600) % 86400 + 86400) % 86400; return mk(k, n, Math.floor(s / 3600), Math.floor((s % 3600) / 60)); });
  }
  const want = String(d.getUTCDate()).padStart(2, '0') + '-' + MON[d.getUTCMonth()] + '-' + d.getUTCFullYear();
  const row = m.prayers.find((x) => String(x.date).toLowerCase() === want.toLowerCase()); if (!row) return null;
  const f: any = { fajr: 'fajr', syuruk: 'syuruk', dhuhr: 'dhuhr', asr: 'asr', maghrib: 'maghrib', isha: 'isha' };
  return NAMES.map(([k, n]) => { const p = String(row[f[k]]).split(':'); return mk(k, n, +p[0], +p[1]); });
}
async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  try { const c = await AsyncStorage.getItem(key); if (c) return JSON.parse(c); } catch (e) {}
  const v = await load();
  try { await AsyncStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
  return v;
}
async function whereAmI(): Promise<{ lat: number; lon: number }> {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (perm.status !== 'granted') throw new Error('denied');
  const last = await Location.getLastKnownPositionAsync().catch(() => null);
  const pos = last || (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  return { lat: pos.coords.latitude, lon: pos.coords.longitude };
}

export type Mode = { auto: boolean; zone: string };
export function usePrayer() {
  const [mode, setMode] = useStored<Mode>('ml_prayer_mode', { auto: true, zone: 'WLY01' });
  const [lastPlace, setLastPlace] = useStored<{ lat: number; lon: number; zone: string } | null>('ml_prayer_last', null);
  const [times, setTimes] = useState<PT[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'denied' | 'error'>('loading');
  const [place, setPlace] = useState<Place | null>(null);
  const [tick, setTick] = useState(0);
  const [clock, setClock] = useState(0);
  useEffect(() => { const t = setInterval(() => setClock((c) => c + 1), 30000); return () => clearInterval(t); }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setStatus('loading');
      const nd = myNow(); const y = nd.getUTCFullYear(), mo = nd.getUTCMonth() + 1;
      try {
        let m: Month; let lat: number, lon: number; let auto = mode.auto;
        if (mode.auto) {
          let c: { lat: number; lon: number };
          try { c = await whereAmI(); } catch (e: any) {
            if (lastPlace) c = { lat: lastPlace.lat, lon: lastPlace.lon };
            else { if (alive) setStatus(e && e.message === 'denied' ? 'denied' : 'error'); return; }
          }
          lat = c.lat; lon = c.lon;
          m = await cached(`ml_pt_gps_${lat.toFixed(2)}_${lon.toFixed(2)}_${y}-${mo}`, () => monthByGps(lat, lon, y, mo));
          if (alive) setLastPlace({ lat, lon, zone: m.zone });
        } else {
          const z = ZONES.find((x) => x.code === mode.zone) || ZONES[0]; lat = z.lat; lon = z.lon; auto = false;
          m = await cached(`ml_pt_${z.code}_${y}-${mo}`, async () => { try { return await monthByZoneWs(z.code, y, mo); } catch (e) { return monthJakim(z.code); } });
        }
        const t = dayFrom(m, nd); if (!t) throw new Error('nodate');
        if (alive) { setTimes(t); setPlace({ zone: m.zone, lat, lon, auto }); setStatus('ready'); }
      } catch (e) { if (alive) setStatus('error'); }
    })();
    return () => { alive = false; };
  }, [mode.auto, mode.zone, tick]);

  const nd = myNow(); const mins = nd.getUTCHours() * 60 + nd.getUTCMinutes();
  const pick = (list: PT[]) => { let i = list.findIndex((p) => p.h * 60 + p.m > mins); const tomorrow = i < 0 && list.length > 0; if (tomorrow) i = 0; return list.length ? { ...list[i], tomorrow, idx: i, diff: list[i].h * 60 + list[i].m - mins + (tomorrow ? 1440 : 0) } : null; };
  const next = pick(times);
  const solat = times.filter((t) => t.key !== 'syuruk');
  const nextSolat = pick(solat);
  return { times, next, nextSolat, status, place, mode, setMode, retry: () => setTick((x) => x + 1), clock };
}
