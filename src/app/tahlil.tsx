import React from 'react';
import { ZikirScreen } from '../components/ZikirScreen';
import { TAHLIL, dayKey } from '../lib/islamic';
export default function Tahlil() {
  return <ZikirScreen title="Tahlil Arwah" sub="Standard order · 26 parts · Malaysian sources" parts={TAHLIL} storeKey={'tahlil_' + dayKey()} bmKey="tahlil" start={0}
    footNote="Order follows common Malaysian tahlil guides. Quran parts come from the full Quran text. Dhikr, selawat and doa parts are a DRAFT compiled from standard hadith adhkar and common Malaysian guides, with rumi and Malay/English meanings added. They have NOT yet been checked by a qualified person, so please have them reviewed before relying on them." />;
}
