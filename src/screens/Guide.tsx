import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { C, F, display } from '../theme';
import { Card, Enter, Icon, RoundButton, T } from '../ui';
import { GUIDES, Guide, guideById } from '../guides';
import { useStore } from '../store';

const LIGHT = '#F3EFE6', LIGHT_SOFT = 'rgba(243,239,230,.72)';

// Card used in the Home carousel and in "More guides"
export function GuideCard({ g, width = 220, onPress, read }: { g: Guide; width?: number; onPress: () => void; read?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={g.title}>
      <View style={{ width, height: 168, borderRadius: 20, backgroundColor: g.tint, padding: 16, overflow: 'hidden', justifyContent: 'space-between' }}>
        <View style={{ position: 'absolute', right: -26, top: -26, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,.07)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ marginLeft: -14, marginTop: 18 }}><Icon name={g.icon} size={40} color="rgba(243,239,230,.55)" w={1.6} /></View>
        </View>
        <Text style={{ fontFamily: F.bold, fontSize: 11, letterSpacing: 1.2, color: '#E2C88E' }}>{g.kicker.toUpperCase()}</Text>
        <View>
          <Text style={{ fontFamily: F.bold, fontSize: 16, lineHeight: 21, color: LIGHT }} numberOfLines={3}>{g.title}</Text>
          <Text style={{ fontFamily: F.semibold, fontSize: 12, color: LIGHT_SOFT, marginTop: 6 }}>{read ? `Read · ${g.minutes} min` : `${g.minutes} min read`}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function GuideCarousel() {
  const { openGuide, readGuides } = useStore();
  return (
    <View style={{ marginTop: 28 }}>
      <Text style={[T.b, { fontSize: 17 }]}>Collector's guide</Text>
      <Text style={[T.small, { marginBottom: 12 }]}>Short reads on care, buying and value.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
        {GUIDES.map(g => <GuideCard key={g.id} g={g} read={readGuides.includes(g.id)} onPress={() => { Haptics.selectionAsync(); openGuide(g.id); }} />)}
      </ScrollView>
    </View>
  );
}

export function GuideScreen() {
  const { go, guideId, openGuide, markGuideRead, onboarded } = useStore();
  const g = guideById(guideId);
  const [vote, setVote] = useState<'yes' | 'no' | null>(null);
  const sv = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(() => { if (g) { markGuideRead(g.id); sv.current?.scrollTo({ y: 0, animated: false }); } else go('home'); }, [guideId]);
  if (!g) return null;
  const more = GUIDES.filter(x => x.id !== g.id).slice(0, 4);
  return (
    <View style={{ flex: 1 }}>
      <ScrollView ref={sv} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: g.tint, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 26, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', right: -40, top: 20, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,.07)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ marginRight: 30 }}><Icon name={g.icon} size={72} color="rgba(243,239,230,.4)" w={1.4} /></View>
          </View>
          <RoundButton icon="back" dark onPress={() => go(onboarded ? 'home' : 'promise')} label="Back" />
          <Text style={{ fontFamily: F.bold, fontSize: 12, letterSpacing: 1.4, color: '#E2C88E', marginTop: 40 }}>{g.kicker.toUpperCase()} · {g.minutes} MIN READ</Text>
          <Text style={{ fontFamily: F.serif, ...display(32), lineHeight: 36, color: LIGHT, marginTop: 8 }}>{g.title}</Text>
        </View>
        <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
          <Enter><Text style={{ fontFamily: F.medium, fontSize: 16.5, lineHeight: 25, color: C.ink }}>{g.intro}</Text></Enter>
          {g.sections.map((s, i) => (
            <Enter key={i} delay={80 * (i + 1)} style={{ marginTop: 22 }}>
              <Text style={[T.b, { fontSize: 17 }]}>{s.h}</Text>
              {s.p ? <Text style={{ fontFamily: F.regular, fontSize: 15.5, lineHeight: 24, color: C.ink, opacity: 0.86, marginTop: 6 }}>{s.p}</Text> : null}
              {s.list ? (
                <View style={{ marginTop: 8, gap: 8 }}>
                  {s.list.map(item => (
                    <View key={item} style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}><Icon name="check" size={12} color={C.green} w={2.6} /></View>
                      <Text style={{ flex: 1, fontFamily: F.regular, fontSize: 15.5, lineHeight: 23, color: C.ink, opacity: 0.86 }}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Enter>
          ))}
          <Text style={[T.small, { marginTop: 22, fontSize: 12 }]}>General guidance. For a valuable watch, a brand service centre or a trusted watchmaker has the final word.</Text>

          <Card style={{ marginTop: 22, padding: 16, alignItems: 'center' }}>
            {vote ? (
              <Text style={[T.body, { fontFamily: F.semibold }]}>{vote === 'yes' ? 'Glad it helped.' : 'Thanks, we will improve it.'}</Text>
            ) : (
              <>
                <Text style={[T.body, { fontFamily: F.semibold }]}>Was this useful?</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, alignSelf: 'stretch' }}>
                  {(['yes', 'no'] as const).map(v => (
                    <Pressable key={v} style={{ flex: 1 }} onPress={() => { Haptics.selectionAsync(); setVote(v); }}>
                      <View style={{ height: 42, borderRadius: 12, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', backgroundColor: C.paper }}>
                        <Text style={{ fontFamily: F.bold, fontSize: 14, color: C.ink }}>{v === 'yes' ? 'Yes' : 'Not really'}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </Card>

          <Text style={[T.b, { fontSize: 17, marginTop: 28, marginBottom: 12 }]}>More guides</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
            {more.map(x => <GuideCard key={x.id} g={x} width={200} onPress={() => { Haptics.selectionAsync(); setVote(null); openGuide(x.id); }} />)}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
