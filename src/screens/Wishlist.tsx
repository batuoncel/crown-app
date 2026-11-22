import React, { useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { C, F, currency as cur, display, fromUsd, money, pct, toUsd } from '../theme';
import { Button, Card, Enter, Icon, Pill, RoundButton, T, WatchThumb } from '../ui';
import { byId, change12 } from '../data';
import { Wish, useStore } from '../store';
import { wishPrice } from './Home';
import { t } from '../i18n';

function WishCard({ w }: { w: Wish }) {
  const { setWishTarget, removeWish } = useStore();
  const m = byId(w.modelId);
  const now = wishPrice(m.id);
  const ch = change12(m);
  const saved = w.target ? String(Math.round(fromUsd(w.target))) : '';
  const [text, setText] = useState(saved);
  const hit = !!w.target && now <= w.target;
  const gap = w.target ? ((now - w.target) / w.target) * 100 : 0;
  const save = () => {
    Keyboard.dismiss();
    const n = parseInt(text, 10);
    if (!text) { setWishTarget(m.id, undefined); return; }
    if (!n) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setWishTarget(m.id, toUsd(n));
  };
  return (
    <Card style={{ marginTop: 12, padding: 16, borderColor: hit ? C.up : C.line, borderWidth: hit ? 2 : 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <WatchThumb brand={m.brand} size={48} radius={12} />
        <View style={{ flex: 1 }}>
          <Text style={[T.b, { fontSize: 15 }]} numberOfLines={1}>{m.brand} {m.name}</Text>
          <Text style={T.small}>{m.ref}</Text>
        </View>
        <Pressable onPress={() => { Haptics.selectionAsync(); removeWish(m.id); }} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('Remove {name} from wishlist', { name: m.name })}>
          <Icon name="close" size={18} color={C.stone} />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14 }}>
        <View>
          <Text style={T.label}>{t("MARKET PRICE")}</Text>
          <Text style={{ fontFamily: F.serif, ...display(26), color: C.ink }}>{money(now)}</Text>
        </View>
        <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: ch >= 0 ? C.up : C.down, marginBottom: 6 }}>{pct(ch)}{t(" · 12M")}</Text>
      </View>
      <Text style={[T.label, { marginTop: 14 }]}>{t("ALERT ME AT")}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, paddingHorizontal: 12 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.stone, marginRight: 6 }}>{cur().symbol.trim()}</Text>
          <TextInput value={text} onChangeText={t => setText(t.replace(/[^0-9]/g, '').slice(0, 10))} onSubmitEditing={save} keyboardType="number-pad" returnKeyType="done"
            placeholder={String(Math.round(fromUsd(now * 0.92)))} placeholderTextColor={C.stone} accessibilityLabel={t("Target price")}
            style={{ flex: 1, fontFamily: F.bold, fontSize: 16, color: C.ink }} />
        </View>
        {text !== saved ? <Button title={t("Save")} onPress={save} style={{ height: 44, paddingHorizontal: 18 }} /> : null}
      </View>
      {w.target ? (
        <View style={{ marginTop: 10 }}>
          {hit
            ? <Pill text={t("At your price. Time to look.")} bg={C.upSoft} fg={C.up} icon="check" />
            : <Text style={T.small}>{t('{n}% above your price. We will tell you when it gets there.', { n: gap.toFixed(1) })}</Text>}
        </View>
      ) : (
        <Text style={[T.small, { marginTop: 10 }]}>{t("Set the price you want to pay and we will alert you.")}</Text>
      )}
    </Card>
  );
}

export function Wishlist() {
  const { go, wishes, setSearchFor } = useStore();
  const add = () => { setSearchFor('wish'); go('search'); };
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 44 }}>
        <RoundButton icon="back" onPress={() => go('home')} label={t("Back")} />
        <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>{t("Wishlist")}</Text>
        <RoundButton icon="plus" onPress={add} label={t("Add to wishlist")} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 28 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={[T.h2, { marginTop: 12 }]}>{t("Your next watch.")}</Text>
        <Text style={T.sub}>{t("Set the price you want to pay. When the market gets there, it shows up in Alerts.")}</Text>
        {wishes.length === 0 ? (
          <Enter style={{ alignItems: 'center', marginTop: 40 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.downSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="heart" size={34} color={C.down} /></View>
            <Text style={[T.b, { marginTop: 14 }]}>{t("Nothing saved yet")}</Text>
            <Button title={t("Find a watch")} icon="search" onPress={add} style={{ marginTop: 18, paddingHorizontal: 28 }} />
          </Enter>
        ) : (
          wishes.map(w => <Enter key={w.modelId}><WishCard w={w} /></Enter>)
        )}
        {wishes.length ? <Text style={[T.small, { textAlign: 'center', marginTop: 18, fontSize: 12 }]}>{t("Market price is the median for a watch with some box and papers. Demo data.")}</Text> : null}
      </ScrollView>
    </View>
  );
}
