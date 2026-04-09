import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSend() {
    if (!email.trim()) { Alert.alert('Error', 'Ingresá tu email'); return }
    setLoading(true)
    const baseUrl = process.env.EXPO_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${baseUrl}/callback?next=/reset-password`,
    })
    setLoading(false)
    if (error) { Alert.alert('Error', error.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <View style={styles.inner}>
          <View style={styles.sentIcon}>
            <Text style={styles.sentIconText}>✉</Text>
          </View>
          <Text style={styles.title}>REVISÁ TU EMAIL</Text>
          <Text style={styles.subtitle}>
            Si tu email está registrado, vas a recibir un link para restablecer tu contraseña.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>← Volver al login</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <View style={styles.inner}>
        <Text style={styles.title}>RECUPERAR CONTRASEÑA</Text>
        <Text style={styles.subtitle}>
          Ingresá tu email y te enviamos un link para resetearla.
        </Text>

        <Text style={styles.fieldLabel}>EMAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor="#333333"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          selectionColor="#e8ff47"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {loading ? 'ENVIANDO...' : 'ENVIAR LINK'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>← Volver al login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },

  sentIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  sentIconText: { fontSize: 28, color: '#e8ff47' },

  title: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: 2, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#444444', textAlign: 'center', marginBottom: 32, lineHeight: 22 },

  fieldLabel: { fontSize: 10, fontWeight: '700', color: '#444444', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  input: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#e8ff47',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#0a0a0a', fontWeight: '900', fontSize: 13, letterSpacing: 2 },
  backBtn: { alignItems: 'center', marginTop: 20, paddingVertical: 8 },
  backBtnText: { fontSize: 13, color: '#444444' },
})
