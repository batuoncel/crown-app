import React, { useEffect, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C, F, display, money } from '../theme';
import { Card, Enter, Icon, Pill, T } from '../ui';
import { AWARDS, Award, AwardCtx, progress, unlocked } from '../awards';
import { useStore } from '../store';
import { TabBar } from './Home';
import { t } from '../i18n';

const GROUPS: { key: Award['group']; sub: string }[] = [
  { key: 'Scanning', sub: 'Every scan counts, even ones you do not keep.' },
  { key: 'Collection', sub: 'Grows with the watches you add.' },
  { key: 'Value', sub: 'Milestones for what your collection is worth.' },
  { key: 'Market sense', sub: 'For collectors who know their numbers.' },
];
const fmtGoal = (a: Award, v: number) => (a.group === 'Value' && a.goal > 1 ? `${money(v)} / ${money(a.goal)}` : `${v} / ${a.goal}`);

function Medal({ a, on, size = 64 }: { a: Award; on: boolean; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill={on ? C.brassSoft : C.paper} stroke={on ? C.brass : C.line} strokeWidth={3} />
        <Circle cx={size / 2} cy={size / 2} r={size / 2 - 8} fill="none" stroke={on ? C.brass : C.line} strokeWidth={1} strokeDasharray={on ? undefined : '3 4'} opacity={0.8} />
      </Svg>
      <View style={{ position: 'absolute' }}><Icon name={on ? a.icon : 'lock'} size={size * 0.36} color={on ? C.brassInk : C.stone} w={on ? 2 : 1.8} /></View>
    </View>
  );
}

export function Awards() {
  const { collection, answers, scanCount, shared, seenAwards, markAwardsSeen, readGuides, bestStreak, wishes } = useStore();
  const ctx: AwardCtx = { scans: scanCount, collection, papers: answers.papers, shared, read: readGuides.length, streak: bestStreak, wishes: wishes.length };
  const done = unlocked(ctx);
  // remember which ones are new on this visit, then mark them seen
  const fresh = useRef(done.filter(id => !seenAwards.includes(id))).current;
  useEffect(() => { markAwardsSeen(done); }, []);

  const next = AWARDS.filter(a => !done.includes(a.id)).sort((x, y) => progress(y, ctx) / y.goal - progress(x, ctx) / x.goal)[0];
  const share = done.length / AWARDS.length;
  const R = 30, CIRC = 2 * Math.PI * R;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 24, height: 44, justifyContent: 'center' }}><Text style={{ fontFamily: F.bold, fontSize: 16, color: C.ink }}>{t("Awards")}</Text></View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <Card style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 }}>
          <View style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={72} height={72} style={{ position: 'absolute' }}>
              <Circle cx={36} cy={36} r={R} stroke={C.line} strokeWidth={7} fill="none" />
              <Circle cx={36} cy={36} r={R} stroke={C.brass} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={`${CIRC}`} strokeDashoffset={CIRC * (1 - share)} rotation={-90} origin="36, 36" />
            </Svg>
            <Text style={{ position: 'absolute', fontFamily: F.bold, fontSize: 17, color: C.ink }}>{done.length}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.serif, ...display(24), lineHeight: 28, color: C.ink }}>{t('{a} of {b} unlocked', { a: done.length, b: AWARDS.length })}</Text>
            {next ? (
              <Text style={[T.small, { marginTop: 4 }]}>{t('Next:')} <Text style={{ fontFamily: F.bold, color: C.ink }}>{t(next.name)}</Text>. {t(next.desc)}.</Text>
            ) : (
              <Text style={[T.small, { marginTop: 4 }]}>{t("Every award unlocked. Impressive.")}</Text>
            )}
          </View>
        </Card>

        {GROUPS.map(g => {
          const list = AWARDS.filter(a => a.group === g.key);
          const got = list.filter(a => done.includes(a.id)).length;
          return (
            <View key={g.key} style={{ marginTop: 26 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ fontFamily: F.serif, ...display(24), color: C.ink }}>{t(g.key)}</Text>
                <Text style={[T.small, { fontSize: 12 }]}>{got} / {list.length}</Text>
              </View>
              <Text style={[T.small, { marginBottom: 12 }]}>{t(g.sub)}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {list.map((a, i) => {
                  const on = done.includes(a.id), v = progress(a, ctx), isNew = fresh.includes(a.id);
                  return (
                    <Enter key={a.id} delay={50 * i} style={{ width: '47.5%' }}>
                      <Card selected={isNew} style={{ padding: 14, alignItems: 'center', minHeight: 196 }}>
                        {isNew ? <View style={{ position: 'absolute', top: 10, right: 10 }}><Pill text={t("New")} bg={C.brass} fg="#FFFFFF" /></View> : null}
                        <Medal a={a} on={on} />
                        <Text style={{ fontFamily: F.bold, fontSize: 14.5, color: on ? C.ink : C.stone, marginTop: 10, textAlign: 'center' }}>{t(a.name)}</Text>
                        <Text style={[T.small, { fontSize: 12, textAlign: 'center', marginTop: 2 }]}>{t(a.desc)}</Text>
                        <View style={{ flex: 1 }} />
                        <View style={{ alignSelf: 'stretch', height: 5, borderRadius: 3, backgroundColor: C.line, marginTop: 12, overflow: 'hidden' }}>
                          <View style={{ width: `${(v / a.goal) * 100}%`, height: 5, backgroundColor: on ? C.brass : C.green }} />
                        </View>
                        <Text style={{ fontFamily: F.semibold, fontSize: 11.5, color: on ? C.brassInk : C.stone, marginTop: 6 }}>{on ? t('Unlocked') : fmtGoal(a, v)}</Text>
                      </Card>
                    </Enter>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
      <TabBar active="awards" />
    </View>
  );
}
