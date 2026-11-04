import React, { useRef, useState } from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { Text } from '../components/Txt';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Glass } from '../components/Glass';
import { Blob } from '../components/Bg';
import { Inp, SBtn, Sheet, Toast, W, GP } from '../components/Ui';
import { useStored } from '../lib/store';
import { TOP } from '../lib/layout';

type Note = { id: number; t: string; s: string; c: number; pin: boolean; u: number; r: string };
type Data = { notes: Note[]; seq: number };
const COL = ['#7c9cff', '#5ee7df', '#ffc46b', '#ff8fb1', '#a78bfa', '#9be37a'];
const REM = ['', 'Tomorrow 9:00', 'Next week'];
const FILTERS = ['All', 'Pinned', 'Checklist', 'Reminder', 'Recent'];
const SORTS = ['Newest', 'Oldest', 'A–Z'];
const days = (u: number) => Math.floor((Date.now() - u) / 86400000);
const when = (u: number) => { const d = days(u); return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : d + ' days ago'; };
const isChk = (n: Note) => /[☐☑]/.test(n.s);

export default function Notes() {
  const router = useRouter();
  const [data, setData, ok] = useStored<Data>('ml_notes', { notes: [], seq: 1 });
  const [filter, setFilter] = useState(0); const [sort, setSort] = useState(0); const [grid, setGrid] = useState(true); const [q, setQ] = useState('');
  const [editId, setEditId] = useState(0); const [draft, setDraft] = useState<Note | null>(null); const [isNew, setIsNew] = useState(false);
  const [menuId, setMenuId] = useState(0); const [confirmDel, setConfirmDel] = useState(false);
  const [toast, setToast] = useState('');
  const lp = useRef(false);
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(''), 1600); };
  const notes = data.notes;

  const qq = q.trim().toLowerCase();
  const FIL = [() => true, (n: Note) => n.pin, isChk, (n: Note) => !!n.r, (n: Note) => days(n.u) <= 2];
  const list = notes.filter((n) => FIL[filter](n) && (!qq || (n.t + ' ' + n.s).toLowerCase().includes(qq)));
  const key = (a: Note, b: Note) => (sort === 1 ? a.u - b.u : sort === 2 ? (a.t || '').localeCompare(b.t || '') : b.u - a.u);
  const sorted = [...list.filter((n) => n.pin).sort(key), ...list.filter((n) => !n.pin).sort(key)];
  const menuNote = notes.find((n) => n.id === menuId);

  const openNew = () => { const id = data.seq; setDraft({ id, t: '', s: '', c: 0, pin: false, u: Date.now(), r: '' }); setIsNew(true); setEditId(id); setFilter(0); setQ(''); };
  const openEdit = (n: Note) => { setDraft({ ...n }); setIsNew(false); setEditId(n.id); };
  const closeEd = () => { setEditId(0); setDraft(null); setConfirmDel(false); };
  const upd = (p: Partial<Note>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const save = () => {
    if (!draft) return;
    if (!(draft.t.trim() || draft.s.trim())) return say('Add a title or some text first');
    const nn = { ...draft, u: Date.now() };
    setData(isNew ? { notes: [nn, ...notes], seq: data.seq + 1 } : { ...data, notes: notes.map((x) => (x.id === nn.id ? nn : x)) });
    closeEd(); say('Note saved');
  };
  const del = (id: number) => { setData({ ...data, notes: notes.filter((x) => x.id !== id) }); };
  const addLine = (pre: string) => draft && upd({ s: (draft.s && !/\n$/.test(draft.s) ? draft.s + '\n' : draft.s) + pre });
  const words = draft ? (draft.t + ' ' + draft.s).trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f2c' }}>
      <LinearGradient colors={['#0a0f2c', '#1a1048', '#0c2b4d']} locations={[0, 0.48, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      <Blob size={320} color="rgba(255,196,107,.35)" style={{ right: -100, top: -40 }} />
      <Blob size={340} color="rgba(124,156,255,.35)" style={{ left: -120, bottom: 40 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16 + TOP, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()} accessibilityLabel="Back"><Glass radius={16} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 24, marginTop: -3 }}>‹</Text></Glass></Pressable>
          <View style={{ flex: 1 }}><Text style={{ color: W, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>Notes</Text><Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>{sorted.length === notes.length ? notes.length + (notes.length === 1 ? ' note' : ' notes') : sorted.length + ' of ' + notes.length + ' notes'}</Text></View>
          <Pressable onPress={openNew} accessibilityLabel="New note"><LinearGradient colors={['#ffc46b', '#ff8f5a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 26, marginTop: -2 }}>+</Text></LinearGradient></Pressable>
        </View>
        <View style={{ paddingHorizontal: 20, marginTop: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Glass radius={16} style={{ flex: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: 'rgba(255,255,255,.6)' }}>⌕</Text>
            <TextInput value={q} onChangeText={setQ} placeholder="Search title or text" placeholderTextColor="rgba(255,255,255,.45)" style={{ flex: 1, color: W, fontSize: 14, paddingVertical: 11, outlineStyle: 'none' } as any} />
          </Glass>
          <Pressable onPress={() => setSort((sort + 1) % 3)}><Glass radius={16} style={{ paddingHorizontal: 12, height: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 12.5, fontWeight: '700' }}>{SORTS[sort]}</Text></Glass></Pressable>
          <Pressable onPress={() => setGrid(!grid)} accessibilityLabel="Layout"><Glass radius={16} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 16 }}>{grid ? '☰' : '▦'}</Text></Glass></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginTop: 12 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {FILTERS.map((n, i) => (
            <Pressable key={n} onPress={() => setFilter(i)}><View style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: filter === i ? 'rgba(255,196,107,.3)' : 'rgba(255,255,255,.1)' }}><Text style={{ color: filter === i ? W : 'rgba(255,255,255,.85)', fontSize: 12.5, fontWeight: filter === i ? '800' : '600' }}>{n}</Text></View></Pressable>
          ))}
        </ScrollView>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {sorted.map((n) => {
              const tot = (n.s.match(/[☐☑]/g) || []).length, dn = (n.s.match(/☑/g) || []).length;
              return (
                <Pressable key={n.id} style={{ width: grid ? '47.8%' : '100%' }} delayLongPress={450}
                  onPress={() => openEdit(n)} onLongPress={() => setMenuId(n.id)}>
                  <Glass radius={22} style={{ padding: 14, minHeight: 110 }}>
                    <View style={{ width: 28, height: 4, borderRadius: 2, backgroundColor: COL[n.c], marginBottom: 8 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}><Text numberOfLines={1} style={{ flex: 1, color: W, fontSize: 14.5, fontWeight: '800' }}>{n.t.trim() || 'Untitled'}</Text>{n.pin ? <Text style={{ color: '#ffd593', fontSize: 10, fontWeight: '800' }}>PIN</Text> : null}</View>
                    <Text numberOfLines={grid ? 4 : 3} style={{ color: 'rgba(255,255,255,.75)', fontSize: 12.5, lineHeight: 18, marginTop: 4 }}>{n.s.trim() || 'No additional text'}</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      <Text style={{ color: 'rgba(255,255,255,.55)', fontSize: 10.5 }}>{when(n.u)}</Text>
                      {tot ? <Text style={{ color: '#8fe9e2', fontSize: 10.5 }}>✓ {dn}/{tot}</Text> : null}
                      {n.r ? <Text style={{ color: '#ffd593', fontSize: 10.5 }}>● {n.r}</Text> : null}
                    </View>
                  </Glass>
                </Pressable>
              );
            })}
          </View>
          {ok && sorted.length === 0 && <Text style={{ color: 'rgba(255,255,255,.65)', textAlign: 'center', marginTop: 40, fontSize: 13.5 }}>{notes.length ? 'No notes found' : 'No notes yet. Tap + to write your first one.'}</Text>}
          {notes.length > 0 && <Text style={{ color: 'rgba(255,255,255,.5)', fontSize: 11.5, textAlign: 'center', marginTop: 20 }}>Long-press a note for options</Text>}
        </ScrollView>

        {menuNote && (
          <Sheet onClose={() => setMenuId(0)}>
            <Glass radius={24} style={{ padding: 16, gap: 8 }}>
              <Text style={{ color: W, fontSize: 15, fontWeight: '800', marginBottom: 4 }} numberOfLines={1}>{menuNote.t || 'Untitled'}</Text>
              <SBtn t={menuNote.pin ? 'Unpin' : 'Pin to top'} onPress={() => { setData({ ...data, notes: notes.map((x) => (x.id === menuNote.id ? { ...x, pin: !x.pin } : x)) }); setMenuId(0); say(menuNote.pin ? 'Unpinned' : 'Pinned to top'); }} />
              <SBtn t="Delete" kind="danger" onPress={() => { del(menuNote.id); setMenuId(0); say('Note deleted'); }} />
            </Glass>
          </Sheet>
        )}

        {draft && (
          <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
            <LinearGradient colors={['#0a0f2c', '#1a1048', '#0c2b4d']} locations={[0, 0.48, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
            <View style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 6, backgroundColor: COL[draft.c] }} />
            <SafeAreaView style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 12 }}>
                <Pressable onPress={() => { closeEd(); }}><Glass radius={16} style={{ paddingHorizontal: 14, height: 44, justifyContent: 'center' }}><Text style={{ color: W, fontSize: 13.5, fontWeight: '700' }}>‹ Notes</Text></Glass></Pressable>
                <View style={{ flex: 1 }} />
                <Pressable onPress={() => upd({ pin: !draft.pin })} accessibilityLabel="Pin"><Glass radius={16} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: draft.pin ? '#ffd593' : W, fontSize: 12, fontWeight: '800' }}>PIN</Text></Glass></Pressable>
                {!isNew && <Pressable onPress={() => setConfirmDel(true)} accessibilityLabel="Delete"><Glass radius={16} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#ffb3bf', fontSize: 16 }}>✕</Text></Glass></Pressable>}
                <Pressable onPress={save}><LinearGradient colors={['#34d399', '#5ee7df']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 18, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#06241d', fontSize: 14, fontWeight: '800' }}>Save</Text></LinearGradient></Pressable>
              </View>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 20 }}>
                <TextInput value={draft.t} onChangeText={(v) => upd({ t: v })} placeholder="Title" placeholderTextColor="rgba(255,255,255,.4)" style={{ color: W, fontSize: 26, fontWeight: '800', outlineStyle: 'none' } as any} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COL[draft.c] }} />
                  <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 12 }}>{words} {words === 1 ? 'word' : 'words'}</Text>
                  {draft.r ? <Text style={{ color: '#ffd593', fontSize: 12 }}>● Reminder: {draft.r}</Text> : null}
                </View>
                <TextInput multiline value={draft.s} onChangeText={(v) => upd({ s: v })} placeholder="Start writing..." placeholderTextColor="rgba(255,255,255,.4)" style={{ color: W, fontSize: 16, lineHeight: 24, marginTop: 14, minHeight: 280, textAlignVertical: 'top', outlineStyle: 'none' } as any} />
              </ScrollView>
              <Glass radius={22} style={{ marginHorizontal: 16, marginBottom: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {[['☐', 'Add checklist item', () => addLine('☐ ')], ['•', 'Add bullet', () => addLine('• ')]].map(([t, l, f]: any) => (
                  <Pressable key={l} accessibilityLabel={l} onPress={f} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.12)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 18 }}>{t}</Text></Pressable>
                ))}
                <Pressable accessibilityLabel="Reminder" onPress={() => { const r = REM[(REM.indexOf(draft.r) + 1) % REM.length]; upd({ r }); say(r ? 'Reminder: ' + r : 'Reminder off'); }} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: draft.r ? 'rgba(255,213,147,.28)' : 'rgba(255,255,255,.12)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: W, fontSize: 16 }}>⏰</Text></Pressable>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                  {COL.map((c, i) => <Pressable key={c} accessibilityLabel="Colour" onPress={() => upd({ c: i })} style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c, borderWidth: draft.c === i ? 2 : 1, borderColor: draft.c === i ? '#fff' : 'rgba(255,255,255,.25)' }} />)}
                </View>
              </Glass>
              {confirmDel && (
                <Sheet onClose={() => setConfirmDel(false)}>
                  <Glass radius={26} style={{ padding: 20 }}>
                    <Text style={{ color: W, fontSize: 17, fontWeight: '800' }}>Delete this note?</Text>
                    <Text style={{ color: 'rgba(255,255,255,.72)', fontSize: 13, marginTop: 4 }}>This can't be undone.</Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}><SBtn t="Cancel" onPress={() => setConfirmDel(false)} /><SBtn t="Delete" kind="danger" onPress={() => { del(draft.id); closeEd(); say('Note deleted'); }} /></View>
                  </Glass>
                </Sheet>
              )}
              <Toast t={toast} />
            </SafeAreaView>
          </View>
        )}
        {!draft && <Toast t={toast} />}
      </SafeAreaView>
    </View>
  );
}
