import React from 'react';
import { Text, View } from 'react-native';
import { C, F, display, money } from '../theme';
import { Card, Pill, T } from '../ui';
import { Model, Signal, marketSignal } from '../data';
import { t } from '../i18n';

export function trendPill(s: Signal) {
  const pct = `${s.ch3 >= 0 ? '+' : '−'}${Math.abs(s.ch3).toFixed(1)}%`;
  if (s.trend === 'rising') return <Pill text={`▲ ${t('Rising')} · ${pct}`} bg={C.upSoft} fg={C.up} />;
  if (s.trend === 'falling') return <Pill text={`▼ ${t('Falling')} · ${pct}`} bg={C.downSoft} fg={C.down} />;
  return <Pill text={`${t('Steady')} · ${pct}`} bg={C.paper} fg={C.stone} />;
}

const sellCopy = (s: Signal) => {
  if (s.sell === 'good') return {
    title: t('Good time to sell'), color: C.up,
    why: s.trend === 'falling' ? t('The price is near its 12-month high, but starting to ease.') : t('The price is near its 12-month high.'),
  };
  if (s.sell === 'wait') return { title: t('Not the best time to sell'), color: C.down, why: t('The price is near its 12-month low. Waiting may get you more.') };
  return {
    title: t('No rush either way'), color: C.ink,
    why: s.trend === 'rising' ? t('The price is in the middle of its 12-month range and climbing.') : t('The price is in the middle of its 12-month range.'),
  };
};

const buyCopy = (s: Signal) => {
  if (s.buy === 'good') return { title: t('Good time to buy'), color: C.up, why: t('Near its 12-month low.') };
  if (s.buy === 'wait') return { title: t('Pricey right now'), color: C.down, why: t('Near its 12-month high. Waiting may save you money.') };
  return { title: t('Fair moment to buy'), color: C.ink, why: t('In the middle of its 12-month range.') };
};

// Card on the watch page: should I sell now? `factor` applies this watch's papers/condition.
export function SellSignalCard({ m, factor = 1 }: { m: Model; factor?: number }) {
  const s = marketSignal(m, factor);
  const c = sellCopy(s);
  return (
    <Card style={{ padding: 18, marginTop: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={T.label}>{t('MARKET SIGNAL')}</Text>
        {trendPill(s)}
      </View>
      <Text style={{ fontFamily: F.serif, ...display(26), lineHeight: 32, color: c.color, marginTop: 10 }}>{c.title}</Text>
      <Text style={[T.small, { marginTop: 2 }]}>{c.why}</Text>
      <RangeBar s={s} />
      <Text style={[T.small, { fontSize: 11.5, marginTop: 10 }]}>{t('Based on 12 months of listed prices. A signal, not a guarantee.')}</Text>
    </Card>
  );
}

// 12-month low–high bar with today's price marked
function RangeBar({ s }: { s: Signal }) {
  return (
    <View style={{ marginTop: 14 }}>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: C.line, overflow: 'visible' }}>
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%', borderTopLeftRadius: 4, borderBottomLeftRadius: 4, backgroundColor: C.downSoft }} />
        <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%', borderTopRightRadius: 4, borderBottomRightRadius: 4, backgroundColor: C.upSoft }} />
        <View style={{ position: 'absolute', top: -5, left: `${Math.round(s.pos * 100)}%`, marginLeft: -9, width: 18, height: 18, borderRadius: 9, backgroundColor: C.ink, borderWidth: 3, borderColor: C.surface }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <View>
          <Text style={[T.small, { fontSize: 11 }]}>{t('12-month low')}</Text>
          <Text style={{ fontFamily: F.bold, fontSize: 13, color: C.ink }}>{money(s.low)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[T.small, { fontSize: 11 }]}>{t('12-month high')}</Text>
          <Text style={{ fontFamily: F.bold, fontSize: 13, color: C.ink }}>{money(s.high)}</Text>
        </View>
      </View>
    </View>
  );
}

// One line for wishlist cards: is it a good moment to buy?
export function BuySignalLine({ m, factor = 1 }: { m: Model; factor?: number }) {
  const s = marketSignal(m, factor);
  const c = buyCopy(s);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.color === C.ink ? C.stone : c.color }} />
      <Text style={{ fontFamily: F.bold, fontSize: 13.5, color: c.color }}>{c.title}</Text>
      <Text style={[T.small, { flex: 1, minWidth: 140 }]}>{c.why}</Text>
    </View>
  );
}
