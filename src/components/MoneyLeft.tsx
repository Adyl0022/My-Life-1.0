import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './Txt';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Glass } from './Glass';
import { W } from './Ui';
import { useStored } from '../lib/store';
import { DEBT_EMPTY, DebtData, isActive, amountDue } from '../lib/debts';

const money = (n: number) => n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rnd = (n: number) => Math.round(n).toLocaleString('en-MY');
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const GOALS = [0, 10, 20, 30];
const COL = { commit: '#b794ff', spent: '#ffc46b', save: '#7c9cff', left: '#5ee7b5', over: '#ff7a8a' };

type Sp = { id: number; name: string; cat: string; amt: number; date: string };
type Props = { ym: string; income: number; spends: Sp[]; goal: number; setGoal: (g: number) => void };

const Row = ({ c, l, v, minus, bold }: { c?: string; l: string; v: string; minus?: boolean; bold?: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 }}>
    {c ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c }} /> : <View style={{ width: 10 }} />}
    <Text style={{ flex: 1, color: bold ? W : 'rgba(255,255,255,.82)', fontSize: 13.5, fontWeight: bold ? '800' : '600' }}>{l}</Text>
    <Text style={{ color: W, fontSize: 14, fontWeight: bold ? '800' : '700' }}>{(minus ? '- ' : '') + 'RM ' + v}</Text>
  </View>
);
const Tile = ({ l, v, sub, c }: { l: string; v: string; sub?: string; c?: string }) => (
  <View style={{ flex: 1, borderRadius: 16, paddingVertical: 9, paddingHorizontal: 10, backgroundColor: 'rgba(255,255,255,.09)' }}>
    <Text style={{ color: 'rgba(255,255,255,.68)', fontSize: 10.5 }}>{l}</Text>
    <Text style={{ color: c || W, fontSize: 15, fontWeight: '800', marginTop: 2 }}>{v}</Text>
    {sub ? <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 10, marginTop: 1 }}>{sub}</Text> : null}
  </View>
);

