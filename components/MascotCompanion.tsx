import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pause, Play } from 'lucide-react-native';
import Mascot, { MascotPose, MascotAnimation } from './Mascot';
import { useStore } from '../hooks/useStore';
import { Colors } from '../constants/colors';

/** A reserved strip, never an overlay over clinical values or form controls. */
export default function MascotCompanion() {
  const path = usePathname();
  const es = useStore(s => s.language) === 'es';
  const xp = useStore(s => s.xp);
  const exams = useStore(s => s.sessions.length);
  const inset = useSafeAreaInsets();
  const [quiet, setQuiet] = useState(false);
  const [reaction, setReaction] = useState<'hello' | 'saved' | 'progress' | null>(null);
  const [sleeping, setSleeping] = useState(false);
  const previous = useRef({ xp, exams });
  useEffect(() => {
    if (exams > previous.current.exams) setReaction('saved');
    else if (xp > previous.current.xp) setReaction('progress');
    previous.current = { xp, exams };
  }, [xp, exams]);
  useEffect(() => {
    if (!reaction) return;
    const timer = setTimeout(() => setReaction(null), 3500);
    return () => clearTimeout(timer);
  }, [reaction]);
  useEffect(() => {
    setSleeping(false);
    const timer = setTimeout(() => setSleeping(true), 45000);
    return () => clearTimeout(timer);
  }, [path, reaction]);
  let pose: MascotPose = 'waving', animation: MascotAnimation = 'wave';
  let message = es ? 'Vamos a tu ritmo.' : 'At your own pace.';
  if (path.includes('progress')) { pose = 'thinking'; animation = 'thinking-tilt'; message = es ? 'Miremos tu recorrido, paso a paso.' : 'Let’s look at your journey, step by step.'; }
  if (path.includes('upload')) { pose = 'clipboardReading'; animation = 'idle-breath'; message = es ? 'Tus estudios, juntos y ordenados.' : 'Your studies, together and organized.'; }
  if (path.includes('import-pdf') || path.includes('manual-entry')) { pose = 'doctor'; animation = 'thinking-tilt'; message = es ? 'Revisemos cada dato antes de guardar.' : 'Let’s review each result before saving.'; }
  if (path.includes('raly')) { pose = 'pointing'; animation = 'idle-breath'; message = es ? 'Conectemos tus estudios, a tu ritmo.' : 'Let’s connect your studies at your pace.'; }
  if (path.includes('activity')) { pose = 'flexing'; animation = 'idle-breath'; message = es ? 'Un pequeño paso también cuenta.' : 'Small steps count, too.'; }
  if (path.includes('settings')) { pose = 'default'; animation = 'idle-breath'; message = es ? 'Este espacio es tuyo.' : 'Make this space yours.'; }
  if (path.includes('biomarker') || path.includes('/test/')) { pose = 'clipboardReading'; animation = 'thinking-tilt'; message = es ? 'El valor, su rango y su fecha importan.' : 'The value, range and date all matter.'; }
  if (sleeping) { pose = 'sleeping'; animation = 'sleep-bob'; message = es ? 'Aquí estoy cuando me necesites.' : 'Here whenever you need me.'; }
  if (reaction) {
    pose = reaction === 'hello' ? 'waving' : 'celebrating';
    animation = reaction === 'hello' ? 'wave' : 'celebrate-bounce';
    message = reaction === 'saved' ? (es ? '¡Estudio guardado! Un paso más.' : 'Study saved! One step forward.') : reaction === 'progress' ? (es ? '¡Acción completada! Bien por dedicarte tiempo.' : 'Action complete! Time well spent on you.') : (es ? '¡Aquí contigo! Sin prisa.' : 'Right here with you. No rush.');
  }
  return <View testID="mascot-companion" style={[styles.strip, { paddingTop: Math.max(inset.top, 8) }]}>
    <Pressable accessibilityRole="button" accessibilityLabel={es ? 'Saludar a la mascota' : 'Say hello to the mascot'} onPress={() => { setSleeping(false); setReaction('hello'); }} style={styles.avatar}>
      <Mascot pose={quiet ? 'sleeping' : pose} animation={quiet ? 'none' : animation} size={52} />
    </Pressable>
    <View style={styles.copy}><Text style={styles.name}>CLYRA · {es ? 'CONTIGO' : 'WITH YOU'}</Text><Text testID="companion-message" style={styles.message}>{quiet ? (es ? 'Modo tranquilo. Sigo aquí.' : 'Quiet mode. Still here.') : message}</Text></View>
    <Pressable accessibilityRole="button" accessibilityLabel={es ? (quiet ? 'Activar acompañante' : 'Pausar acompañante') : (quiet ? 'Resume companion' : 'Pause companion')} accessibilityState={{ selected: quiet }} onPress={() => setQuiet(!quiet)} style={styles.control}>{quiet ? <Play size={16} color={Colors.primary} /> : <Pause size={16} color={Colors.primary} />}</Pressable>
  </View>;
}
const styles = StyleSheet.create({
  strip: { flexDirection:'row', alignItems:'center', paddingHorizontal:12, paddingBottom:8, gap:10, backgroundColor:'#FFF5F8', borderBottomWidth:1, borderBottomColor:'#F0E1E7' },
  avatar: { width:56, height:56, alignItems:'center', justifyContent:'center' },
  copy: { flex:1, gap:3 }, name:{ fontSize:10, fontWeight:'800', letterSpacing:1.5, color:Colors.primary },
  message:{ fontSize:12, lineHeight:17, color:Colors.foreground },
  control:{ minWidth:44, minHeight:44, alignItems:'center', justifyContent:'center' }, controlText:{ color:Colors.primary, fontSize:16 },
});
