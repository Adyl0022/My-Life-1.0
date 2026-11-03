// @ts-nocheck
import React from 'react';
// Answer engine ported from the My Life design. Uses sample data until the real modules are connected.
export class AssistantBase extends React.Component<any, any> {
  render(): any { return null; }
  constructor(props) {
    super(props);
    this.state = {
      msgs: [], draft: '', lang: 'en', cat: 0, typing: false, cups: 5,
      steps: 4200, sleep: 4, mood: 3, prayed: 3, odo: 18420, nextSvc: 20300, kmMonth: 412, mtcMonth: 85, income: 3450, spends: [], pending: null, pid: 0,
      tasks: [
        { n: 'Finish weekly report', d: '2026-11-03', s: 'doing' },
        { n: 'Pay phone bill', d: '2026-11-05', s: 'todo' },
        { n: 'Buy groceries', d: '', s: 'todo' },
        { n: 'Renew road tax', d: '', s: 'done' }
      ]
    };
  }
  todayStr(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  rm(n) { return String(Math.round(n * 100) / 100); }
  mk(text, x) { return Object.assign({ me: false, text: text, time: this.hm(), big: '', bigLbl: '', pct: -1, color: '#8fe9e2', label: '', href: '', pid: 0 }, x || {}); }
  D() {
    const s = this.state; const td = this.todayStr(); const mo = td.slice(0, 7);
    const cats = { Food: 238, Petrol: 150, Bills: 120, Shopping: 80, Other: 54 };
    let tdy = 18; let mon = 642;
    s.spends.forEach(x => { cats[x.cat] = (cats[x.cat] || 0) + x.amt; if (x.date === td) tdy += x.amt; if (x.date.slice(0, 7) === mo) mon += x.amt; });
    let top = 'Food'; Object.keys(cats).forEach(k => { if (cats[k] > cats[top]) top = k; });
    const r = (n) => Math.round(n * 100) / 100;
    return {
      steps: s.steps, goal: 8000, sleep: s.sleep, sleepGoal: 7, cupGoal: 8, mood: s.mood, score: 82, streak: 4,
      prayed: s.prayed, spendToday: r(tdy), spendMonth: r(mon), income: s.income, topCat: top, topAmt: r(cats[top]),
      kmMonth: s.kmMonth, kmLast: 380, odo: s.odo, nextSvc: s.nextSvc, mtcMonth: r(s.mtcMonth),
      P: [['Subuh', 5, 48], ['Zohor', 13, 14], ['Asar', 16, 23], ['Maghrib', 19, 15], ['Isyak', 20, 26]],
      events: [{ n: 'Event name', d: '2026-11-05' }, { n: 'Another event', d: '2026-11-20' }]
    };
  }
  has(qn, list) { const p = ' ' + qn + ' '; return list.some(k => p.indexOf(' ' + k) >= 0); }
  parseAct(q, qn) {
    const ql = q.toLowerCase(); const has = (l) => this.has(qn, l);
    if (has(['berapa', 'how much', 'how many', 'what', 'apa', 'bila', 'when', 'macam mana', 'how', 'siapa', 'adakah', 'is my', 'are my'])) return null;
    let money = null; const mm = ql.match(/rm\s*([\d,]+(?:\.\d+)?)/) || ql.match(/([\d,]+(?:\.\d+)?)\s*(?:ringgit|rm\b)/);
    if (mm) { const v = parseFloat(mm[1].replace(/,/g, '')); if (v > 0) money = v; }
    const kmm = ql.match(/([\d,]{4,7})\s*km/) || ql.match(/(?:odometer|odo|mileage|milage|meter)\D{0,15}?([\d,]{4,7})/);
    const kmv = kmm ? parseInt(kmm[1].replace(/,/g, ''), 10) : null;
    const svc = [['tukar minyak', 'Oil change'], ['oil', 'Oil change'], ['servis', 'Service'], ['service', 'Service'], ['tayar', 'Tyres'], ['tyre', 'Tyres'], ['tire', 'Tyres'], ['brek', 'Brakes'], ['brake', 'Brakes'], ['rantai', 'Chain'], ['chain', 'Chain'], ['bateri', 'Battery'], ['battery', 'Battery'], ['baiki', 'Repair'], ['repair', 'Repair']];
    const hit = svc.filter(x => has([x[0]]))[0];
    if (money != null && hit) return { type: 'mtc', amt: money, name: hit[1], odo: kmv && kmv >= 1000 ? kmv : null };
    if (money != null && has(['gaji', 'salary', 'income', 'pendapatan', 'overtime', 'claim', 'tuntutan', 'bonus', 'elaun', 'allowance']) && has(['masuk', 'received', 'dapat', 'terima', 'got', 'earned', 'tambah', 'add', 'record', 'rekod', 'simpan', 'save'])) {
      const nm = has(['overtime']) ? 'Overtime' : has(['claim', 'tuntutan']) ? 'Claim' : has(['bonus']) ? 'Bonus' : has(['gaji', 'salary']) ? 'Salary' : 'Income';
      return { type: 'inc', amt: money, name: nm };
    }
    if (kmv != null && kmv >= 1000 && has(['tambah', 'add', 'set', 'update', 'kemas', 'rekod', 'record', 'simpan', 'save', 'sekarang', 'now', 'dah', 'already', 'log', 'masuk', 'current', 'semasa', 'bacaan', 'odometer', 'odo', 'mileage', 'milage'])) return { type: 'odo', val: kmv };
    if (money != null && (has(['spend', 'spent', 'belanja', 'beli', 'bayar', 'paid', 'pay', 'buy', 'bought', 'expense', 'habis', 'makan', 'lunch', 'dinner', 'breakfast', 'sarapan', 'petrol', 'topup', 'simpan', 'record', 'rekod', 'save', 'tambah', 'add']))) {
      const cat = has(['makan', 'food', 'lunch', 'dinner', 'breakfast', 'sarapan', 'minum', 'kopi', 'coffee', 'nasi', 'mee', 'teh', 'roti', 'snack']) ? 'Food' : has(['petrol', 'minyak', 'fuel', 'parking', 'tol', 'toll', 'grab', 'bas', 'bus', 'lrt']) ? 'Petrol' : has(['bil', 'bill', 'elektrik', 'internet', 'phone', 'telco', 'topup', 'sewa', 'rent']) ? 'Bills' : has(['shop', 'shopping', 'baju', 'kasut', 'shirt', 'shoes', 'beli barang']) ? 'Shopping' : 'Other';
      let nm = ql.replace(/rm\s*[\d,.]+/g, ' ').replace(/[\d,.]+\s*(ringgit|rm)/g, ' ');
      const g = nm.match(/(?:untuk|for|on|beli|buat|bought|buy)\s+(.+)$/);
      nm = g ? g[1] : '';
      nm = nm.replace(/\b(hari ini|harini|hari nie|today|semalam|yesterday|tadi|saya|i|nie|ini)\b/g, ' ').replace(/^\s*(beli|buy|bought|untuk|for)\s+/, '').replace(/\s+/g, ' ').trim();
      if (!nm) nm = cat === 'Other' ? 'Spending' : cat;
      nm = nm.charAt(0).toUpperCase() + nm.slice(1);
      const y = has(['semalam', 'yesterday']);
      const d = new Date(); if (y) d.setDate(d.getDate() - 1);
      return { type: 'spend', amt: money, cat: cat, name: nm, date: this.todayStr(d), ydy: y };
    }
    const sh = ql.match(/(\d+(?:\.\d+)?)\s*(jam|hours?|hrs?|h\b)/);
    if (sh && has(['tidur', 'sleep', 'slept']) && parseFloat(sh[1]) <= 14) return { type: 'sleep', h: parseFloat(sh[1]) };
    if (has(['mood', 'perasaan', 'rasa', 'feel', 'feeling'])) {
      const v = has(['awful', 'teruk', 'terrible', 'bad']) ? 1 : has(['low', 'sedih', 'sad', 'rendah']) ? 2 : has(['great', 'hebat', 'excellent', 'bagus', 'best']) ? 5 : has(['good', 'baik', 'happy', 'gembira', 'seronok']) ? 4 : has(['okay', 'biasa', 'ok']) ? 3 : 0;
      if (v) return { type: 'mood', v: v };
    }
    const sm = qn.match(/(\d{2,6})/);
    if (sm && has(['langkah', 'step', 'steps']) && has(['tambah', 'add', 'log', 'rekod', 'jalan', 'walked', 'dah', 'took'])) return { type: 'steps', n: parseInt(sm[1], 10) };
    if (has(['dah', 'sudah', 'telah', 'prayed', 'done', 'tunai', 'siap']) && has(['subuh', 'zohor', 'zuhur', 'asar', 'maghrib', 'isyak', 'fajr', 'dhuhr', 'asr', 'isha', 'solat', 'prayer'])) {
      const nm = ['Subuh', 'Zohor', 'Asar', 'Maghrib', 'Isyak'].filter(x => has([x.toLowerCase()]))[0] || (has(['fajr']) ? 'Subuh' : has(['dhuhr', 'zuhur']) ? 'Zohor' : has(['asr']) ? 'Asar' : has(['isha']) ? 'Isyak' : '');
      return { type: 'pray', name: nm };
    }
    return null;
  }
  confirm(yes) {
    const s = this.state; const p = s.pending; if (!p) return;
    const L = (en, ms) => (s.lang === 'ms' ? ms : en);
    const D = this.D(); let patch = { pending: null }; let m;
    if (!yes) m = this.mk(L('Okay, I did not save it.', 'Baik, saya tidak simpan.'));
    else if (p.type === 'spend') {
      patch.spends = s.spends.concat([{ amt: p.amt, cat: p.cat, name: p.name, date: p.date }]);
      const tdy = D.spendToday + (p.date === this.todayStr() ? p.amt : 0);
      m = this.mk(L('Saved RM ' + this.rm(p.amt) + ' under ' + p.cat + ' in My Finance. You have spent RM ' + this.rm(tdy) + ' today.', 'Dah disimpan RM ' + this.rm(p.amt) + ' di bawah ' + p.cat + ' dalam My Finance. Awak dah belanja RM ' + this.rm(tdy) + ' hari ini.'), { big: 'RM ' + this.rm(tdy), bigLbl: L('spent today', 'belanja hari ini'), color: '#ffc46b', label: L('Open Spending Tracker', 'Buka Spending Tracker'), href: 'Finance.dc.html' });
    } else if (p.type === 'mtc') {
      patch.mtcMonth = s.mtcMonth + p.amt;
      let extra = '';
      if (p.odo && p.odo > s.odo) { patch.kmMonth = s.kmMonth + (p.odo - s.odo); patch.odo = p.odo; extra = L(' Odometer updated to ' + this.num(p.odo) + ' km.', ' Odometer dikemas kini kepada ' + this.num(p.odo) + ' km.'); }
      if (p.name === 'Service' || p.name === 'Oil change') { patch.nextSvc = (patch.odo || s.odo) + 3000; extra += L(' Next service is at ' + this.num(patch.nextSvc) + ' km.', ' Servis seterusnya pada ' + this.num(patch.nextSvc) + ' km.'); }
      m = this.mk(L('Saved ' + p.name + ' RM ' + this.rm(p.amt) + ' in My Record. Maintenance this month is RM ' + this.rm(s.mtcMonth + p.amt) + '.', 'Dah disimpan ' + p.name + ' RM ' + this.rm(p.amt) + ' dalam My Record. Penyelenggaraan bulan ini RM ' + this.rm(s.mtcMonth + p.amt) + '.') + extra, { big: 'RM ' + this.rm(p.amt), bigLbl: p.name, color: '#ffc46b', label: L('Open My Record', 'Buka My Record'), href: 'Record.dc.html' });
    } else if (p.type === 'inc') {
      patch.income = s.income + p.amt;
      m = this.mk(L('Saved ' + p.name + ' RM ' + this.rm(p.amt) + ' in Monthly Income. This month total is RM ' + this.num(s.income + p.amt) + '.', 'Dah disimpan ' + p.name + ' RM ' + this.rm(p.amt) + ' dalam Pendapatan Bulanan. Jumlah bulan ini RM ' + this.num(s.income + p.amt) + '.'), { big: 'RM ' + this.num(s.income + p.amt), bigLbl: L('income this month', 'pendapatan bulan ini'), color: '#34d399', label: L('Open Monthly Income', 'Buka Pendapatan Bulanan'), href: 'Finance.dc.html' });
    } else if (p.type === 'odo') {
      const diff = p.val - s.odo; patch.odo = p.val; patch.kmMonth = s.kmMonth + diff;
      m = this.mk(L('Odometer saved: ' + this.num(p.val) + ' km. You rode ' + diff + ' km since the last reading, so this month is ' + (s.kmMonth + diff) + ' km.', 'Odometer disimpan: ' + this.num(p.val) + ' km. Awak tunggang ' + diff + ' km sejak bacaan terakhir, jadi bulan ini ' + (s.kmMonth + diff) + ' km.'), { big: this.num(p.val), bigLbl: 'km', color: '#ff8fab', label: L('Open My Record', 'Buka My Record'), href: 'Record.dc.html' });
    }
    this.setState(Object.assign({ msgs: s.msgs.concat([m]) }, patch));
    this.scroll();
  }
  hm() { const d = new Date(); let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, '0'); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + m + ' ' + ap; }
  num(n) { return Number(n).toLocaleString('en-US'); }
  norm(q) { return (q || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  daysTo(s) { if (!s) return null; const p = s.split('-'); const a = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); const n = new Date(); const b = new Date(n.getFullYear(), n.getMonth(), n.getDate()); return Math.round((a - b) / 86400000); }
  dueText(d, L) {
    const n = this.daysTo(d);
    if (n === null) return L('no due date', 'tiada tarikh');
    if (n < 0) return L('overdue by ' + (-n) + ' d', 'lewat ' + (-n) + ' hari');
    if (n === 0) return L('due today', 'hari ini');
    if (n === 1) return L('due tomorrow', 'esok');
    return L('in ' + n + ' days', 'dalam ' + n + ' hari');
  }
  fn() { return String(this.props.userName || 'Adli Syahmi').trim().split(/\s+/)[0]; }
  nextPrayer() {
    const D = this.D(); const now = new Date(); const cur = now.getHours() * 60 + now.getMinutes();
    let pick = null; let add = 0;
    for (let i = 0; i < D.P.length; i++) { const t = D.P[i][1] * 60 + D.P[i][2]; if (t > cur) { pick = D.P[i]; break; } }
    if (!pick) { pick = D.P[0]; add = 1440; }
    const diff = pick[1] * 60 + pick[2] + add - cur;
    let h = pick[1]; const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return { name: pick[0], time: h + ':' + String(pick[2]).padStart(2, '0') + ' ' + ap, mins: diff, hh: Math.floor(diff / 60), mm: diff % 60 };
  }
  detect(q) {
    const t = this.norm(q).split(' ');
    const ms = ['berapa', 'saya', 'hari', 'ini', 'macam', 'mana', 'tahap', 'belanja', 'tidur', 'langkah', 'tugasan', 'solat', 'tambah', 'bila', 'apa', 'bulan', 'lepas', 'awak', 'boleh', 'jauh', 'baki', 'gaji', 'servis', 'kesihatan', 'adakah', 'siapa', 'tolong', 'sekarang', 'esok', 'kiblat'];
    const en = ['what', 'how', 'my', 'today', 'am', 'the', 'is', 'many', 'much', 'did', 'can', 'who', 'when', 'steps', 'sleep'];
    if (t.some(x => ms.indexOf(x) >= 0)) return 'ms';
    if (t.some(x => en.indexOf(x) >= 0)) return 'en';
    return null;
  }
  intents() {
    return [
      { id: 'steps', k: ['step', 'steps', 'langkah', 'pedometer', 'berjalan kaki'] },
      { id: 'dist', k: ['jauh', 'jarak jalan', 'distance walked', 'walked', 'walk', 'berjalan', 'jalan kaki', 'how far'] },
      { id: 'health', k: ['kesihatan', 'health', 'sihat', 'healthy', 'keadaan', 'tahap', 'condition', 'fit', 'badan', 'body', 'wellbeing'] },
      { id: 'sleep', k: ['tidur', 'sleep', 'slept', 'mengantuk', 'bangun', 'sleeping'] },
      { id: 'water', k: ['air', 'water', 'minum', 'drink', 'hydrate', 'hydration', 'gelas', 'glass', 'glasses', 'dahaga'] },
      { id: 'mood', k: ['mood', 'perasaan', 'emosi', 'feel', 'feeling', 'rasa'] },
      { id: 'score', k: ['skor', 'score', 'life score', 'markah'] },
      { id: 'streak', k: ['streak', 'konsisten', 'berturut', 'consecutive'] },
      { id: 'next', k: ['next prayer', 'solat seterusnya', 'bila solat', 'bila waktu', 'azan', 'when is prayer', 'prayer next'] },
      { id: 'times', k: ['prayer times', 'waktu solat', 'jadual solat', 'prayer schedule', 'subuh', 'zohor', 'zuhur', 'asar', 'maghrib', 'isyak', 'fajr', 'dhuhr', 'asr', 'isha'] },
      { id: 'done', k: ['tunai', 'prayed', 'berapa solat', 'solat saya', 'prayers done', 'prayers today', 'prayers on time', 'my prayers'] },
      { id: 'quran', k: ['quran', 'kahfi', 'bacaan', 'surah', 'mengaji', 'recite', 'reading'] },
      { id: 'zikir', k: ['zikir', 'zikr', 'dhikr', 'tasbih', 'mathurat', 'wirid'] },
      { id: 'qibla', k: ['kiblat', 'qibla'] },
      { id: 'spend', k: ['belanja', 'spent', 'spend', 'spending', 'perbelanjaan', 'expense', 'expenses', 'habis duit', 'guna duit'] },
      { id: 'income', k: ['gaji', 'pendapatan', 'income', 'salary', 'earn', 'earned', 'pendapatan bulan ini'] },
      { id: 'balance', k: ['baki', 'left', 'remaining', 'save', 'saved', 'simpan', 'saving', 'balance', 'tinggal', 'lebihan'] },
      { id: 'top', k: ['paling banyak', 'top spending', 'most', 'kategori', 'category', 'tertinggi', 'biggest'] },
      { id: 'mmonth', k: ['motor', 'motosikal', 'motorcycle', 'mileage', 'jarak motor', 'tunggang', 'ride', 'riding'] },
      { id: 'mcmp', k: ['banding', 'compare', 'perbezaan', 'difference', 'bulan lepas', 'last month'] },
      { id: 'odo', k: ['odometer', 'odo', 'bacaan odometer'] },
      { id: 'svc', k: ['servis', 'service', 'tukar minyak', 'oil change', 'oil'] },
      { id: 'mtc', k: ['maintenance spending', 'belanja penyelenggaraan', 'penyelenggaraan', 'maintenance', 'repair', 'baiki', 'bengkel'] },
      { id: 'tasks', k: ['tugasan', 'tugas', 'task', 'tasks', 'todo', 'to do', 'kerja'] },
      { id: 'due', k: ['hampir', 'due', 'tarikh', 'deadline', 'tamat', 'urgent', 'lewat', 'overdue'] },
      { id: 'events', k: ['acara', 'event', 'events', 'birthday', 'hari lahir', 'kalendar', 'calendar', 'upcoming'] },
      { id: 'summary', k: ['ringkasan', 'summary', 'overview', 'rumusan', 'laporan', 'how am i doing', 'macam mana hari', 'my day'] },
      { id: 'advice', k: ['patut', 'should', 'cadang', 'suggest', 'nasihat', 'advice', 'buat sekarang', 'tips', 'do next', 'what next'] },
      { id: 'greet', k: ['hi', 'hello', 'hai', 'salam', 'assalamualaikum', 'hey', 'helo'] },
      { id: 'thanks', k: ['terima kasih', 'thanks', 'thank', 'tq', 'makasih', 'thx'] },
      { id: 'who', k: ['siapa', 'who are you', 'who', 'kamu', 'nama awak', 'are you ai', 'adakah awak ai', 'chatgpt'] },
      { id: 'help', k: ['boleh tanya', 'help', 'bantuan', 'apa boleh', 'what can', 'tolong', 'can i ask', 'commands'] },
      { id: 'privacy', k: ['selamat', 'safe', 'privasi', 'privacy', 'private', 'secure', 'keselamatan', 'security', 'data saya', 'my data'] }
    ];
  }
  pick(qn) {
    const padded = ' ' + qn + ' '; const toks = qn.split(' ');
    let best = null; let bs = 0;
    this.intents().forEach(it => {
      let s = 0;
      it.k.forEach(k => {
        if (k.indexOf(' ') >= 0) { if (padded.indexOf(' ' + k + ' ') >= 0) s += 3; }
        else if (toks.some(t => t === k || (k.length >= 4 && t.indexOf(k) === 0))) s += 2;
      });
      if (s > bs) { bs = s; best = it.id; }
    });
    return best;
  }
  comps() {
    const D = this.D(); const s = this.state;
    return [
      { k: 'water', r: Math.min(s.cups / D.cupGoal, 1), en: 'water', ms: 'air', tipEn: 'Drink a glass of water now.', tipMs: 'Minum segelas air sekarang.' },
      { k: 'sleep', r: Math.min(D.sleep / D.sleepGoal, 1), en: 'sleep', ms: 'tidur', tipEn: 'Try to sleep earlier tonight.', tipMs: 'Cuba tidur awal malam ini.' },
      { k: 'steps', r: Math.min(D.steps / D.goal, 1), en: 'steps', ms: 'langkah', tipEn: 'A 20 minute walk would help.', tipMs: 'Jalan santai 20 minit boleh membantu.' }
    ];
  }
  reply(q, lang) {
    const s = this.state; const D = this.D(); const qn = this.norm(q);
    const L = (en, ms) => (lang === 'ms' ? ms : en);
    const mk = (text, x) => Object.assign({ me: false, text: text, time: this.hm(), big: '', bigLbl: '', pct: -1, color: '#8fe9e2', label: '', href: '' }, x || {});
    let patch = {}; let m = null;
    const cmdTask = q.trim().match(/^(tambah|add|buat|create|new)\s+(tugasan|tugas|task|todo)\b\s*:?\s*(.*)$/i);
    const cmdWater = /^(tambah|add|log|minum|drink)\b/.test(qn) && /(air|water|gelas|segelas|glass|cup)/.test(qn);
    const pc = Math.round(D.steps / D.goal * 100);
    const cs = this.comps();
    const avg = Math.round(cs.reduce((a, c) => a + c.r, 0) / cs.length * 100);
    const weak = cs.slice().sort((a, b) => a.r - b.r)[0];
    const np = this.nextPrayer();
    const open = s.tasks.filter(t => t.s !== 'done');
    const dnow = s.tasks.filter(t => t.s === 'done').length;
    const act = this.parseAct(q, qn);
    if (act) {
      const id = s.pid + 1;
      if (act.type === 'spend' || act.type === 'mtc' || act.type === 'inc' || act.type === 'odo') {
        patch.pending = Object.assign({ id: id }, act); patch.pid = id;
        if (act.type === 'odo' && act.val <= s.odo) { patch.pending = null; m = mk(L('That is not higher than your last reading (' + this.num(s.odo) + ' km). Please check the number.', 'Itu tidak lebih tinggi daripada bacaan terakhir (' + this.num(s.odo) + ' km). Sila semak nombor itu.')); }
        else if (act.type === 'spend') m = mk(L('Got it. Save this spending?\n• ' + act.name + '\n• Category: ' + act.cat + '\n• Date: ' + (act.ydy ? 'yesterday' : 'today'), 'Faham. Simpan perbelanjaan ini?\n• ' + act.name + '\n• Kategori: ' + act.cat + '\n• Tarikh: ' + (act.ydy ? 'semalam' : 'hari ini')), { pid: id, big: 'RM ' + this.rm(act.amt), bigLbl: act.cat, color: '#ffc46b' });
        else if (act.type === 'mtc') m = mk(L('Got it. Save this motorcycle record?\n• ' + act.name + (act.odo ? '\n• Odometer: ' + this.num(act.odo) + ' km' : '') + '\n• Date: today', 'Faham. Simpan rekod motosikal ini?\n• ' + act.name + (act.odo ? '\n• Odometer: ' + this.num(act.odo) + ' km' : '') + '\n• Tarikh: hari ini'), { pid: id, big: 'RM ' + this.rm(act.amt), bigLbl: act.name, color: '#ff8fab' });
        else if (act.type === 'inc') m = mk(L('Got it. Save this income to this month?\n• ' + act.name, 'Faham. Simpan pendapatan ini untuk bulan ini?\n• ' + act.name), { pid: id, big: 'RM ' + this.rm(act.amt), bigLbl: act.name, color: '#34d399' });
        else m = mk(L('Got it. Save this odometer reading?', 'Faham. Simpan bacaan odometer ini?'), { pid: id, big: this.num(act.val), bigLbl: 'km', color: '#ff8fab' });
      } else if (act.type === 'steps') {
        patch.steps = s.steps + act.n; const pp = Math.min(100, Math.round(patch.steps / D.goal * 100));
        m = mk(L('Added ' + this.num(act.n) + ' steps. You are at ' + this.num(patch.steps) + ' today (' + pp + '% of goal).', 'Ditambah ' + this.num(act.n) + ' langkah. Sekarang ' + this.num(patch.steps) + ' hari ini (' + pp + '% sasaran).'), { big: this.num(patch.steps), bigLbl: L('steps today', 'langkah hari ini'), pct: pp, color: '#5ee7df', label: L('Open Habit & Health', 'Buka Habit & Health'), href: 'Habit.dc.html' });
      } else if (act.type === 'sleep') {
        patch.sleep = act.h;
        m = mk(L('Saved: you slept ' + act.h + ' hours.', 'Disimpan: awak tidur ' + act.h + ' jam.') + (act.h < 6 ? L(' That is short. Rest early tonight.', ' Itu kurang. Rehat awal malam ini.') : ''), { big: act.h + 'h', bigLbl: L('of 7h goal', 'daripada 7j'), pct: Math.round(Math.min(act.h / 7, 1) * 100), color: '#b794ff', label: L('Open Habit & Health', 'Buka Habit & Health'), href: 'Habit.dc.html' });
      } else if (act.type === 'mood') {
        patch.mood = act.v; const nm = L(['Awful', 'Low', 'Okay', 'Good', 'Great'][act.v - 1], ['Teruk', 'Rendah', 'Okay', 'Baik', 'Hebat'][act.v - 1]);
        m = mk(L('Saved: your mood today is "' + nm + '".', 'Disimpan: mood awak hari ini "' + nm + '".'), { big: act.v + '/5', bigLbl: nm, pct: act.v * 20, color: '#ff8fab', label: L('Open Habit & Health', 'Buka Habit & Health'), href: 'Habit.dc.html' });
      } else if (act.type === 'pray') {
        patch.prayed = Math.min(5, s.prayed + 1);
        m = mk(L('Marked ' + (act.name || 'the prayer') + ' as done. That is ' + patch.prayed + ' of 5 today.', 'Ditanda ' + (act.name || 'solat') + ' sudah ditunaikan. Sekarang ' + patch.prayed + ' daripada 5 hari ini.'), { big: patch.prayed + '/5', bigLbl: L('on time', 'tepat waktu'), pct: patch.prayed * 20, color: '#34d399', label: L('Open Islamic Hub', 'Buka Islamic Hub'), href: 'Islamic.dc.html' });
      }
    } else if (cmdTask) {
      let name = (cmdTask[3] || '').trim();
      if (!name) { m = mk(L('Sure. What is the task? Type for example: add task buy milk.', 'Boleh. Apa tugasannya? Contoh: tambah tugasan beli susu.')); }
      else {
        name = name.charAt(0).toUpperCase() + name.slice(1);
        patch.tasks = s.tasks.concat([{ n: name, d: '', s: 'todo' }]);
        m = mk(L('Done. I added "' + name + '" to your Daily Planner tasks. You now have ' + (open.length + 1) + ' open tasks.', 'Siap. Saya dah tambah "' + name + '" dalam tugasan Daily Planner. Awak ada ' + (open.length + 1) + ' tugasan belum siap.'), { big: String(open.length + 1), bigLbl: L('open tasks', 'tugasan belum siap'), color: '#7c9cff', label: L('Open Daily Planner', 'Buka Daily Planner'), href: 'Planner.dc.html' });
      }
    } else if (cmdWater) {
      const wn = (qn.match(/(\d+)\s*(gelas|glass|cup)/) || [0, 1])[1]; const c = Math.min(D.cupGoal, s.cups + Number(wn));
      patch.cups = c;
      m = mk(c === s.cups ? L('You already reached your water goal today. Well done.', 'Awak dah capai sasaran air hari ini. Syabas.') : L('Logged. That is ' + c + ' of ' + D.cupGoal + ' glasses today.', 'Dah direkod. Sekarang ' + c + ' daripada ' + D.cupGoal + ' gelas hari ini.'), { big: c + '/' + D.cupGoal, bigLbl: L('glasses', 'gelas'), pct: Math.round(c / D.cupGoal * 100), color: '#5ee7df', label: L('Open Habit & Health', 'Buka Habit & Health'), href: 'Habit.dc.html' });
    } else {
      let id = this.pick(qn);
      if (id === 'spend' && /(bulan|month)/.test(qn)) id = 'spendM';
      if (id === 'mmonth' && /(banding|compare|lepas|last)/.test(qn)) id = 'mcmp';
      switch (id) {
        case 'steps':
          m = mk(L('You have walked ' + this.num(D.steps) + ' steps today, ' + pc + '% of your ' + this.num(D.goal) + ' goal. ' + this.num(Math.max(0, D.goal - D.steps)) + ' to go. A relaxed 30 minute walk after Asar would get you close.', 'Hari ini awak dah jalan ' + this.num(D.steps) + ' langkah, ' + pc + '% daripada sasaran ' + this.num(D.goal) + '. Tinggal ' + this.num(Math.max(0, D.goal - D.steps)) + ' langkah lagi. Jalan santai 30 minit lepas Asar boleh hampirkan awak ke sasaran.'), { big: this.num(D.steps), bigLbl: L('steps · ' + pc + '% of goal', 'langkah · ' + pc + '% sasaran'), pct: pc, color: '#5ee7df', label: L('Open Habit & Health', 'Buka Habit & Health'), href: 'Habit.dc.html' });
          break;
        case 'dist': {
          const km = (D.steps * 0.00075).toFixed(1);
          m = mk(L('Today you moved about ' + km + ' km on foot, from ' + this.num(D.steps) + ' steps. This is an estimate based on your average stride.', 'Hari ini awak bergerak lebih kurang ' + km + ' km berjalan kaki, daripada ' + this.num(D.steps) + ' langkah. Ini anggaran berdasarkan purata langkah awak.'), { big: km + ' km', bigLbl: L('walked today', 'berjalan hari ini'), pct: pc, color: '#5ee7df', label: L('See 7-day graph', 'Lihat graf 7 hari'), href: 'Habit.dc.html' });
          break;
        }
        case 'health':
          m = mk(L('Your health score today is ' + avg + '%, which is ' + (avg >= 75 ? 'good' : avg >= 50 ? 'fair' : 'low') + '.\nWater ' + s.cups + '/' + D.cupGoal + ' · Sleep ' + D.sleep + 'h · Steps ' + this.num(D.steps) + '\nWeakest area: ' + weak.en + '. ' + weak.tipEn, 'Skor kesihatan awak hari ini ' + avg + '%, iaitu ' + (avg >= 75 ? 'baik' : avg >= 50 ? 'sederhana' : 'rendah') + '.\nAir ' + s.cups + '/' + D.cupGoal + ' · Tidur ' + D.sleep + 'j · Langkah ' + this.num(D.steps) + '\nPaling lemah: ' + weak.ms + '. ' + weak.tipMs), { big: avg + '%', bigLbl: L('daily goal', 'sasaran harian'), pct: avg, color: avg >= 75 ? '#34d399' : avg >= 50 ? '#ffc46b' : '#ff8fab', label: L('Open Habit & Health', 'Buka Habit & Health'), href: 'Habit.dc.html' });
          break;
        case 'sleep': {
          const gap = Math.max(0, D.sleepGoal - D.sleep);
          m = mk(L('You slept ' + D.sleep + ' hours, ' + gap + ' hours short of your ' + D.sleepGoal + ' hour goal. ' + (gap > 1 ? 'Short sleep lowers focus and mood. Try to be in bed 1 to 2 hours earlier tonight.' : 'That is close to your goal. Keep it up.'), 'Awak tidur ' + D.sleep + ' jam, kurang ' + gap + ' jam daripada sasaran ' + D.sleepGoal + ' jam. ' + (gap > 1 ? 'Tidur kurang menjejaskan fokus dan mood. Cuba berbaring 1 hingga 2 jam lebih awal malam ini.' : 'Hampir capai sasaran. Teruskan.')), { big: D.sleep + 'h', bigLbl: L('of ' + D.sleepGoal + 'h goal', 'daripada ' + D.sleepGoal + 'j'), pct: Math.round(Math.min(D.sleep / D.sleepGoal, 1) * 100), color: '#b794ff', label: L('Open Sleep tracker', 'Buka penjejak tidur'), href: 'Habit.dc.html' });
          break;
        }
        case 'water':
          m = mk(L('You have had ' + s.cups + ' of ' + D.cupGoal + ' glasses today. ' + (s.cups < D.cupGoal ? (D.cupGoal - s.cups) + ' more to reach your goal. Tell me "add a glass of water" and I will log it.' : 'Goal reached. Well done.'), 'Awak dah minum ' + s.cups + ' daripada ' + D.cupGoal + ' gelas hari ini. ' + (s.cups < D.cupGoal ? 'Tinggal ' + (D.cupGoal - s.cups) + ' gelas lagi. Cakap "tambah segelas air" dan saya akan rekodkan.' : 'Sasaran dicapai. Syabas.')), { big: s.cups + '/' + D.cupGoal, bigLbl: L('glasses', 'gelas'), pct: Math.round(s.cups / D.cupGoal * 100), color: '#5ee7df', label: L('Open Habit & Health', 'Buka Habit & Health'), href: 'Habit.dc.html' });
          break;
        case 'mood': {
          const nm = L(['Awful', 'Low', 'Okay', 'Good', 'Great'][D.mood - 1], ['Teruk', 'Rendah', 'Okay', 'Baik', 'Hebat'][D.mood - 1]);
          m = mk(L('Your mood today is "' + nm + '". ' + (D.sleep < 6 ? 'Low sleep may be affecting it. Rest early tonight.' : 'Keep doing what works for you.'), 'Mood awak hari ini "' + nm + '". ' + (D.sleep < 6 ? 'Tidur yang kurang mungkin menjejaskannya. Rehat awal malam ini.' : 'Teruskan apa yang berkesan untuk awak.')), { big: D.mood + '/5', bigLbl: nm, pct: D.mood * 20, color: '#ff8fab', label: L('Update mood', 'Kemas kini mood'), href: 'Habit.dc.html' });
          break;
        }
        case 'score':
          m = mk(L('Your Life Score is ' + D.score + ' out of 100. It blends prayers, water, spending and habits. Water is the easiest way to lift it today.', 'Skor Life awak ' + D.score + ' daripada 100. Ia gabungan solat, air, perbelanjaan dan habit. Air ialah cara paling mudah untuk menaikkannya hari ini.'), { big: String(D.score), bigLbl: L('out of 100', 'daripada 100'), pct: D.score, color: '#8fe9e2', label: L('Open Insights', 'Buka Insights'), href: 'Insights.dc.html' });
          break;
        case 'streak':
          m = mk(L('Your habit streak is ' + D.streak + ' days in a row. Log one habit today to make it ' + (D.streak + 1) + '.', 'Streak habit awak ' + D.streak + ' hari berturut-turut. Rekod satu habit hari ini untuk jadikan ' + (D.streak + 1) + '.'), { big: D.streak + ' d', bigLbl: L('streak', 'streak'), pct: Math.min(100, D.streak * 14), color: '#ff8fab', label: L('See habit history', 'Lihat sejarah habit'), href: 'HabitHistory.dc.html' });
          break;
        case 'next': {
          const when = np.hh > 0 ? np.hh + 'h ' + np.mm + 'm' : np.mm + ' min';
          m = mk(L('Next prayer is ' + np.name + ' at ' + np.time + ', in ' + when + '. These are sample times. The real app follows JAKIM for your zone.', 'Solat seterusnya ialah ' + np.name + ' pada ' + np.time + ', lagi ' + when + '. Ini waktu contoh. App sebenar akan ikut JAKIM mengikut zon awak.'), { big: np.time, bigLbl: np.name, pct: -1, color: '#34d399', label: L('Open Prayer Times', 'Buka Waktu Solat'), href: 'Prayer.dc.html' });
          break;
        }
        case 'times':
          m = mk(L('Prayer times today (sample, Kuala Lumpur):\n', 'Waktu solat hari ini (contoh, Kuala Lumpur):\n') + D.P.map(p => { let h = p[1]; const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return p[0] + '  ' + h + ':' + String(p[2]).padStart(2, '0') + ' ' + ap; }).join('\n') + L('\nThe real app follows JAKIM by zone.', '\nApp sebenar akan ikut JAKIM mengikut zon.'), { label: L('Open Prayer Times', 'Buka Waktu Solat'), href: 'Prayer.dc.html' });
          break;
        case 'done':
          m = mk(L('You have prayed ' + D.prayed + ' of 5 prayers on time today. Next is ' + np.name + ' at ' + np.time + '.', 'Awak dah tunaikan ' + D.prayed + ' daripada 5 solat pada waktunya hari ini. Seterusnya ' + np.name + ' pada ' + np.time + '.'), { big: D.prayed + '/5', bigLbl: L('on time', 'tepat waktu'), pct: D.prayed * 20, color: '#34d399', label: L('Open Islamic Hub', 'Buka Islamic Hub'), href: 'Islamic.dc.html' });
          break;
        case 'quran':
          m = mk(L('You are in Surah Al-Kahfi. ' + (new Date().getDay() === 5 ? 'Today is Friday, a good day to finish it.' : 'Friday is a good day to finish it.') + ' Tap below to continue where you stopped.', 'Awak sedang membaca Surah Al-Kahfi. ' + (new Date().getDay() === 5 ? 'Hari ini Jumaat, waktu yang baik untuk menghabiskannya.' : 'Jumaat ialah hari yang baik untuk menghabiskannya.') + ' Tekan di bawah untuk sambung di tempat awak berhenti.'), { label: L('Continue Al-Kahfi', 'Sambung Al-Kahfi'), href: 'Kahfi.dc.html' });
          break;
        case 'zikir': {
          const h = new Date().getHours();
          const w = h >= 5 && h < 11 ? L('Morning Al-Ma\'thurat suits this time.', 'Al-Ma\'thurat pagi sesuai pada waktu ini.') : h >= 16 && h < 20 ? L('Evening Al-Ma\'thurat is best after Asar.', 'Al-Ma\'thurat petang paling elok selepas Asar.') : L('A short tasbih session fits well now.', 'Sesi tasbih ringkas sesuai sekarang.');
          m = mk(w + L(' It takes about 10 minutes.', ' Ia ambil masa lebih kurang 10 minit.'), { label: L('Open Al-Ma\'thurat', 'Buka Al-Ma\'thurat'), href: 'Mathurat.dc.html' });
          break;
        }
        case 'qibla':
          m = mk(L('Qibla in the sample is 292° from north (Kuala Lumpur). The real app will follow JAKIM for the Qibla direction.', 'Kiblat dalam contoh ialah 292° dari utara (Kuala Lumpur). App sebenar akan ikut JAKIM untuk arah kiblat.'), { big: '292°', bigLbl: L('from north', 'dari utara'), label: L('Open Prayer Times', 'Buka Waktu Solat'), href: 'Prayer.dc.html' });
          break;
        case 'spend':
          m = mk(L('You spent RM ' + D.spendToday + ' today. Your month so far is RM ' + D.spendMonth + '.', 'Awak belanja RM ' + D.spendToday + ' hari ini. Bulan ini setakat ini RM ' + D.spendMonth + '.'), { big: 'RM ' + D.spendToday, bigLbl: L('spent today', 'belanja hari ini'), label: L('Open Spending Tracker', 'Buka Spending Tracker'), href: 'Finance.dc.html' });
          break;
        case 'spendM':
          m = mk(L('You have spent RM ' + D.spendMonth + ' this month. Your biggest category is ' + D.topCat + ' at RM ' + D.topAmt + '.', 'Awak dah belanja RM ' + D.spendMonth + ' bulan ini. Kategori terbesar ialah ' + D.topCat + ' sebanyak RM ' + D.topAmt + '.'), { big: 'RM ' + D.spendMonth, bigLbl: L('this month', 'bulan ini'), pct: Math.round(D.spendMonth / D.income * 100), color: '#ffc46b', label: L('Open My Finance', 'Buka My Finance'), href: 'Finance.dc.html' });
          break;
        case 'income':
          m = mk(L('Your income this month is RM ' + this.num(D.income) + '. You can edit each line (salary, overtime, claim) in My Finance.', 'Pendapatan awak bulan ini RM ' + this.num(D.income) + '. Awak boleh ubah setiap baris (gaji, overtime, tuntutan) dalam My Finance.'), { big: 'RM ' + this.num(D.income), bigLbl: L('this month', 'bulan ini'), label: L('Open Monthly Income', 'Buka Pendapatan Bulanan'), href: 'Finance.dc.html' });
          break;
        case 'balance': {
          const left = D.income - D.spendMonth;
          m = mk(L('Income RM ' + this.num(D.income) + ' minus spending RM ' + D.spendMonth + ' leaves RM ' + this.num(left) + ' this month.', 'Pendapatan RM ' + this.num(D.income) + ' tolak belanja RM ' + D.spendMonth + ' tinggal RM ' + this.num(left) + ' bulan ini.'), { big: 'RM ' + this.num(left), bigLbl: L('left this month', 'baki bulan ini'), pct: Math.round(left / D.income * 100), color: '#34d399', label: L('Open My Finance', 'Buka My Finance'), href: 'Finance.dc.html' });
          break;
        }
        case 'top':
          m = mk(L('Your top spending category this month is ' + D.topCat + ': RM ' + D.topAmt + ', about ' + Math.round(D.topAmt / D.spendMonth * 100) + '% of your spending.', 'Kategori belanja tertinggi bulan ini ialah ' + D.topCat + ': RM ' + D.topAmt + ', kira-kira ' + Math.round(D.topAmt / D.spendMonth * 100) + '% daripada belanja awak.'), { big: 'RM ' + D.topAmt, bigLbl: D.topCat, pct: Math.round(D.topAmt / D.spendMonth * 100), color: '#ffc46b', label: L('See Spending by Category', 'Lihat Belanja ikut Kategori'), href: 'Finance.dc.html' });
          break;
        case 'mmonth':
          m = mk(L('You rode ' + D.kmMonth + ' km this month. Last month was ' + D.kmLast + ' km.', 'Awak tunggang ' + D.kmMonth + ' km bulan ini. Bulan lepas ' + D.kmLast + ' km.'), { big: D.kmMonth + ' km', bigLbl: L('this month', 'bulan ini'), pct: Math.min(100, Math.round(D.kmMonth / Math.max(D.kmMonth, D.kmLast) * 100)), color: '#ff8fab', label: L('Open My Record', 'Buka My Record'), href: 'Record.dc.html' });
          break;
        case 'mcmp': {
          const df = D.kmMonth - D.kmLast; const pp = Math.round(Math.abs(df) / D.kmLast * 100);
          m = mk(L('This month ' + D.kmMonth + ' km vs last month ' + D.kmLast + ' km. That is ' + Math.abs(df) + ' km ' + (df >= 0 ? 'more' : 'less') + ' (' + pp + '%).', 'Bulan ini ' + D.kmMonth + ' km berbanding bulan lepas ' + D.kmLast + ' km. Ia ' + Math.abs(df) + ' km ' + (df >= 0 ? 'lebih' : 'kurang') + ' (' + pp + '%).'), { big: (df >= 0 ? '+' : '-') + Math.abs(df) + ' km', bigLbl: L('vs last month', 'berbanding bulan lepas'), color: '#ff8fab', label: L('See monthly mileage', 'Lihat jarak bulanan'), href: 'Record.dc.html' });
          break;
        }
        case 'odo':
          m = mk(L('Your last odometer reading is ' + this.num(D.odo) + ' km.', 'Bacaan odometer terakhir awak ialah ' + this.num(D.odo) + ' km.'), { big: this.num(D.odo), bigLbl: 'km', label: L('Add new reading', 'Tambah bacaan baru'), href: 'Record.dc.html' });
          break;
        case 'svc': {
          const left = D.nextSvc - D.odo;
          m = mk(L('Your next service is at ' + this.num(D.nextSvc) + ' km, which is ' + this.num(left) + ' km away. At your pace of about ' + D.kmMonth + ' km a month, that is roughly ' + Math.max(1, Math.round(left / D.kmMonth)) + ' months.', 'Servis seterusnya pada ' + this.num(D.nextSvc) + ' km, iaitu ' + this.num(left) + ' km lagi. Dengan kadar lebih kurang ' + D.kmMonth + ' km sebulan, ia dalam ' + Math.max(1, Math.round(left / D.kmMonth)) + ' bulan.'), { big: this.num(left), bigLbl: L('km to service', 'km ke servis'), pct: Math.round((3000 - left) / 3000 * 100), color: '#ffc46b', label: L('Open My Record', 'Buka My Record'), href: 'Record.dc.html' });
          break;
        }
        case 'mtc':
          m = mk(L('You spent RM ' + D.mtcMonth + ' on motorcycle maintenance this month.', 'Awak belanja RM ' + D.mtcMonth + ' untuk penyelenggaraan motosikal bulan ini.'), { big: 'RM ' + D.mtcMonth, bigLbl: L('maintenance', 'penyelenggaraan'), color: '#ffc46b', label: L('See spending graph', 'Lihat graf belanja'), href: 'Record.dc.html' });
          break;
        case 'tasks': {
          const lines = open.slice(0, 5).map(t => '• ' + t.n + ' (' + this.dueText(t.d, L) + ')').join('\n');
          m = mk(open.length ? L('You have ' + open.length + ' open tasks:\n', 'Awak ada ' + open.length + ' tugasan belum siap:\n') + lines : L('No open tasks. Nice and clear.', 'Tiada tugasan tertunggak. Bagus.'), { big: String(open.length), bigLbl: L('open · ' + dnow + ' done', 'belum siap · ' + dnow + ' siap'), pct: Math.round(dnow / Math.max(1, s.tasks.length) * 100), color: '#7c9cff', label: L('Open Daily Planner', 'Buka Daily Planner'), href: 'Planner.dc.html' });
          break;
        }
        case 'due': {
          const soon = open.filter(t => t.d && this.daysTo(t.d) <= 3).sort((a, b) => this.daysTo(a.d) - this.daysTo(b.d));
          m = mk(soon.length ? L('These are due soon:\n', 'Ini hampir tarikh:\n') + soon.map(t => '• ' + t.n + ' (' + this.dueText(t.d, L) + ')').join('\n') : L('Nothing is due in the next 3 days.', 'Tiada yang tamat dalam 3 hari akan datang.'), { label: L('Open Daily Planner', 'Buka Daily Planner'), href: 'Planner.dc.html' });
          break;
        }
        case 'events': {
          const ev = D.events.filter(e => this.daysTo(e.d) >= 0).sort((a, b) => this.daysTo(a.d) - this.daysTo(b.d));
          m = mk(ev.length ? L('Upcoming events:\n', 'Acara akan datang:\n') + ev.map(e => '• ' + e.n + ' (' + this.dueText(e.d, L) + ')').join('\n') : L('No upcoming events.', 'Tiada acara akan datang.'), { label: L('Open Date & Events', 'Buka Date & Events'), href: 'Planner.dc.html' });
          break;
        }
        case 'summary':
          m = mk(L('Your day so far:\nSteps ' + this.num(D.steps) + ' (' + pc + '%)\nWater ' + s.cups + '/' + D.cupGoal + ' · Sleep ' + D.sleep + 'h\nPrayers ' + D.prayed + '/5 on time\nSpent RM ' + D.spendToday + '\nOpen tasks ' + open.length, 'Hari awak setakat ini:\nLangkah ' + this.num(D.steps) + ' (' + pc + '%)\nAir ' + s.cups + '/' + D.cupGoal + ' · Tidur ' + D.sleep + 'j\nSolat ' + D.prayed + '/5 tepat waktu\nBelanja RM ' + D.spendToday + '\nTugasan belum siap ' + open.length), { big: avg + '%', bigLbl: L('daily goal', 'sasaran harian'), pct: avg, color: '#8fe9e2', label: L('Open Insights', 'Buka Insights'), href: 'Insights.dc.html' });
          break;
        case 'advice': {
          const a = [];
          if (np.mins <= 45) a.push(L('Get ready for ' + np.name + ' in ' + np.mins + ' minutes.', 'Bersedia untuk ' + np.name + ' dalam ' + np.mins + ' minit.'));
          a.push(L(weak.tipEn + ' Your ' + weak.en + ' is the lowest today.', weak.tipMs + ' ' + weak.ms.charAt(0).toUpperCase() + weak.ms.slice(1) + ' awak paling rendah hari ini.'));
          const soon = open.filter(t => t.d && this.daysTo(t.d) <= 2).sort((x, y) => this.daysTo(x.d) - this.daysTo(y.d))[0];
          if (soon) a.push(L('Finish "' + soon.n + '" (' + this.dueText(soon.d, L) + ').', 'Siapkan "' + soon.n + '" (' + this.dueText(soon.d, L) + ').'));
          const h = new Date().getHours();
          if (h >= 16 && h < 20) a.push(L('Read evening Al-Ma\'thurat.', 'Baca Al-Ma\'thurat petang.'));
          else if (h < 10) a.push(L('Read morning Al-Ma\'thurat.', 'Baca Al-Ma\'thurat pagi.'));
          if (D.nextSvc - D.odo < 2000) a.push(L('Plan your motorcycle service soon.', 'Rancang servis motosikal tidak lama lagi.'));
          m = mk(L('Here is what I would do next:\n', 'Ini yang saya cadang seterusnya:\n') + a.slice(0, 3).map((x, i) => (i + 1) + '. ' + x).join('\n'));
          break;
        }
        case 'greet':
          m = mk(L('Hi ' + this.fn() + '! Ask me about your steps, sleep, prayers, spending, motorcycle or tasks.', 'Hai ' + this.fn() + '! Tanya saya tentang langkah, tidur, solat, belanja, motosikal atau tugasan.'));
          break;
        case 'thanks':
          m = mk(L('You are welcome. I am here whenever you need me.', 'Sama-sama. Saya ada bila-bila masa awak perlukan.'));
          break;
        case 'who':
          m = mk(L('I am the My Life assistant. I am not a chatbot on the internet. I read your own data on this device and put the answer together using rules written for this app.', 'Saya pembantu My Life. Saya bukan chatbot di internet. Saya baca data awak sendiri dalam peranti ini dan susun jawapan menggunakan peraturan yang ditulis untuk app ini.'));
          break;
        case 'privacy':
          m = mk(L('Your data stays on this device. I work offline, nothing is sent to a server or an AI service. The real app adds a secure login and encrypted storage.', 'Data awak kekal dalam peranti ini. Saya berfungsi tanpa internet, tiada apa dihantar ke pelayan atau perkhidmatan AI. App sebenar menambah log masuk selamat dan simpanan terenkripsi.'), { label: L('Open Security', 'Buka Security'), href: 'Settings.dc.html' });
          break;
        case 'help':
          m = mk(L('You can ask me about:\n• Health: steps, distance, sleep, water, mood\n• Faith: next prayer, prayers done, Quran, zikir\n• Money: spending, income, what is left\n• Motorcycle: mileage, service, odometer\n• Tasks: open tasks, due soon, events\nI can save for you: "spent RM10 on lunch", "service motor RM120", "add mileage 18500 km", "I slept 7 hours", "add task buy milk".', 'Awak boleh tanya saya tentang:\n• Kesihatan: langkah, jarak, tidur, air, mood\n• Ibadah: solat seterusnya, solat tunai, Quran, zikir\n• Wang: belanja, pendapatan, baki\n• Motosikal: jarak, servis, odometer\n• Tugasan: tugasan, hampir tarikh, acara\nSaya boleh simpankan: "belanja RM10 untuk makan", "servis motor RM120", "tambah milage 18500 km", "saya tidur 7 jam", "tambah tugasan beli susu".'));
          break;
        default:
          m = mk(L('I have not learned that question yet. I only answer from your own data, so try something like "How many steps today?", "How did I sleep?" or "What did I spend this month?".', 'Saya belum belajar soalan itu. Saya hanya jawab berdasarkan data awak sendiri, jadi cuba seperti "Berapa step saya hari ini?", "Berapa jam saya tidur?" atau "Belanja bulan ini?".'));
      }
    }
    return { m: m, patch: patch };
  }
  scroll() { setTimeout(() => { try { this.props.onScroll && this.props.onScroll(); } catch (e) { } }, 80); }
  ask(q) {
    q = (q || '').trim();
    if (!q || this.state.typing) return;
    const lang = this.detect(q) || this.state.lang;
    this.setState({ msgs: this.state.msgs.concat([{ me: true, text: q, time: this.hm(), big: '', bigLbl: '', pct: -1, color: '', label: '', href: '' }]), draft: '', typing: true, lang: lang });
    this.scroll();
    setTimeout(() => {
      const r = this.reply(q, lang);
      this.setState(Object.assign({ msgs: this.state.msgs.concat([r.m]), typing: false }, r.patch));
      this.scroll();
    }, 700);
  }
  renderVals() {
    const s = this.state; const ms = s.lang === 'ms';
    const L = (en, bm) => (ms ? bm : en);
    const Q = {
      0: [['Summary of my day', 'Ringkasan hari ini'], ['How am I doing today?', 'Macam mana hari saya setakat ini?'], ['What should I do next?', 'Apa patut saya buat sekarang?'], ['My Life Score', 'Skor Life saya'], ['My habit streak', 'Streak habit saya']],
      1: [['How many steps today?', 'Berapa step saya hari ini?'], ['How far did I walk?', 'Berapa jauh saya jalan?'], ['How is my health now?', 'Macam mana tahap kesihatan saya sekarang?'], ['How did I sleep?', 'Berapa jam saya tidur?'], ['How much water have I had?', 'Berapa air saya minum?'], ['How is my mood?', 'Mood saya hari ini?'], ['Add a glass of water', 'Tambah segelas air']],
      2: [['When is the next prayer?', 'Bila waktu solat seterusnya?'], ['How many prayers on time?', 'Berapa solat saya tunai?'], ['Prayer times today', 'Waktu solat hari ini'], ['Continue my Quran reading', 'Sambung bacaan Quran saya'], ['Suggest a zikir', 'Cadangan zikir untuk saya'], ['Qibla direction', 'Arah kiblat']],
      3: [['What did I spend today?', 'Berapa saya belanja hari ini?'], ['What did I spend this month?', 'Belanja bulan ini?'], ['My income this month', 'Pendapatan saya bulan ini'], ['How much is left?', 'Berapa baki saya?'], ['Top spending category', 'Kategori belanja paling banyak']],
      4: [['Motorcycle mileage this month', 'Jarak motor bulan ini'], ['Compare with last month', 'Banding dengan bulan lepas'], ['What is my odometer?', 'Bacaan odometer saya?'], ['When is my next service?', 'Bila servis seterusnya?'], ['Maintenance spending', 'Belanja penyelenggaraan']],
      5: [['My open tasks', 'Tugasan saya'], ['What is due soon?', 'Apa yang hampir tarikh?'], ['Upcoming events', 'Acara akan datang'], ['Add task buy milk', 'Tambah tugasan beli susu'], ['Add task call mom', 'Tambah tugasan call mak']],
      7: [['I spent RM10 on lunch', 'Saya belanja RM10 untuk makan'], ['Paid RM50 for petrol', 'Bayar RM50 untuk minyak'], ['Service motorcycle RM120', 'Servis motor RM120'], ['Add mileage 18500 km', 'Tambah milage 18500 km'], ['Overtime received RM180', 'Overtime masuk RM180'], ['Add 2 glasses of water', 'Tambah 2 gelas air'], ['Add 1000 steps', 'Tambah 1000 langkah'], ['I slept 7 hours', 'Saya tidur 7 jam'], ['My mood is good', 'Mood saya baik'], ['I prayed Asar', 'Saya dah solat Asar'], ['Add task buy milk', 'Tambah tugasan beli susu']],
      6: [['What can I ask?', 'Apa boleh saya tanya?'], ['Is my data safe?', 'Adakah data saya selamat?'], ['Who are you?', 'Siapa awak?'], ['Hello', 'Hai']]
    };
    const catNames = [['Today', 'Hari ini'], ['Health', 'Kesihatan'], ['Faith', 'Ibadah'], ['Money', 'Wang'], ['Motor', 'Motor'], ['Tasks', 'Tugasan'], ['Help', 'Bantuan'], ['Save record', 'Simpan rekod']];
    const order = [0, 7, 1, 2, 3, 4, 5, 6];
    const ix = ms ? 1 : 0;
    const S = [
      [0, 0, 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z', 'linear-gradient(140deg,#8fe9e2,#7c9cff)'],
      [1, 0, 'M3 12h4l3-8 4 16 3-8h4', 'linear-gradient(140deg,#5ee7df,#34d399)'],
      [1, 2, 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z', 'linear-gradient(140deg,#ff8fab,#b794ff)'],
      [1, 3, 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z', 'linear-gradient(140deg,#b794ff,#7c9cff)'],
      [2, 0, 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8v4l3 2', 'linear-gradient(140deg,#34d399,#5ee7df)'],
      [3, 0, 'M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM16 13h5', 'linear-gradient(140deg,#ffc46b,#ff8f5a)'],
      [4, 0, 'M6 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 16l4-7h5l3 7', 'linear-gradient(140deg,#ff8fab,#ff8f5a)'],
      [5, 0, 'M5 12l4 4 10-10', 'linear-gradient(140deg,#7c9cff,#b794ff)'],
      [7, 0, 'M12 5v14M5 12h14', 'linear-gradient(140deg,#34d399,#5ee7df)'],
      [7, 2, 'M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-2.4 2.4-2.3-.7-.7-2.3z', 'linear-gradient(140deg,#ff8fab,#ff8f5a)']
    ];
    const msgs = s.msgs.map(m => {
      const me = m.me;
      return {
        just: me ? 'flex-end' : 'flex-start', avD: me ? 'none' : 'flex',
        cls: me ? '' : 'glass', bg: me ? 'linear-gradient(140deg,#7c9cff,#b794ff)' : '',
        rad: me ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
        bigD: m.big ? 'block' : 'none', barD: m.pct >= 0 ? 'block' : 'none',
        big: m.big, bigLbl: m.bigLbl, pct: m.pct < 0 ? 0 : m.pct, color: m.color || '#8fe9e2',
        text: m.text, time: m.time, linkD: m.href ? 'block' : 'none', href: m.href || '#', label: m.label,
        btnD: m.pid && s.pending && s.pending.id === m.pid ? 'flex' : 'none', yes: () => this.confirm(true), no: () => this.confirm(false), yesL: L('Save', 'Simpan'), noL: L('Cancel', 'Batal')
      };
    });
    return {
      sub: L('Private · offline', 'Peribadi · luar talian'),
      l1: ms ? '' : 'on', l2: ms ? 'on' : '',
      goEn: () => this.setState({ lang: 'en' }), goMs: () => this.setState({ lang: 'ms' }),
      clear: () => this.setState({ msgs: [], typing: false }),
      welcome: L('Hi ' + this.fn() + '! I am your My Life assistant. I answer from your own data, on this device, with no internet or AI service. I can also save records for you, like "I spent RM10 on lunch". Tap a question below or type your own.\nThis preview uses sample data.', 'Hai ' + this.fn() + '! Saya pembantu My Life awak. Saya jawab berdasarkan data awak sendiri, dalam peranti ini, tanpa internet atau perkhidmatan AI. Saya juga boleh simpankan rekod, contohnya "Saya belanja RM10 untuk makan". Tekan soalan di bawah atau taip sendiri.\nPratonton ini guna data contoh.'),
      startDisp: s.msgs.length === 0 ? 'grid' : 'none',
      starters: S.map(x => { const q = Q[x[0]][x[1]][ix]; return { label: q, d: x[2], bg: x[3], go: () => this.ask(q) }; }),
      msgs: msgs,
      typD: s.typing ? 'flex' : 'none',
      cats: order.map((i) => ({ name: catNames[i][ix], cls: i === s.cat ? 'cat on' : 'cat', go: () => this.setState({ cat: i }) })),
      chips: Q[s.cat].map(x => ({ label: x[ix], go: () => this.ask(x[ix]) })),
      draft: s.draft,
      ph: L('Ask or say "spent RM10 on lunch"...', 'Tanya atau cakap "belanja RM10 makan"...'),
      onDraft: (e) => this.setState({ draft: e.target.value }),
      onKey: (e) => { if (e && e.key === 'Enter') this.ask(e.target.value); },
      send: () => this.ask(this.state.draft)
    };
  }
}