export function MoneyLeft({ ym, income, spends, goal, setGoal }: Props) {
  const [debts] = useStored<DebtData>('ml_debts', DEBT_EMPTY);
  const now = new Date();
  const curKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const isCur = ym === curKey;
  const y = parseInt(ym.slice(0, 4), 10), m = parseInt(ym.slice(5, 7), 10) - 1;
  const dim = new Date(y, m + 1, 0).getDate();
  const dayNo = isCur ? now.getDate() : dim;
  const daysLeft = isCur ? dim - dayNo + 1 : 0;

  const list = debts.debts || [];
  const commit = list.filter((x) => isActive(x, ym)).reduce((a, x) => a + amountDue(x, ym), 0);
  const inM = spends.filter((p) => (p.date || '').slice(0, 7) === ym);
  const spent = inM.reduce((a, p) => a + p.amt, 0);
  const today = isCur ? inM.filter((p) => p.date === curKey + '-' + String(now.getDate()).padStart(2, '0')).reduce((a, p) => a + p.amt, 0) : 0;
  const save = Math.round(income * goal) / 100;
  const left = income - commit - spent - save;
  const over = left < 0;
  const used = income > 0 ? Math.min(1.5, (commit + spent + save) / income) : 0;

  const avg = dayNo > 0 ? spent / dayNo : 0;
  const projSpent = isCur ? spent + avg * (daysLeft - 1) : spent;
  const projLeft = income - commit - save - projSpent;
  const perDay = isCur && daysLeft > 0 ? Math.max(0, left) / daysLeft : 0;
  const runOutIn = avg > 0 && left > 0 ? Math.floor(left / avg) : -1;
  const runOutDay = runOutIn >= 0 && isCur ? dayNo + runOutIn : 0;

  const state = income <= 0 ? 'none' : over ? 'over' : (isCur && projLeft < 0) || used >= 0.85 ? 'care' : 'ok';
  const sc = state === 'over' ? COL.over : state === 'care' ? COL.spent : COL.left;
  const sl = state === 'over' ? 'Over budget' : state === 'care' ? 'Be careful' : 'On track';
  const title = 'Money Left · ' + MON[m] + ' ' + y;

  const R = 46, C = 2 * Math.PI * R;
  const pct = income > 0 ? Math.min(100, Math.round(((commit + spent + save) / income) * 100)) : 0;
  const seg = (v: number) => (income > 0 ? Math.max(0, Math.min(1, v / income)) : 0);
  const bar = [{ v: commit, c: COL.commit }, { v: spent, c: COL.spent }, { v: save, c: COL.save }, { v: Math.max(0, left), c: COL.left }];

  let tip = '';
  if (state === 'none') tip = 'Add this month\'s income above and I will show how much is left after your commitments and spending.';
  else if (state === 'over') tip = 'You have gone RM ' + rnd(-left) + ' past what you earned this month. Hold off on non-essential spending' + (goal > 0 ? ', or lower your savings target.' : '.');
  else if (!isCur) tip = left > 0 ? 'You finished this month with RM ' + rnd(left) + ' left. Well done.' : 'This month ended exactly on budget.';
  else if (spent === 0) tip = 'No spending recorded yet. You can spend about RM ' + rnd(perDay) + ' a day and stay on track.';
  else if (projLeft < 0) tip = 'At your current pace of RM ' + rnd(avg) + ' a day, your money runs out around the ' + Math.min(dim, runOutDay) + 'th. Try to keep to RM ' + rnd(perDay) + ' a day.';
  else tip = 'At your current pace you would finish the month with about RM ' + rnd(projLeft) + ' left. Keep to RM ' + rnd(perDay) + ' a day or less.';

  return (
    <Glass radius={26} style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
      <LinearGradient colors={[state === 'over' ? 'rgba(255,122,138,.28)' : 'rgba(94,231,181,.2)', 'rgba(124,156,255,.12)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: -1 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ flexShrink: 1, color: 'rgba(255,255,255,.8)', fontSize: 13, fontWeight: '700' }}>{title}</Text>
        {state !== 'none' ? <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: sc }}><Text style={{ color: '#2a1030', fontSize: 11, fontWeight: '800' }}>{sl}</Text></View> : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 }}>
        <View style={{ width: 112, height: 112, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={112} height={112} viewBox="0 0 112 112">
            <Circle cx="56" cy="56" r={R} stroke="rgba(255,255,255,.14)" strokeWidth="11" fill="none" />
            {income > 0 ? <Circle cx="56" cy="56" r={R} stroke={sc} strokeWidth="11" fill="none" strokeLinecap="round" strokeDasharray={C + ' ' + C} strokeDashoffset={C * (1 - Math.min(1, used))} rotation={-90} origin="56, 56" /> : null}
          </Svg>
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            <Text style={{ color: W, fontSize: 22, fontWeight: '800' }}>{income > 0 ? pct + '%' : '-'}</Text>
            <Text style={{ color: 'rgba(255,255,255,.65)', fontSize: 10.5 }}>used</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>{over ? 'Over by' : 'Left to spend'}</Text>
          <Text style={{ color: income <= 0 ? 'rgba(255,255,255,.5)' : over ? COL.over : W, fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 1 }} numberOfLines={1} adjustsFontSizeToFit>RM {money(income <= 0 ? 0 : Math.abs(left))}</Text>
          <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 11.5, marginTop: 2 }}>{income > 0 ? 'from RM ' + money(income) + ' income' : 'No income saved yet'}</Text>
        </View>
      </View>

      {income > 0 ? (
        <>
          <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginTop: 14, backgroundColor: 'rgba(255,255,255,.1)' }}>
            {bar.map((b, i) => (b.v > 0 ? <View key={i} style={{ width: seg(b.v) * 100 + '%', backgroundColor: b.c }} /> : null))}
          </View>
          <View style={{ marginTop: 8 }}>
            <Row c="#fff" l="Income" v={money(income)} />
            <Row c={COL.commit} l="Commitments and debts" v={money(commit)} minus />
            <Row c={COL.spent} l="Spent" v={money(spent)} minus />
            {goal > 0 ? <Row c={COL.save} l={'Saved aside (' + goal + '%)'} v={money(save)} minus /> : null}
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,.16)', marginVertical: 4 }} />
            <Row c={over ? COL.over : COL.left} l={over ? 'Over budget' : 'Left'} v={money(Math.abs(left))} bold />
          </View>

          {isCur ? (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <Tile l="Per day" v={'RM ' + rnd(perDay)} sub={daysLeft + (daysLeft === 1 ? ' day left' : ' days left')} c={perDay > 0 ? W : COL.over} />
              <Tile l="Today" v={'RM ' + rnd(today)} sub={perDay > 0 ? (today <= perDay ? 'within limit' : 'over limit') : ''} c={perDay > 0 && today > perDay ? COL.over : W} />
              {!over ? <Tile l="Month end" v={(projLeft < 0 ? '-' : '') + 'RM ' + rnd(Math.abs(projLeft))} sub="at this pace" c={projLeft < 0 ? COL.over : COL.left} /> : null}
            </View>
          ) : null}
        </>
      ) : null}

      <Text style={{ color: 'rgba(255,255,255,.78)', fontSize: 12.5, lineHeight: 18, marginTop: 10 }}>{tip}</Text>

      {income > 0 ? (
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: 'rgba(255,255,255,.68)', fontSize: 11.5, marginBottom: 6 }}>Keep part of your income aside as savings</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {GOALS.map((g) => (
              <Pressable key={g} onPress={() => setGoal(g)} style={{ flex: 1, paddingVertical: 7, borderRadius: 999, alignItems: 'center', borderWidth: 1, borderColor: goal === g ? 'transparent' : 'rgba(255,255,255,.2)', backgroundColor: goal === g ? COL.save : 'rgba(255,255,255,.08)' }}>
                <Text style={{ color: goal === g ? '#10163a' : W, fontSize: 12, fontWeight: '800' }}>{g === 0 ? 'None' : g + '%'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </Glass>
  );
}
