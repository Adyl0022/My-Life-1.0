import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '../components/Txt';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Glass } from '../components/Glass';
import { Blob } from '../components/Bg';
import { PlannerArt } from '../components/PlannerArt';
import { Inp, DateField, Pill, SBtn, Sheet, Toast, todayStr, W, GP } from '../components/Ui';
import { useStored } from '../lib/store';
import { TOP } from '../lib/layout';

type Ev = { id: number; name: string; date: string; remind: string; done: boolean };
type Tk = { id: number; name: string; note: string; prio: string; due: string; cat: string; status: 'todo' | 'doing' | 'done' };
type Data = { events: Ev[]; tasks: Tk[]; cats: string[]; nextId: number };
const EMPTY: Data = { events: [], tasks: [], cats: ['Tasks'], nextId: 1 };
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const Mn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const REM = ['None', 'On the day', '1 day before', '1 week before'];
const PR = ['High', 'Medium', 'Low'];
const PC: any = { High: '#ff8fab', Medium: '#ffc46b', Low: '#5ee7b5' };
const PB: any = { High: 'rgba(255,143,171,.18)', Medium: 'rgba(255,196,107,.18)', Low: 'rgba(94,231,181,.18)' };
const dueText = (d: string) => { const p = (d || '').split('-'); return p.length === 3 ? parseInt(p[2], 10) + ' ' + Mn[parseInt(p[1], 10) - 1] : ''; };
const cyc = (a: string[], v: string) => a[(a.indexOf(v) + 1) % a.length];

