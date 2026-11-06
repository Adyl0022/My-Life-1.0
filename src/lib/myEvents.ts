// Big Malaysian events (federal public holidays + major Islamic dates), built into the app so it works offline.
// Source: official Malaysian public holiday lists (2026–2027). Lunar dates (Raya, Haji, Awal Muharram, Maulidur Rasul,
// Ramadan, Deepavali) can move by a day depending on moon sighting; the app shows a note for those.
export type MyEv = { date: string; name: string; kind: 'islam' | 'national' | 'cultural'; moon?: boolean };

const L: MyEv[] = [
  { date: '2026-11-08', name: 'Deepavali', kind: 'cultural', moon: true },
  { date: '2026-12-25', name: 'Christmas Day', kind: 'cultural' },
  { date: '2027-01-01', name: "New Year's Day", kind: 'national' },
  { date: '2027-01-22', name: 'Thaipusam', kind: 'cultural' },
  { date: '2027-02-06', name: 'Chinese New Year', kind: 'cultural' },
  { date: '2027-02-08', name: 'Start of Ramadan', kind: 'islam', moon: true },
  { date: '2027-02-24', name: 'Nuzul Al-Quran', kind: 'islam', moon: true },
  { date: '2027-03-10', name: 'Hari Raya Aidilfitri', kind: 'islam', moon: true },
  { date: '2027-05-01', name: 'Labour Day', kind: 'national' },
  { date: '2027-05-17', name: 'Hari Raya Haji (Aidiladha)', kind: 'islam', moon: true },
  { date: '2027-05-20', name: 'Wesak Day', kind: 'cultural' },
  { date: '2027-06-06', name: 'Awal Muharram', kind: 'islam', moon: true },
  { date: '2027-06-07', name: "Agong's Birthday", kind: 'national' },
  { date: '2027-08-15', name: 'Maulidur Rasul', kind: 'islam', moon: true },
  { date: '2027-08-31', name: 'National Day (Merdeka)', kind: 'national' },
  { date: '2027-09-16', name: 'Malaysia Day', kind: 'national' },
  { date: '2027-10-29', name: 'Deepavali', kind: 'cultural', moon: true },
  { date: '2027-12-25', name: 'Christmas Day', kind: 'cultural' },
];

// Fixed-date holidays continue automatically after the table ends.
function fixed(y: number): MyEv[] {
  return [
    { date: y + '-01-01', name: "New Year's Day", kind: 'national' },
    { date: y + '-05-01', name: 'Labour Day', kind: 'national' },
    { date: y + '-08-31', name: 'National Day (Merdeka)', kind: 'national' },
    { date: y + '-09-16', name: 'Malaysia Day', kind: 'national' },
    { date: y + '-12-25', name: 'Christmas Day', kind: 'cultural' },
  ];
}

export function upcomingMy(today: string, n = 6): (MyEv & { days: number })[] {
  const y0 = +today.slice(0, 4);
  const all: MyEv[] = L.slice();
  for (let y = 2028; y <= y0 + 2 || y <= 2028; y++) all.push(...fixed(y));
  const t = new Date(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10)).getTime();
  return all.filter((e) => e.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1)).slice(0, n)
    .map((e) => ({ ...e, days: Math.round((new Date(+e.date.slice(0, 4), +e.date.slice(5, 7) - 1, +e.date.slice(8, 10)).getTime() - t) / 86400000) }));
}
