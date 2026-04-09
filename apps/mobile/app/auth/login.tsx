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

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Completá todos los campos')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      Alert.alert('Error', 'Email o contraseña incorrectos')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      <View style={styles.inner}>
        {/* Logo / Brand */}
        <View style={styles.brand}>
          <Text style={styles.logo}>GYMOS</Text>
          <View style={styles.logoLine} />
          <Text style={styles.tagline}>Tu entrenamiento, tu progreso</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>CONTRASEÑA</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#333333"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            selectionColor="#e8ff47"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {loading ? 'INGRESANDO...' : 'INGRESAR'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push('/auth/forgot-password')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotBtnText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },

  brand: { alignItems: 'center', marginBottom: 48 },
  logo: {
    fontSize: 52,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 8,
    textTransform: 'uppercase',
  },
  logoLine: {
    width: 40,
    height: 3,
    backgroundColor: '#e8ff47',
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 2,
  },
  tagline: { fontSize: 12, color: '#444444', letterSpacing: 2, textTransform: 'uppercase' },

  form: {},
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#444444',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#e8ff47',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: '#0a0a0a',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 2,
  },
  forgotBtn: { alignItems: 'center', marginTop: 20, paddingVertical: 8 },
  forgotBtnText: { fontSize: 13, color: '#444444' },
})