const Sec = ({ t, hint, right }: { t: string; hint: string; right?: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 6, marginHorizontal: 4 }}>
    <Text style={{ color: W, fontSize: 14, fontWeight: '700' }}>{t}</Text><Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 11.5, marginLeft: 6, flex: 1 }}>· {hint}</Text>{right}
  </View>
);
const Empty = ({ t }: { t: string }) => <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 12.5, marginHorizontal: 6, marginVertical: 4 }}>{t}</Text>;
const Ic = ({ t, onPress, label }: { t: string; onPress: () => void; label: string }) => <Pressable accessibilityLabel={label} onPress={onPress} hitSlop={6} style={{ width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.1)' }}><Text style={{ color: 'rgba(255,255,255,.85)', fontSize: 14 }}>{t}</Text></Pressable>;

export default function Planner() {
  const router = useRouter();
  const [d, setD, ok] = useStored<Data>('ml_planner', EMPTY);
  const [tab, setTab] = useState<'events' | 'tasks'>('events');
  const [cat, setCat] = useState(0);
  const [addingCat, setAddingCat] = useState(false); const [catIn, setCatIn] = useState('');
  const [edit, setEdit] = useState<any>(null);
  const [add, setAdd] = useState<any>(null);
  const [toast, setToast] = useState('');
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(''), 1800); };
  const today = todayStr();
  const curCat = d.cats[cat] || 'Tasks';

  const openAdd = () => { setEdit(null); setAdd(tab === 'events' ? { kind: 'event', name: '', date: today, remind: '1 day before' } : { kind: 'task', name: '', note: '', prio: 'Medium', due: '', cat: curCat }); };
  const saveAdd = () => {
    const name = (add.name || '').trim(); if (!name) return;
    if (add.kind === 'event') setD({ ...d, nextId: d.nextId + 1, events: [...d.events, { id: d.nextId, name, date: add.date, remind: add.remind, done: false }] });
    else setD({ ...d, nextId: d.nextId + 1, tasks: [...d.tasks, { id: d.nextId, name, note: (add.note || '').trim(), prio: add.prio, due: add.due || '', cat: add.cat || 'Tasks', status: 'todo' }] });
    setAdd(null); say(add.kind === 'event' ? 'Event added' : 'Task added');
  };
  const setStatus = (id: number, status: Tk['status']) => { setD({ ...d, tasks: d.tasks.map((x) => (x.id === id ? { ...x, status } : x)) }); setEdit(null); };
  const saveEdit = () => {
    const name = edit.name.trim() || 'Untitled';
    if (edit.kind === 'event') setD({ ...d, events: d.events.map((x) => (x.id === edit.id ? { ...x, name, date: edit.date, remind: edit.remind } : x)) });
    else setD({ ...d, tasks: d.tasks.map((x) => (x.id === edit.id ? { ...x, name, note: edit.note.trim(), prio: edit.prio, due: edit.date } : x)) });
    setEdit(null);
  };

  const editBox = (kind: 'event' | 'task') => (
    <View style={{ padding: 18, gap: 10, borderRadius: 26, backgroundColor: '#131845', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)' }}>
      <Text style={{ color: '#8fe9e2', fontSize: 11.5, fontWeight: '700', letterSpacing: 1 }}>{kind === 'event' ? 'EDIT EVENT' : 'EDIT TASK'}</Text>
      <Inp value={edit.name} onChangeText={(v: string) => setEdit({ ...edit, name: v })} placeholder={kind === 'event' ? 'Event name' : 'Task name'} />
      {kind === 'task' && <Inp value={edit.note} onChangeText={(v: string) => setEdit({ ...edit, note: v })} placeholder="Note (optional)" />}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <DateField value={edit.date} onChange={(v) => setEdit({ ...edit, date: v })} style={{ flex: 1 }} />
        {kind === 'event' ? <Pill t={'Reminder: ' + edit.remind} onPress={() => setEdit({ ...edit, remind: cyc(REM, edit.remind) })} /> : <Pill t={'Priority: ' + edit.prio} onPress={() => setEdit({ ...edit, prio: cyc(PR, edit.prio) })} />}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <SBtn t="Cancel" onPress={() => setEdit(null)} />
        {kind === 'task' && <SBtn t="Delete" kind="danger" onPress={() => { setD({ ...d, tasks: d.tasks.filter((y) => y.id !== edit.id) }); setEdit(null); }} />}
        <SBtn t="Save" kind="primary" onPress={saveEdit} />
      </View>
    </View>
  );

  const EventRow = ({ x }: { x: Ev }) => {
    const p = x.date.split('-'); const okd = p.length === 3;
    return (
      <Pressable onPress={() => setD({ ...d, events: d.events.map((y) => (y.id === x.id ? { ...y, done: !y.done } : y)) })}>
        <View style={{ borderRadius: 20, backgroundColor: '#262d6b', borderWidth: 1, borderColor: 'rgba(255,255,255,.14)', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: x.done ? 0.6 : 1 }}>
          <LinearGradient colors={GP} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 48, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,.85)', fontSize: 10, fontWeight: '700' }}>{okd ? MON[+p[1] - 1] : 'NEW'}</Text><Text style={{ color: W, fontSize: 18, fontWeight: '800' }}>{okd ? p[2] : '--'}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}><Text style={{ color: W, fontSize: 14, fontWeight: '700', textDecorationLine: x.done ? 'line-through' : 'none' }}>{x.name}</Text><Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 11.5, marginTop: 2 }}>{x.remind === 'None' ? 'No reminder' : 'Reminder: ' + x.remind}</Text></View>
          <Ic t="✎" label="Edit" onPress={() => setEdit({ id: x.id, kind: 'event', name: x.name, note: '', prio: 'Medium', date: x.date, remind: x.remind })} />
          <Ic t="✕" label="Delete" onPress={() => { setD({ ...d, events: d.events.filter((y) => y.id !== x.id) }); setEdit(null); }} />
        </View>
      </Pressable>
    );
  };
  const TaskRow = ({ x }: { x: Tk }) => {
    const done = x.status === 'done'; const overdue = !done && x.due && x.due < today;
    const parts: string[] = []; if (x.due) parts.push((overdue ? 'Overdue · ' : 'Due ') + dueText(x.due)); if (x.note) parts.push(x.note);
    if (!parts.length) parts.push(x.status === 'doing' ? 'In progress' : done ? 'Completed' : 'No due date');
    return (
      <Pressable onPress={() => setStatus(x.id, x.status === 'todo' ? 'doing' : 'todo')}>
        <View style={{ borderRadius: 20, backgroundColor: '#262d6b', borderWidth: 1, borderColor: 'rgba(255,255,255,.14)', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: done ? 0.6 : 1 }}>
          <Pressable accessibilityLabel="Mark done" onPress={() => setStatus(x.id, done ? 'todo' : 'done')} hitSlop={8}>
            <LinearGradient colors={done ? ['#34d399', '#5ee7df'] : x.status === 'doing' ? ['rgba(94,231,181,.22)', 'rgba(94,231,181,.22)'] : ['transparent', 'transparent']} style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: done ? 'transparent' : x.status === 'doing' ? '#5ee7b5' : 'rgba(255,255,255,.5)', alignItems: 'center', justifyContent: 'center' }}>
              {done ? <Text style={{ color: '#06241d', fontSize: 13, fontWeight: '800' }}>✓</Text> : null}
            </LinearGradient>
          </Pressable>
          <View style={{ flex: 1 }}><Text style={{ color: W, fontSize: 14, fontWeight: '700', textDecorationLine: done ? 'line-through' : 'none' }}>{x.name}</Text><Text style={{ color: overdue ? '#ffb3c0' : 'rgba(255,255,255,.72)', fontSize: 11.5, marginTop: 2 }}>{parts.join(' · ')}</Text></View>
          <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: PB[x.prio] }}><Text style={{ color: PC[x.prio], fontSize: 11, fontWeight: '700' }}>{x.prio}</Text></View>
          <Ic t="✎" label="Edit" onPress={() => setEdit({ id: x.id, kind: 'task', name: x.name, note: x.note, prio: x.prio, date: x.due, remind: 'None' })} />
        </View>
      </Pressable>
    );
  };

  const sorted = d.events.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const upcoming = sorted.filter((x) => !x.done), completed = sorted.filter((x) => x.done);
  const rank: any = { High: 0, Medium: 1, Low: 2 };
  const inCat = d.tasks.filter((x) => (x.cat || 'Tasks') === curCat);
  const byP = (a: Tk, b: Tk) => rank[a.prio] - rank[b.prio];
  const doing = inCat.filter((x) => x.status === 'doing').sort(byP), todo = inCat.filter((x) => x.status === 'todo').sort(byP), done = inCat.filter((x) => x.status === 'done');
  const total = inCat.length, pct = total ? Math.round((done.length / total) * 100) : 0;
  const saveCat = () => {
    const n = catIn.trim(); setAddingCat(false); setCatIn(''); if (!n) return;
    const ex = d.cats.findIndex((c) => c.toLowerCase() === n.toLowerCase());
    if (ex >= 0) { setTab('tasks'); setCat(ex); return; }
    setD({ ...d, cats: [...d.cats, n] }); setCat(d.cats.length); setTab('tasks'); setEdit(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f2c' }}>
      <LinearGradient colors={['#0a0f2c', '#1a1048', '#0c2b4d']} locations={[0, 0.48, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <Blob size={300} color="rgba(124,156,255,.38)" style={{ right: -100, top: -40 }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, opacity: 0.78 }}><PlannerArt /></View>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 + TOP, paddingBottom: 60 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => router.back()} accessibilityLabel="Back"><Glass radius={16} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 24, marginTop: -3 }}>‹</Text></Glass></Pressable>
            <Text style={{ flex: 1, color: W, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>Daily Planner</Text>
            <Pressable onPress={openAdd} accessibilityLabel="Add"><LinearGradient colors={GP} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 26, marginTop: -2 }}>+</Text></LinearGradient></Pressable>
          </View>
          <Glass radius={26} style={{ marginTop: 14, padding: 16 }}>
            <LinearGradient colors={['rgba(124,156,255,.3)', 'rgba(183,148,255,.18)']} pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: -1 }} />
            <Text style={{ color: W, fontSize: 17, fontWeight: '800' }}>Plan your day</Text><Text style={{ color: 'rgba(255,255,255,.78)', fontSize: 12.5, marginTop: 2 }}>Events and tasks, all planned</Text>
          </Glass>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14, marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            <Pill t="Notes" onPress={() => router.push('/notes' as any)} />
            <Pill t="Date & Events" on={tab === 'events'} onPress={() => { setTab('events'); setEdit(null); }} />
            {d.cats.map((n, i) => <Pill key={n} t={n} on={tab === 'tasks' && i === cat} onPress={() => { setTab('tasks'); setCat(i); setEdit(null); setAddingCat(false); }} />)}
            {!addingCat && <Pill t="+ New category" onPress={() => { setAddingCat(true); setCatIn(''); }} />}
          </ScrollView>
          {addingCat && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
              <Inp style={{ flex: 1 }} autoFocus value={catIn} onChangeText={setCatIn} placeholder="Category name, e.g. Work, Shopping" onSubmitEditing={saveCat} />
              <Pill t="Add" on onPress={saveCat} /><Ic t="✕" label="Cancel" onPress={() => { setAddingCat(false); setCatIn(''); }} />
            </View>
          )}

          {tab === 'events' ? (
            <View style={{ gap: 8 }}>
              <Sec t="Upcoming" hint="tap an event to mark done" />
              {upcoming.map((x) => <EventRow key={x.id} x={x} />)}
              {ok && upcoming.length === 0 && <Empty t="No upcoming events." />}
              <Sec t="Completed" hint="tap to bring back" />
              {completed.map((x) => <EventRow key={x.id} x={x} />)}
              {ok && completed.length === 0 && <Empty t="Nothing completed yet." />}
              <Pressable onPress={openAdd} style={{ marginTop: 10 }}><View style={{ paddingVertical: 13, borderRadius: 18, alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,.35)' }}><Text style={{ color: W, fontSize: 14, fontWeight: '700' }}>+ Add event</Text></View></Pressable>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              <Glass radius={24} style={{ marginTop: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ width: 56, height: 56 }}>
                  <View style={{ transform: [{ rotate: '-90deg' }] }}><Svg width={56} height={56} viewBox="0 0 56 56"><Circle cx={28} cy={28} r={22} stroke="rgba(255,255,255,.15)" strokeWidth={6} fill="none" /><Circle cx={28} cy={28} r={22} stroke="#5ee7df" strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="138.2" strokeDashoffset={138.2 - (138.2 * pct) / 100} /></Svg></View>
                  <View style={{ position: 'absolute', left: 0, top: 0, width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 13, fontWeight: '800' }}>{pct}%</Text></View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#8fe9e2', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 }}>{curCat.toUpperCase()}</Text>
                  <Text style={{ color: W, fontSize: 15, fontWeight: '800', marginTop: 2 }}>{total ? done.length + ' of ' + total + ' tasks done' : 'No tasks yet'}</Text>
                  <Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 12, marginTop: 2 }}>{total === 0 ? 'Tap + to add your first task.' : done.length === total ? 'All done. Nice work!' : doing.length + ' in progress, ' + todo.length + ' not done yet'}</Text>
                </View>
              </Glass>
              <Sec t="In Progress" hint="tap the circle to finish" />
              {doing.map((x) => <TaskRow key={x.id} x={x} />)}
              {ok && doing.length === 0 && <Empty t="Nothing in progress. Tap a task below to start it." />}
              <Sec t="Not Done Yet" hint="tap a task to start it" />
              {todo.map((x) => <TaskRow key={x.id} x={x} />)}
              {ok && todo.length === 0 && <Empty t="All caught up. Nothing waiting." />}
              <Sec t="Done" hint="tap to bring back" right={done.length ? <Pressable onPress={() => setD({ ...d, tasks: d.tasks.filter((x) => !((x.cat || 'Tasks') === curCat && x.status === 'done')) })}><Text style={{ color: '#8fe9e2', fontSize: 12, fontWeight: '700' }}>Clear</Text></Pressable> : null} />
              {done.map((x) => <TaskRow key={x.id} x={x} />)}
              {ok && done.length === 0 && <Empty t="Nothing done yet." />}
              <Pressable onPress={openAdd} style={{ marginTop: 10 }}><View style={{ paddingVertical: 13, borderRadius: 18, alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,.35)' }}><Text style={{ color: W, fontSize: 14, fontWeight: '700' }}>+ Add task</Text></View></Pressable>
              {cat > 0 && <Pressable onPress={() => { const n = curCat; setD({ ...d, cats: d.cats.filter((c) => c !== n), tasks: d.tasks.filter((x) => (x.cat || 'Tasks') !== n) }); setCat(0); say('Category deleted'); }} style={{ alignSelf: 'center', marginTop: 8 }}><Text style={{ color: '#ffb3bf', fontSize: 12.5, fontWeight: '700' }}>Delete this category</Text></Pressable>}
            </View>
          )}
        </ScrollView>

        {edit && <Sheet onClose={() => setEdit(null)}>{editBox(edit.kind)}</Sheet>}
        {add && (
          <Sheet onClose={() => setAdd(null)}>
            <View style={{ padding: 20, gap: 10, borderRadius: 26, backgroundColor: '#131845', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)' }}>
              <Text style={{ color: W, fontSize: 17, fontWeight: '800' }}>{add.kind === 'task' ? 'New task' : 'New event'}</Text>
              <Inp autoFocus value={add.name} onChangeText={(v: string) => setAdd({ ...add, name: v })} placeholder={add.kind === 'task' ? 'What needs to be done?' : 'Event name'} />
              {add.kind === 'task' ? (<>
                <Inp value={add.note} onChangeText={(v: string) => setAdd({ ...add, note: v })} placeholder="Note (optional)" />
                <View style={{ flexDirection: 'row', gap: 8 }}>{PR.map((n) => (
                  <Pressable key={n} style={{ flex: 1 }} onPress={() => setAdd({ ...add, prio: n })}><View style={{ paddingVertical: 9, borderRadius: 12, alignItems: 'center', backgroundColor: add.prio === n ? PB[n] : 'rgba(255,255,255,.06)', borderWidth: 1, borderColor: add.prio === n ? PC[n] : 'rgba(255,255,255,.2)' }}><Text style={{ color: add.prio === n ? PC[n] : W, fontSize: 12.5, fontWeight: '700' }}>{n}</Text></View></Pressable>))}</View>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Text style={{ color: 'rgba(255,255,255,.75)', fontSize: 12.5 }}>Due</Text><DateField value={add.due} onChange={(v) => setAdd({ ...add, due: v })} style={{ flex: 1 }} /></View>
              </>) : (
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><DateField value={add.date} onChange={(v) => setAdd({ ...add, date: v })} style={{ flex: 1 }} /><Pill t={'Reminder: ' + add.remind} onPress={() => setAdd({ ...add, remind: cyc(REM, add.remind) })} /></View>
              )}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4, opacity: add.name.trim() ? 1 : 0.5 }}><SBtn t="Cancel" onPress={() => setAdd(null)} /><SBtn t={add.kind === 'task' ? 'Add task' : 'Add event'} kind="primary" onPress={saveAdd} /></View>
            </View>
          </Sheet>
        )}
        <Toast t={toast} />
      </SafeAreaView>
    </View>
  );
}
