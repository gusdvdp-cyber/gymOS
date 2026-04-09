import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/theme-context'
import { useSession } from '@/context/session-context'
import type { BodyMeasurementRow } from '@gymos/types'

const FIELDS: { key: keyof BodyMeasurementRow; label: string; unit: string }[] = [
  { key: 'weight_kg',    label: 'Peso',           unit: 'kg' },
  { key: 'height_cm',   label: 'Altura',          unit: 'cm' },
  { key: 'body_fat_pct',label: 'Grasa corporal',  unit: '%'  },
  { key: 'chest_cm',    label: 'Pecho',           unit: 'cm' },
  { key: 'waist_cm',    label: 'Cintura',         unit: 'cm' },
  { key: 'hips_cm',     label: 'Cadera',          unit: 'cm' },
  { key: 'bicep_cm',    label: 'Bícep',           unit: 'cm' },
  { key: 'thigh_cm',    label: 'Muslo',           unit: 'cm' },
]

type FormValues = Partial<Record<keyof BodyMeasurementRow, string>>

export default function CuerpoScreen() {
  const { primaryColor } = useTheme()
  const { session } = useSession()

  const [measurements, setMeasurements] = useState<BodyMeasurementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormValues>({})
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    if (!session) return
    setLoading(true)
    const { data } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('client_id', session.user.id)
      .order('measured_at', { ascending: false })
      .limit(20)
    setMeasurements((data ?? []) as BodyMeasurementRow[])
    setLoading(false)
  }, [session])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    if (!session) return
    const hasAny = FIELDS.some(f => form[f.key] && form[f.key] !== '')
    if (!hasAny) { Alert.alert('Error', 'Completá al menos un campo'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('gym_id')
      .eq('id', session.user.id)
      .single()

    if (!profile?.gym_id) { Alert.alert('Error', 'Sin gimnasio asociado'); return }

    setSaving(true)
    const payload: Record<string, any> = {
      gym_id: profile.gym_id,
      client_id: session.user.id,
      measured_at: new Date().toISOString().split('T')[0],
    }
    FIELDS.forEach(f => {
      const val = form[f.key]
      if (val && val !== '') payload[f.key] = parseFloat(val)
    })

    const { error } = await supabase.from('body_measurements').insert(payload)
    setSaving(false)
    if (error) { Alert.alert('Error', error.message); return }
    setForm({})
    setShowForm(false)
    load()
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <ActivityIndicator size="large" color={primaryColor} />
      </SafeAreaView>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>MI CUERPO</Text>
            <Text style={styles.headerSub}>Seguimiento de medidas</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: showForm ? '#1a1a1a' : primaryColor, borderColor: showForm ? '#2a2a2a' : primaryColor }]}
            onPress={() => setShowForm(v => !v)}
            activeOpacity={0.85}
          >
            <Text style={[styles.addBtnText, { color: showForm ? '#888888' : '#0a0a0a' }]}>
              {showForm ? 'CANCELAR' : '+ AGREGAR'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Form */}
          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>NUEVA MEDICIÓN</Text>
              {FIELDS.map(f => (
                <View key={f.key as string} style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <View style={styles.fieldInputWrap}>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="—"
                      placeholderTextColor="#333333"
                      keyboardType="decimal-pad"
                      value={form[f.key] ?? ''}
                      onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                      selectionColor={primaryColor}
                    />
                    <Text style={styles.fieldUnit}>{f.unit}</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: primaryColor }, saving && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>{saving ? 'GUARDANDO...' : 'GUARDAR MEDICIÓN'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {measurements.length === 0 && !showForm ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>Sin mediciones</Text>
              <Text style={styles.emptySub}>Registrá tu primera medición para hacer seguimiento.</Text>
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: primaryColor, marginTop: 20 }]}
                onPress={() => setShowForm(true)}
                activeOpacity={0.85}
              >
                <Text style={[styles.addBtnText, { color: '#0a0a0a' }]}>+ AGREGAR</Text>
              </TouchableOpacity>
            </View>
          ) : (
            measurements.map((m) => (
              <View key={m.id} style={styles.measureCard}>
                <Text style={[styles.measureDate, { color: primaryColor }]}>{formatDate(m.measured_at)}</Text>
                <View style={styles.measureGrid}>
                  {FIELDS.filter(f => m[f.key] != null).map(f => (
                    <View key={f.key as string} style={styles.measureItem}>
                      <Text style={styles.measureValue}>{m[f.key] as number}</Text>
                      <Text style={styles.measureLabel}>{f.label.toUpperCase()}</Text>
                      <Text style={styles.measureUnit}>{f.unit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: 2 },
  headerSub: { fontSize: 12, color: '#444444', marginTop: 4, letterSpacing: 0.5 },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  addBtnText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  scrollContent: { padding: 16, paddingBottom: 40 },

  formCard: {
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  formTitle: { fontSize: 11, fontWeight: '800', color: '#444444', letterSpacing: 2, marginBottom: 16 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  fieldLabel: { fontSize: 14, color: '#888888', fontWeight: '500' },
  fieldInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldInput: {
    width: 80,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'right',
    fontWeight: '700',
  },
  fieldUnit: { fontSize: 12, color: '#444444', width: 28, fontWeight: '600' },
  saveBtn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#0a0a0a', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },

  measureCard: {
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  measureDate: { fontSize: 12, fontWeight: '800', marginBottom: 12, letterSpacing: 0.5 },
  measureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  measureItem: {
    minWidth: '28%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  measureValue: { fontSize: 20, fontWeight: '900', color: '#ffffff' },
  measureLabel: { fontSize: 9, color: '#444444', marginTop: 4, textAlign: 'center', letterSpacing: 1, fontWeight: '700' },
  measureUnit: { fontSize: 10, color: '#333333', marginTop: 1 },

  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#444444', textAlign: 'center', lineHeight: 22 },
})
