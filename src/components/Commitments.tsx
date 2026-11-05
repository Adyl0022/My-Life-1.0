import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './Txt';
import { LinearGradient } from 'expo-linear-gradient';
import { Glass } from './Glass';
import { Inp, W } from './Ui';
import { useStored } from '../lib/store';
import { DEBT_EMPTY, DebtData, Debt, remaining, monthsLeft, dueDay, isActive, amountDue, yearsMonths, payoffLabel, ymOf, syncDebtAlerts } from '../lib/debts';

const WARM = ['#ffc46b', '#ff8fab'] as [string, string];
const money = (n: number) => n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ord = (n: number) => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
const dim = 'rgba(255,255,255,.65)';
const Stat = ({ l, v, c }: { l: string; v: string; c?: string }) => (
  <View style={{ flex: 1, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(255,255,255,.08)' }}>
    <Text style={{ color: 'rgba(255,255,255,.68)', fontSize: 10.5 }}>{l}</Text><Text style={{ color: c || W, fontSize: 14, fontWeight: '800', marginTop: 2 }}>{v}</Text>
  </View>
);
const Sw = ({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) => (
  <Pressable accessibilityLabel={label} onPress={() => set(!on)} style={{ width: 44, height: 26, borderRadius: 13, padding: 3, backgroundColor: on ? '#ffc46b' : 'rgba(255,255,255,.2)', alignItems: on ? 'flex-end' : 'flex-start' }}>
    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: on ? '#2a1030' : '#fff' }} />
  </Pressable>
);

export function Commitments({ income }: { income: number }) {
  const [d, setD] = useStored<DebtData>('ml_debts', DEBT_EMPTY);
  const [adding, setAdding] = useState(false); const [edit, setEdit] = useState(0);
  const [n, setN] = useState(''); const [bal, setBal] = useState(''); const [mo, setMo] = useState(''); const [day, setDay] = useState('');
  const [msg, setMsg] = useState('');
  const now = new Date(); const ym = ymOf(now); const today = now.getDate();
  const list = d.debts || [];
  const act = list.filter((x) => isActive(x, ym));
  const done = list.filter((x) => !isActive(x, ym));
  const commit = act.reduce((a, x) => a + amountDue(x, ym), 0);
  const paid = act.reduce((a, x) => a + ((x.paid || {})[ym] || 0), 0);
  const toPay = commit - paid;
  const totalLeft = list.reduce((a, x) => a + remaining(x), 0);
  const worst = list.filter((x) => remaining(x) > 0).reduce((a, x) => Math.max(a, monthsLeft(x)), 0);
  const allPaidNow = act.length > 0 && act.every((x) => (x.paid || {})[ym] > 0 || remaining(x) <= 0);
  const after = income - commit;
  const save = (nd: DebtData) => setD(nd);
  const reset = () => { setAdding(false); setEdit(0); setN(''); setBal(''); setMo(''); setDay(''); };
  const startEdit = (x: Debt) => { setEdit(x.id); setAdding(true); setN(x.name); setBal(String(remaining(x) + (x.paid[ym] || 0))); setMo(String(x.monthly)); setDay(String(x.due)); };
  const submit = () => {
    const b = parseFloat(bal.replace(',', '.')), m = parseFloat(mo.replace(',', '.')), dd = Math.round(parseFloat(day));
    if (!n.trim() || !(b > 0) || !(m > 0) || !(dd >= 1 && dd <= 31)) { setMsg('Fill in the name, balance, monthly payment and a due day from 1 to 31.'); return; }
    setMsg('');
    if (edit) {
      save({ ...d, debts: list.map((x) => (x.id === edit ? { ...x, name: n.trim(), monthly: m, due: dd, bal: b + Object.keys(x.paid).filter((k) => k !== ym).reduce((a, k) => a + x.paid[k], 0) } : x)) });
    } else {
      save({ ...d, nextId: d.nextId + 1, debts: [...list, { id: d.nextId, name: n.trim(), bal: b, monthly: m, due: dd, since: ym, paid: {}, remind: true }] });
    }
    reset();
  };
  const tick = (x: Debt) => {
    const paidNow = (x.paid || {})[ym] > 0; const p = { ...(x.paid || {}) };
    if (paidNow) delete p[ym]; else p[ym] = Math.min(x.monthly, remaining(x));
    save({ ...d, debts: list.map((y) => (y.id === x.id ? { ...y, paid: p } : y)) });
  };
  const setNotify = async (v: boolean) => { const nd = { ...d, notify: v }; save(nd); if (v) { const ok = await syncDebtAlerts(nd); setMsg(ok ? '' : 'Notifications are blocked. Allow them in your phone settings to get reminders.'); } };

  return (
    <Glass radius={26} style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
      <LinearGradient colors={['rgba(255,143,171,.3)', 'rgba(255,196,107,.16)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: -1 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#ffd593', fontSize: 11, fontWeight: '700', letterSpacing: 1.4 }}>MONTHLY COMMITMENTS</Text>
          <Text style={{ color: W, fontSize: 24, fontWeight: '800', marginTop: 3 }}>RM {money(commit)}</Text>
        </View>
        <Pressable onPress={() => { if (adding) reset(); else setAdding(true); }}><LinearGradient colors={WARM} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 }}><Text style={{ color: '#2a1030', fontSize: 12, fontWeight: '800' }}>{adding ? 'Close' : '+ Add debt'}</Text></LinearGradient></Pressable>
      </View>

      {list.length > 0 ? (
        <>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Stat l="Paid this month" v={'RM ' + money(paid)} c="#7df0c6" />
            <Stat l="Still to pay" v={'RM ' + money(toPay)} c={toPay > 0 ? '#ffd593' : '#7df0c6'} />
          </View>
          <View style={{ height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.14)', overflow: 'hidden', marginTop: 10 }}>
            <View style={{ width: (commit > 0 ? Math.round((paid / commit) * 100) : 0) + '%', height: '100%', borderRadius: 4, backgroundColor: '#7df0c6' }} />
          </View>
          {allPaidNow ? <Text style={{ color: '#7df0c6', fontSize: 12, fontWeight: '700', marginTop: 8 }}>All commitments settled for this month.</Text> : null}
          {income > 0 ? <Text style={{ color: dim, fontSize: 12, marginTop: 8 }}>{after >= 0 ? 'Income left after commitments: RM ' + money(after) : 'Commitments are RM ' + money(-after) + ' more than this month\'s income.'}</Text> : null}
          <View style={{ marginTop: 10, borderRadius: 16, padding: 12, backgroundColor: 'rgba(0,0,0,.22)' }}>
            <Text style={{ color: dim, fontSize: 11 }}>Total debt remaining</Text>
            <Text style={{ color: W, fontSize: 20, fontWeight: '800', marginTop: 1 }}>RM {money(totalLeft)}</Text>
            <Text style={{ color: '#ffd593', fontSize: 12.5, fontWeight: '700', marginTop: 3 }}>{worst > 0 ? 'Debt-free in ' + yearsMonths(worst) + ' (' + payoffLabel(worst, allPaidNow || act.every((x) => (x.paid || {})[ym] > 0 || remaining(x) <= 0)) + ')' : 'You are debt-free. Well done.'}</Text>
          </View>
        </>
      ) : !adding ? (
        <Text style={{ color: dim, fontSize: 12, lineHeight: 18, marginTop: 8 }}>Add your debts, such as Shopee PayLater, a loan or a car instalment. Tick them off each month and see how long until you are debt-free.</Text>
      ) : null}

      {adding ? (
        <View style={{ marginTop: 12, gap: 8 }}>
          <Text style={{ color: W, fontSize: 13, fontWeight: '700' }}>{edit ? 'Edit debt' : 'New debt'}</Text>
          <Inp value={n} onChangeText={setN} placeholder="Name, for example Shopee PayLater" />
          <Inp keyboardType="decimal-pad" value={bal} onChangeText={setBal} placeholder="Balance left to pay (RM)" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Inp style={{ flex: 1 }} keyboardType="decimal-pad" value={mo} onChangeText={setMo} placeholder="Monthly (RM)" />
            <Inp style={{ flex: 1 }} keyboardType="number-pad" value={day} onChangeText={setDay} placeholder="Due day (1 to 31)" onSubmitEditing={submit} />
          </View>
          <Pressable onPress={submit}><LinearGradient colors={WARM} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#2a1030', fontSize: 13, fontWeight: '800' }}>{edit ? 'Save changes' : 'Add debt'}</Text></LinearGradient></Pressable>
        </View>
      ) : null}
      {msg ? <Text style={{ color: '#ffb3a0', fontSize: 12, marginTop: 8 }}>{msg}</Text> : null}

      {act.length > 0 ? (
        <View style={{ marginTop: 10 }}>
          {act.map((x, i) => {
            const pd = (x.paid || {})[ym] > 0; const dday = dueDay(x, now.getFullYear(), now.getMonth()); const late = !pd && today > dday; const diff = dday - today;
            const status = pd ? 'Paid this month' : late ? 'Overdue by ' + (today - dday) + (today - dday === 1 ? ' day' : ' days') : diff === 0 ? 'Due today' : diff === 1 ? 'Due tomorrow' : 'Due on the ' + ord(dday);
            return (
              <View key={x.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.1)' }}>
                <Pressable accessibilityLabel={pd ? 'Mark as unpaid' : 'Mark as paid'} onPress={() => tick(x)} style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: pd ? '#34d399' : 'rgba(255,255,255,.4)', backgroundColor: pd ? '#34d399' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {pd ? <Text style={{ color: '#062b1c', fontSize: 16, fontWeight: '900', marginTop: -1 }}>✓</Text> : null}
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: W, fontSize: 14, fontWeight: '700', textDecorationLine: pd ? 'line-through' : 'none', opacity: pd ? 0.7 : 1 }} numberOfLines={1}>{x.name}</Text>
                  <Text style={{ color: late ? '#ffb3a0' : pd ? '#7df0c6' : dim, fontSize: 11.5, marginTop: 1, fontWeight: late ? '700' : '400' }}>{status + ' · RM ' + money(amountDue(x, ym))}</Text>
                  <Text style={{ color: dim, fontSize: 11.5 }}>{'Left RM ' + money(remaining(x)) + (remaining(x) > 0 ? ' · ' + yearsMonths(monthsLeft(x)) : ' · cleared')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Pressable accessibilityLabel="Reminder" onPress={() => save({ ...d, debts: list.map((y) => (y.id === x.id ? { ...y, remind: !y.remind } : y)) })} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: x.remind ? 'rgba(255,196,107,.28)' : 'rgba(255,255,255,.1)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 14, opacity: x.remind ? 1 : 0.4 }}>🔔</Text></Pressable>
                    <Pressable accessibilityLabel="Edit" onPress={() => startEdit(x)} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,.1)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#ffd593', fontSize: 14 }}>✎</Text></Pressable>
                    <Pressable accessibilityLabel="Delete" onPress={() => save({ ...d, debts: list.filter((y) => y.id !== x.id) })} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,.1)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#ff9aa9', fontSize: 13 }}>✕</Text></Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {done.length > 0 ? (
        <Text style={{ color: dim, fontSize: 11.5, marginTop: 6 }}>{done.length + (done.length === 1 ? ' debt' : ' debts') + ' cleared: ' + done.map((x) => x.name).join(', ')}</Text>
      ) : null}

      {list.length > 0 ? (
        <View style={{ marginTop: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.1)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ color: W, fontSize: 13, fontWeight: '700' }}>Due date reminders</Text>
              <Text style={{ color: dim, fontSize: 11.5, marginTop: 1 }}>A notification at 9 am before each payment is due.</Text>
            </View>
            <Sw on={d.notify} set={setNotify} label="Reminders" />
          </View>
          {d.notify ? (
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
              {[[0, 'On the day'], [1, '1 day before'], [3, '3 days before']].map(([v, t]) => (
                <Pressable key={String(v)} onPress={() => save({ ...d, ahead: v as number })} style={{ paddingVertical: 6, paddingHorizontal: 11, borderRadius: 999, borderWidth: 1, borderColor: d.ahead === v ? 'transparent' : 'rgba(255,255,255,.2)', backgroundColor: d.ahead === v ? '#ffc46b' : 'rgba(255,255,255,.08)' }}>
                  <Text style={{ color: d.ahead === v ? '#2a1030' : W, fontSize: 12, fontWeight: '700' }}>{t}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </Glass>
  );
}
