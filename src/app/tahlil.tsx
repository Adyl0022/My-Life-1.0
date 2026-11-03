import React from 'react';
import { ZikirScreen } from '../components/ZikirScreen';
import { TAHLIL, dayKey } from '../lib/islamic';
export default function Tahlil() {
  return <ZikirScreen title="Tahlil Arwah" sub="Standard order · 26 parts · Malaysian sources" parts={TAHLIL} storeKey={'tahlil_' + dayKey()} bmKey="tahlil" start={0}
    footNote="Order follows common Malaysian tahlil guides. Quran parts are shown from verified text. Dhikr, selawat and doa parts will be added only from a verified source, checked by someone knowledgeable." />;
}
