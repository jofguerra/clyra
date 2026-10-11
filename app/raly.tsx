import React, { useState } from 'react';
import { Platform, SafeAreaView, ScrollView, Text, TextInput, View, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../components/AppHeader';
import Button from '../components/ui/Button';
import Mascot from '../components/Mascot';
import { Colors } from '../constants/colors';
import { useStore } from '../hooks/useStore';
import { connectRaly, currentRalyStudies, disconnectRaly, listRaly, selectRalyPdf, RalyStudy } from '../services/ralyConnector';
export default function RalyScreen() {
  const router = useRouter();
  const es = useStore(s => s.language) === 'es';
  const label = (a:string,b:string) => es ? a : b;
  const [token,setToken] = useState(''), [username,setUsername] = useState(''), [password,setPassword] = useState('');
  const [studies,setStudies] = useState<RalyStudy[] | null>(currentRalyStudies), [busy,setBusy] = useState(false), [error,setError] = useState('');
  const [own,setOwn] = useState(false);
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError('');
    try { await action(); } catch (e) {
      const code = e instanceof Error ? e.message : '';
      const messages: Record<string,string> = {
        'pairing-required':label('Revisa la clave del conector local.','Check the local connector pairing key.'),
        'login-failed':label('Raly no aceptó el acceso o requiere verificación adicional. Entra al portal para comprobarlo.','Raly did not accept the login or needs additional verification. Check access on the portal.'),
        'session-expired':label('La sesión caducó. Vuelve a conectar.','Session expired. Connect again.'),
        'portal-changed':label('No reconocemos esta pantalla de Raly. Usa la importación manual de PDF.','This Raly page is not supported. Use manual PDF import.'),
        'pdf-too-large':label('El PDF supera 10 MB.','The PDF exceeds 10 MB.'),
      };
      setError(messages[code] || label('No se completó la conexión. Comprueba que el conector local esté iniciado y permita esta dirección del app. Puedes importar un PDF manualmente.','Connection could not complete. Check the local connector is running and allows this app origin. You can import a PDF manually.'));
      if (!currentRalyStudies()) setStudies(null);
    } finally { setPassword(''); setBusy(false); }
  }
  return <SafeAreaView style={{flex:1,backgroundColor:Colors.background}}>
    <AppHeader title={label('Conectar Raly','Connect Raly')} showBack onBack={() => router.back()} />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:24,gap:16}}>
      <View style={{alignItems:'center'}}><Mascot pose={busy ? 'clipboardReading' : 'waving'} animation={busy ? 'thinking-tilt' : 'wave'} size={100}/></View>
      <Text style={{fontSize:24,fontWeight:'700',color:Colors.foreground}}>{label('Tus estudios, más cerca.','Your studies, closer.')}</Text>
      <Text>{label('Conexión local experimental. Selecciona un PDF y revisa sus resultados antes de guardarlos. El acceso real a una cuenta todavía está pendiente de validación.','Experimental local connection. Select a PDF and review its results before saving. Real account access is still pending validation.')}</Text>
      {Platform.OS !== 'web' ? <Text>{label('Por ahora disponible en web. En móvil puedes ingresar resultados manualmente.','Currently available on web. On mobile, enter results manually.')}</Text> : studies === null ? <>
        <Text>{label('Inicia el conector en tu computadora con npm run raly:connector. La clave está en el archivo .raly-connector-token. Se necesita el navegador Chromium instalado.','Start the connector on your computer with npm run raly:connector. The pairing key is in .raly-connector-token. Chromium must be installed.')}</Text>
        <TextInput accessibilityLabel={label('Clave del conector','Connector pairing key')} placeholder={label('Clave del conector local','Local connector key')} secureTextEntry autoCapitalize="none" autoCorrect={false} value={token} onChangeText={setToken} style={input}/>
        <TextInput accessibilityLabel={label('Usuario Raly','Raly username')} placeholder={label('Cédula o código de laboratorio','Patient or laboratory code')} autoCapitalize="none" autoCorrect={false} value={username} onChangeText={setUsername} style={input}/>
        <TextInput accessibilityLabel={label('Contraseña Raly','Raly password')} placeholder={label('Contraseña Raly','Raly password')} secureTextEntry value={password} onChangeText={setPassword} style={input}/>
        <Text>{label('La contraseña solo se usa para iniciar sesión; no se guarda. La sesión local caduca a los 15 minutos.','The password is used only to sign in and is not saved. The local session expires after 15 minutes.')}</Text>
        <Button title={label('Conectar y buscar estudios','Connect and find studies')} disabled={busy || !token.trim() || !username.trim() || !password} onPress={() => run(async () => { setStudies(await connectRaly(token,username,password)); setToken(''); setUsername(''); setOwn(false); })}/>
      </> : <>
        <Text style={{fontWeight:'700'}}>{label(`${studies.length} informes disponibles`,`${studies.length} reports available`)}</Text>
        <Text>{label('Confirma que estos informes corresponden a la persona del perfil de Clyra. No importes estudios de dependientes en otro perfil.','Confirm these reports belong to the person in this Clyra profile. Do not mix dependents’ results into another profile.')}</Text>
        <Switch accessibilityLabel={label('Los estudios corresponden a este perfil','Studies belong to this profile')} value={own} onValueChange={setOwn}/>
        {studies.map(study => <View key={study.id} style={{padding:16,borderRadius:18,backgroundColor:'#FFF',gap:12,borderWidth:1,borderColor:Colors.border}}>
          <Text>{study.label}</Text><Button title={label('Descargar y revisar','Download and review')} disabled={busy || !own} onPress={() => run(async () => { await selectRalyPdf(study); router.push('/import-pdf'); })}/>
        </View>)}
        {!studies.length && <Text>{label('No hay enlaces PDF en este listado. Puedes descargar un informe desde el portal e importarlo manualmente.','No PDF links in this listing. You can download a report from the portal and import it manually.')}</Text>}
        <Button variant="ghost" title={label('Actualizar listado','Refresh studies')} disabled={busy} onPress={() => run(async () => setStudies(await listRaly()))}/>
        <Button variant="ghost" title={label('Desconectar Raly','Disconnect Raly')} disabled={busy} onPress={() => run(async () => { try { await disconnectRaly(); } finally { setStudies(null); setOwn(false); } })}/>
      </>}
      {busy && <ActivityIndicator accessibilityLabel={label('Conectando con Raly','Connecting to Raly')}/>}
      {!!error && <Text accessibilityRole="alert" style={{color:Colors.attention}}>{error}</Text>}
      <Button variant="ghost" title={label('Importar un PDF descargado','Import a downloaded PDF')} onPress={() => router.push('/import-pdf')}/>
    </ScrollView>
  </SafeAreaView>;
}
const input = {padding:14,borderWidth:1,borderColor:Colors.border,borderRadius:14,backgroundColor:'#FFF'};
