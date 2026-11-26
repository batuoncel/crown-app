import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { C, F, display, money } from '../theme';
import { Card, Icon, T } from '../ui';
import { Model } from '../data';
import { LIVE_MARKET, Market, fetchMarket } from '../market';
import { useStore } from '../store';

const STALE_MS = 6 * 60 * 60 * 1000; // refresh automatically after 6 hours
const needsFetch = (d?: Market) => !d || (LIVE_MARKET && d.source === 'sample') || Date.now() - new Date(d.checkedAt).getTime() > STALE_MS;

// fetch eBay prices in the background for watches shown in a list (collection, scan result)
const inflight = new Set<string>();
export function useAutoMarket(models: Model[]) {
  const { market, setMarket } = useStore();
  const key = models.map(m => m.id).join(',');
  useEffect(() => {
    if (!LIVE_MARKET) return;
    for (const m of models) {
      if (inflight.has(m.id) || !needsFetch(market[m.id])) continue;
      inflight.add(m.id);
      fetchMarket(m).then(r => setMarket(m.id, r)).catch(() => {}).finally(() => inflight.delete(m.id));
    }
  }, [key]);
}

const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};

// "What is it worth right now?": live eBay asking prices, compared with what the owner paid.
export function MarketCard({ m, paid }: { m: Model; paid?: number }) {
  const { market, setMarket } = useStore();
  const data: Market | undefined = market[m.id];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    setBusy(true);
    setError('');
    try {
      setMarket(m.id, await fetchMarket(m));
    } catch {
      setError('Could not reach eBay. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (needsFetch(data) && !inflight.has(m.id)) refresh();
  }, [m.id]);

  const enough = data && data.median && data.count >= 3;
  const gain = enough && paid ? data!.median! - paid : 0;
  const gainPct = enough && paid ? (gain / paid) * 100 : 0;

  return (
    <Card style={{ padding: 18, marginTop: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={T.label}>ON EBAY NOW</Text>
        <Pressable onPress={() => { Haptics.selectionAsync(); refresh(); }} hitSlop={10} disabled={busy} accessibilityRole="button" accessibilityLabel="Refresh eBay prices">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {busy ? <ActivityIndicator size="small" color={C.green} /> : <Icon name="refresh" size={15} color={C.green} w={2} />}
            <Text style={{ fontFamily: F.bold, fontSize: 13, color: C.green }}>{data ? ago(data.checkedAt) : 'Check'}</Text>
          </View>
        </Pressable>
      </View>

      {!data ? (
        <Text style={[T.small, { marginTop: 10 }]}>{busy ? 'Checking eBay listings…' : error || 'Tap Check to see live eBay prices.'}</Text>
      ) : !enough ? (
        <Text style={[T.small, { marginTop: 10 }]}>Not enough matching listings on eBay right now to give a fair price.</Text>
      ) : (
        <>
          <Text style={[T.small, { marginTop: 10 }]}>Typical asking price</Text>
          <Text style={{ fontFamily: F.serif, ...display(34), lineHeight: 40, color: C.ink }}>{money(data.median!)}</Text>
          <Text style={T.small}>Most listings {money(data.p25!)} – {money(data.p75!)} · {data.count} listings</Text>
          {paid ? (
            <View style={{ marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: gain >= 0 ? C.upSoft : C.downSoft }}>
              <Text style={{ fontFamily: F.bold, fontSize: 15, color: gain >= 0 ? C.up : C.down }}>
                {gain >= 0 ? '+' : '−'}{money(Math.abs(gain))} ({gain >= 0 ? '+' : '−'}{Math.abs(gainPct).toFixed(1)}%) against what you paid
              </Text>
              <Text style={[T.small, { fontSize: 12 }]}>You paid {money(paid)}. Before fees and shipping.</Text>
            </View>
          ) : (
            <Text style={[T.small, { marginTop: 10 }]}>Add what you paid below to see your gain or loss against today's market.</Text>
          )}
        </>
      )}

      {data && data.listings.length ? (
        <View style={{ marginTop: 14 }}>
          <Text style={[T.b, { fontSize: 14 }]}>Similar listings</Text>
          {data.listings.slice(0, 5).map(l => (
            <Pressable key={l.id} onPress={() => Linking.openURL(l.url)} accessibilityRole="link" accessibilityLabel={`${l.title}, ${money(l.price)}`}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line, marginTop: 8 }}>
                {l.image ? <Image source={{ uri: l.image }} style={{ width: 46, height: 46, borderRadius: 8, backgroundColor: C.line }} /> : (
                  <View style={{ width: 46, height: 46, borderRadius: 8, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' }}><Icon name="watch" size={20} color={C.stone} /></View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.medium, fontSize: 13.5, color: C.ink }} numberOfLines={2}>{l.title}</Text>
                  <Text style={[T.small, { fontSize: 11.5 }]}>{l.condition}</Text>
                </View>
                <Text style={{ fontFamily: F.bold, fontSize: 14, color: C.ink }}>{money(l.price)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Text style={[T.small, { fontSize: 11.5, marginTop: 12 }]}>
        {data?.source === 'sample'
          ? 'Sample listings. Live eBay prices appear once Crown is connected to eBay.'
          : 'Asking prices on eBay, not sale prices. Replicas, straps, boxes and parts are filtered out. Crown may earn a commission if you buy through these links.'}
      </Text>
    </Card>
  );
}
