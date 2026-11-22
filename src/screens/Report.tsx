import React, { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { C, F, display, money } from '../theme';
import { BottomCTA, Button, Card, Icon, Pill, RoundButton, T, WatchThumb } from '../ui';
import { byId } from '../data';
import { locale, t } from '../i18n';
import { exportReport, reportTotals } from '../report';
import { useStore } from '../store';

export function Report() {
  const { go, collection, answers, pro, ownerName, setOwnerName, openWatch } = useStore();
  const [owner, setOwner] = useState(ownerName ?? '');
  const [includePaid, setIncludePaid] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const opts = { collection, papers: answers.papers, owner: owner.trim(), includePaid, includePhotos };
  const tot = reportTotals(opts);
  const missingSerial = collection.filter(o => !o.serial);

  const create = async () => {
    if (!pro) { go('paywall'); return; }
    if (owner.trim() !== (ownerName ?? '')) setOwnerName(owner.trim());
    setBusy(true);
    setNote('');
    try {
      const r = await exportReport(opts);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (r === 'printed') setNote(t('Choose "Save as PDF" in the print window.'));
      if (r === 'blocked') setNote(t('Your browser blocked the new window. Allow pop-ups and try again.'));
    } catch {
      setNote(t('Could not create the PDF. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line }}>
      <Text style={[T.body, { flex: 1 }]}>{label}</Text>
      <Switch value={value} onValueChange={v => { Haptics.selectionAsync(); onChange(v); }} trackColor={{ true: C.green, false: C.line }} thumbColor="#FFFFFF" />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 44 }}>
        <RoundButton icon="back" onPress={() => go('home')} label={t('Back')} />
        <Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>{t('Insurance report')}</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={[T.h2, { marginTop: 12 }]}>{t('Your collection on paper.')}</Text>
        <Text style={T.sub}>{t('A PDF with every watch, its photo, serial number and value today. For your insurer, or for the police if a watch is ever stolen.')}</Text>

        <Card style={{ padding: 16, marginTop: 18, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={T.label}>{t('Collection value').toLocaleUpperCase(locale())}</Text>
            <Text style={{ fontFamily: F.serif, ...display(28), color: C.ink }}>{money(Math.round(tot.mid / 50) * 50)}</Text>
          </View>
          <Pill text={t('{n} watches', { n: tot.count })} bg={C.greenSoft} fg={C.green} />
        </Card>

        <Card style={{ padding: 16, marginTop: 12 }}>
          <Text style={T.label}>{t('Owner name (optional)').toLocaleUpperCase(locale())}</Text>
          <TextInput value={owner} onChangeText={setOwner} placeholder={t('Name on the report')} placeholderTextColor={C.stone} autoCorrect={false}
            style={{ marginTop: 8, height: 44, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, paddingHorizontal: 12, fontFamily: F.medium, fontSize: 15, color: C.ink }} />
          <View style={{ marginTop: 12 }}>
            <Toggle label={t('Include purchase prices')} value={includePaid} onChange={setIncludePaid} />
            <Toggle label={t('Include photos')} value={includePhotos} onChange={setIncludePhotos} />
          </View>
        </Card>

        {missingSerial.length ? (
          <Card style={{ padding: 16, marginTop: 12, borderColor: C.brass }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Icon name="info" size={18} color={C.brassInk} />
              <Text style={[T.b, { fontSize: 15, flex: 1 }]}>{t('Add serial numbers')}</Text>
            </View>
            <Text style={[T.small, { marginTop: 6 }]}>{t('Insurers and the police identify a watch by its serial number. {n} of your watches have none yet.', { n: missingSerial.length })}</Text>
            {missingSerial.slice(0, 4).map(o => {
              const m = byId(o.modelId);
              return (
                <Pressable key={o.modelId} onPress={() => openWatch(o.modelId)} accessibilityRole="button">
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.line, marginTop: 8 }}>
                    <WatchThumb photo={o.photo} brand={m.brand} size={34} radius={9} />
                    <Text style={[T.body, { flex: 1 }]} numberOfLines={1}>{m.brand} {m.name}</Text>
                    <Text style={{ fontFamily: F.bold, fontSize: 13, color: C.green }}>{t('Add')}</Text>
                  </View>
                </Pressable>
              );
            })}
          </Card>
        ) : null}

        <Text style={[T.small, { fontSize: 11.5, marginTop: 14 }]}>{t('Values are estimates from listed market prices and are not a certified appraisal. Your insurer may ask for an appraisal by an accredited watch expert. Prices in this version of Crown are demo data.')}</Text>
      </ScrollView>
      <BottomCTA note={note || (pro ? t('The PDF is created on your phone. Nothing is uploaded.') : t('Insurance reports are part of Crown Pro.'))}>
        <Button title={pro ? t('Create PDF') : t('Unlock with Pro')} icon={pro ? 'share' : 'lock'} disabled={busy || !collection.length} onPress={create} />
      </BottomCTA>
    </View>
  );
}
