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
  const [msg, setMsg] = useState(''); const [fixed, setFixed] = useState(false); const [fb, setFb] = useState(''); const [fe, setFe] = useState(false);
  const now = new Date(); const ym = ymOf(now); const today = now.getDate();
  const lastD = new Date(now.getFullYear(), now.getMonth() - 1, 1); const lastYm = ymOf(lastD); const LM = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][lastD.getMonth()];
  const list = d.debts || [];
  const act = list.filter((x) => isActive(x, ym));
  const done = list.filter((x) => !isActive(x, ym));
  const debtsOnly = list.filter((x) => !x.fixed);
  const food = d.food || 0;
  const commit = act.reduce((a, x) => a + amountDue(x, ym), 0);
  const paid = act.reduce((a, x) => a + ((x.paid || {})[ym] || 0), 0);
  const toPay = commit - paid;
  const totalLeft = debtsOnly.reduce((a, x) => a + remaining(x), 0);
  const worst = debtsOnly.filter((x) => remaining(x) > 0).reduce((a, x) => Math.max(a, monthsLeft(x)), 0);
  const allPaidNow = act.length > 0 && act.every((x) => (x.paid || {})[ym] > 0 || remaining(x) <= 0);
  const after = income - commit - food;
  const free = income - commit - food;
  const save = (nd: DebtData) => setD(nd);
  const reset = () => { setFixed(false); setAdding(false); setEdit(0); setN(''); setBal(''); setMo(''); setDay(''); };
  const startEdit = (x: Debt) => { setEdit(x.id); setAdding(true); setN(x.name); setFixed(!!x.fixed); setBal(x.fixed ? '' : String(remaining(x) + (x.paid[ym] || 0))); setMo(String(x.monthly)); setDay(String(x.due)); };
  const submit = () => {
    const b = parseFloat(bal.replace(',', '.')), m = parseFloat(mo.replace(',', '.')), dd = Math.round(parseFloat(day));
    if (!n.trim() || (!fixed && !(b > 0)) || !(m > 0) || !(dd >= 1 && dd <= 31)) { setMsg(fixed ? 'Fill in the name, the monthly amount and a due day from 1 to 31.' : 'Fill in the name, balance, monthly payment and a due day from 1 to 31.'); return; }
    setMsg('');
    if (edit) {
      save({ ...d, debts: list.map((x) => (x.id === edit ? { ...x, name: n.trim(), monthly: m, due: dd, fixed, bal: fixed ? 0 : b + Object.keys(x.paid).filter((k) => k !== ym).reduce((a, k) => a + x.paid[k], 0) } : x)) });
    } else {
      save({ ...d, nextId: d.nextId + 1, debts: [...list, { id: d.nextId, name: n.trim(), monthly: m, due: dd, since: ym, paid: {}, remind: true, fixed, bal: fixed ? 0 : b }] });
    }
    reset();
  };
  const missed = (x: Debt) => x.since <= lastYm && !((x.paid || {})[lastYm] > 0) && (x.fixed || remaining(x) > 0);
  const tickLast = (x: Debt) => save({ ...d, debts: list.map((y) => (y.id === x.id ? { ...y, paid: { ...(y.paid || {}), [lastYm]: y.fixed ? y.monthly : Math.min(y.monthly, remaining(y)) } } : y)) });
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
          <Text style={{ color: W, fontSize: 24, fontWeight: '800', marginTop: 3 }}>RM {money(commit + food)}</Text>
          {food > 0 ? <Text style={{ color: dim, fontSize: 11.5, marginTop: 1 }}>{'Includes RM ' + money(food) + ' set aside for food'}</Text> : null}
        </View>
        <Pressable onPress={() => { if (adding) reset(); else setAdding(true); }}><LinearGradient colors={WARM} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 }}><Text style={{ color: '#2a1030', fontSize: 12, fontWeight: '800' }}>{adding ? 'Close' : '+ Add'}</Text></LinearGradient></Pressable>
      </View>

      {list.length > 0 ? (
        <>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Stat l="Bills paid" v={'RM ' + money(paid)} c="#7df0c6" />
            <Stat l="Bills left to pay" v={'RM ' + money(toPay)} c={toPay > 0 ? '#ffd593' : '#7df0c6'} />
          </View>
          <View style={{ height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.14)', overflow: 'hidden', marginTop: 10 }}>
            <View style={{ width: (commit > 0 ? Math.round((paid / commit) * 100) : 0) + '%', height: '100%', borderRadius: 4, backgroundColor: '#7df0c6' }} />
          </View>
          {allPaidNow ? <Text style={{ color: '#7df0c6', fontSize: 12, fontWeight: '700', marginTop: 8 }}>All commitments settled for this month.</Text> : null}
          {income > 0 ? <Text style={{ color: dim, fontSize: 12, marginTop: 8 }}>{after >= 0 ? 'Income left after commitments: RM ' + money(after) : 'Commitments are RM ' + money(-after) + ' more than this month\'s income.'}</Text> : null}
          {debtsOnly.length > 0 ? <View style={{ marginTop: 10, borderRadius: 16, padding: 12, backgroundColor: 'rgba(0,0,0,.22)' }}>
            <Text style={{ color: dim, fontSize: 11 }}>Total debt remaining</Text>
            <Text style={{ color: W, fontSize: 20, fontWeight: '800', marginTop: 1 }}>RM {money(totalLeft)}</Text>
            <Text style={{ color: '#ffd593', fontSize: 12.5, fontWeight: '700', marginTop: 3 }}>{worst > 0 ? 'Debt-free in ' + yearsMonths(worst) + ' (' + payoffLabel(worst, allPaidNow || act.every((x) => (x.paid || {})[ym] > 0 || remaining(x) <= 0)) + ')' : 'You are debt-free. Well done.'}</Text>
          </View> : null}
        </>
      ) : !adding ? (
        <Text style={{ color: dim, fontSize: 12, lineHeight: 18, marginTop: 8 }}>Add what you pay every month: a motor loan, Shopee PayLater, ASB, phone bill or money for your parents. Tick them off each month and see how long until your debts are cleared.</Text>
      ) : null}

      {adding ? (
        <View style={{ marginTop: 12, gap: 8 }}>
          <Text style={{ color: W, fontSize: 13, fontWeight: '700' }}>{edit ? 'Edit' : fixed ? 'New commitment' : 'New debt'}</Text>
          <View style={{ flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: 'rgba(0,0,0,.28)' }}>
            {[[false, 'Debt with a balance'], [true, 'Fixed monthly']].map(([v, t]) => (
              <Pressable key={String(v)} onPress={() => setFixed(v as boolean)} style={{ flex: 1, paddingVertical: 7, borderRadius: 999, alignItems: 'center', backgroundColor: fixed === v ? '#ffc46b' : 'transparent' }}><Text style={{ color: fixed === v ? '#2a1030' : W, fontSize: 12.5, fontWeight: '800' }}>{t}</Text></Pressable>
            ))}
          </View>
          <Text style={{ color: dim, fontSize: 11.5 }}>{fixed ? 'For payments with no end date, like a phone bill, savings or money for your parents.' : 'For a loan or instalment that ends once the balance reaches zero.'}</Text>
          {!edit ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {([['Motor loan', false], ['Shopee PayLater', false], ['ASB', true], ['Phone bill', true], ['Parents', true]] as [string, boolean][]).map(([t, f]) => (
                <Pressable key={t} onPress={() => { setN(t); setFixed(f); }} style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,.2)', backgroundColor: 'rgba(255,255,255,.08)' }}><Text style={{ color: W, fontSize: 11.5, fontWeight: '700' }}>{t}</Text></Pressable>
              ))}
            </View>
          ) : null}
          <Inp value={n} onChangeText={setN} placeholder="Name, for example Shopee PayLater" />
          {!fixed ? <Inp keyboardType="decimal-pad" value={bal} onChangeText={setBal} placeholder="Balance left to pay (RM)" /> : null}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Inp style={{ flex: 1 }} keyboardType="decimal-pad" value={mo} onChangeText={setMo} placeholder="Monthly (RM)" />
            <Inp style={{ flex: 1 }} keyboardType="number-pad" value={day} onChangeText={setDay} placeholder="Due day (1 to 31)" onSubmitEditing={submit} />
          </View>
          <Pressable onPress={submit}><LinearGradient colors={WARM} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#2a1030', fontSize: 13, fontWeight: '800' }}>{edit ? 'Save changes' : fixed ? 'Add commitment' : 'Add debt'}</Text></LinearGradient></Pressable>
        </View>
      ) : null}
      {msg ? <Text style={{ color: '#ffb3a0', fontSize: 12, marginTop: 8 }}>{msg}</Text> : null}

      {act.length > 0 ? (
        <View style={{ marginTop: 10 }}>
          {act.map((x, i) => {
            const pd = (x.paid || {})[ym] > 0; const dday = dueDay(x, now.getFullYear(), now.getMonth()); const late = !pd && today > dday; const diff = dday - today;
            const status = pd ? 'Paid this month' : late ? 'Overdue by ' + (today - dday) + (today - dday === 1 ? ' day' : ' days') : diff === 0 ? 'Due today' : diff === 1 ? 'Due tomorrow' : 'Due on the ' + ord(dday);
            return (
              <View key={x.id} style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.1)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11 }}>
                <Pressable accessibilityLabel={pd ? 'Mark as unpaid' : 'Mark as paid'} onPress={() => tick(x)} style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: pd ? '#34d399' : 'rgba(255,255,255,.4)', backgroundColor: pd ? '#34d399' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {pd ? <Text style={{ color: '#062b1c', fontSize: 16, fontWeight: '900', marginTop: -1 }}>✓</Text> : null}
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: W, fontSize: 14, fontWeight: '700', textDecorationLine: pd ? 'line-through' : 'none', opacity: pd ? 0.7 : 1 }} numberOfLines={1}>{x.name}</Text>
                  <Text style={{ color: late ? '#ffb3a0' : pd ? '#7df0c6' : dim, fontSize: 11.5, marginTop: 1, fontWeight: late ? '700' : '400' }}>{status + ' · RM ' + money(amountDue(x, ym))}</Text>
                  <Text style={{ color: dim, fontSize: 11.5 }}>{x.fixed ? 'Fixed monthly' : 'Left RM ' + money(remaining(x)) + (remaining(x) > 0 ? ' · ' + yearsMonths(monthsLeft(x)) : ' · cleared')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Pressable accessibilityLabel="Reminder" onPress={() => save({ ...d, debts: list.map((y) => (y.id === x.id ? { ...y, remind: !y.remind } : y)) })} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: x.remind ? 'rgba(255,196,107,.28)' : 'rgba(255,255,255,.1)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 14, opacity: x.remind ? 1 : 0.4 }}>🔔</Text></Pressable>
                    <Pressable accessibilityLabel="Edit" onPress={() => startEdit(x)} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,.1)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#ffd593', fontSize: 14 }}>✎</Text></Pressable>
                    <Pressable accessibilityLabel="Delete" onPress={() => save({ ...d, debts: list.filter((y) => y.id !== x.id) })} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,.1)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#ff9aa9', fontSize: 13 }}>✕</Text></Pressable>
                  </View>
                </View>
              </View>
              {missed(x) ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -2, marginBottom: 10, marginLeft: 41, paddingVertical: 7, paddingHorizontal: 11, borderRadius: 12, backgroundColor: 'rgba(255,196,107,.14)' }}>
                  <Text style={{ flex: 1, color: '#ffd593', fontSize: 11.5 }}>{LM + ' was not ticked'}</Text>
                  <Pressable hitSlop={8} onPress={() => tickLast(x)}><Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Mark paid</Text></Pressable>
                </View>
              ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {done.length > 0 ? (
        <Text style={{ color: dim, fontSize: 11.5, marginTop: 6 }}>{done.length + (done.length === 1 ? ' debt' : ' debts') + ' cleared: ' + done.map((x) => x.name).join(', ')}</Text>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.1)' }}>
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,196,107,.28)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 14 }}>🍚</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: W, fontSize: 14, fontWeight: '700' }}>Food</Text>
          <Text style={{ color: dim, fontSize: 11.5, marginTop: 1 }}>{food > 0 ? 'RM ' + money(food) + ' set aside every month' : 'Set aside a fixed amount for food each month'}</Text>
        </View>
        <Pressable onPress={() => { setFe(!fe); setFb(food > 0 ? String(food) : ''); }} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.12)' }}><Text style={{ color: '#ffd593', fontSize: 12, fontWeight: '800' }}>{fe ? 'Close' : food > 0 ? 'Edit' : 'Set'}</Text></Pressable>
      </View>
      {fe ? (
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <Inp style={{ flex: 1 }} keyboardType="decimal-pad" value={fb} onChangeText={setFb} placeholder="Food each month (RM)" />
          <Pressable onPress={() => { const v = parseFloat(fb.replace(',', '.')); save({ ...d, food: v > 0 ? v : 0 }); setFe(false); }}><LinearGradient colors={WARM} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 42, paddingHorizontal: 18, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#2a1030', fontSize: 12, fontWeight: '800' }}>Save</Text></LinearGradient></Pressable>
        </View>
      ) : null}

      {income > 0 && (commit > 0 || food > 0) ? (
        <View style={{ marginTop: 12, borderRadius: 16, padding: 12, backgroundColor: 'rgba(0,0,0,.22)' }}>
          <Text style={{ color: '#ffd593', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 }}>THIS MONTH'S PLAN</Text>
          {[['Income', income, 1] as [string, number, number]].concat(act.map((x) => [x.name, amountDue(x, ym), -1] as [string, number, number])).concat([['Food', food, -1] as [string, number, number]]).map(([l, v, sg]) => (
            (v as number) > 0 ? <View key={(l as string) + sg} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}><Text style={{ color: dim, fontSize: 12.5 }}>{l as string}</Text><Text style={{ color: W, fontSize: 12.5, fontWeight: '700' }}>{(sg as number) < 0 ? '- ' : ''}RM {money(v as number)}</Text></View> : null
          ))}
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,.12)', marginTop: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}><Text style={{ color: W, fontSize: 13, fontWeight: '800' }}>{free >= 0 ? 'Free to spend or save' : 'Short by'}</Text><Text style={{ color: free >= 0 ? '#7df0c6' : '#ffb3a0', fontSize: 14, fontWeight: '800' }}>RM {money(Math.abs(free))}</Text></View>
        </View>
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
