import { useEffect, useRef } from 'react'
import { Platform, Alert } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { supabase } from '@/lib/supabase'

// How foreground notifications behave
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  const token = (await Notifications.getExpoPushTokenAsync()).data
  return token
}

export async function savePushToken(userId: string) {
  try {
    const token = await registerForPushNotifications()
    if (!token) return
    await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId)
  } catch (_) {
    // Silent fail — push tokens are best-effort
  }
}

export async function scheduleWorkoutReminder(hour: number, minute: number) {
  // Cancel any existing workout reminders first
  await cancelWorkoutReminder()

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💪 Hora de entrenar',
      body: '¡Tu rutina te espera! Abrí GymOS y dale.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  })
}

export async function cancelWorkoutReminder() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  for (const notif of scheduled) {
    await Notifications.cancelScheduledNotificationAsync(notif.identifier)
  }
}

export async function getScheduledReminderTime(): Promise<{ hour: number; minute: number } | null> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  if (scheduled.length === 0) return null
  const trigger = scheduled[0]?.trigger as any
  if (trigger?.hour !== undefined) {
    return { hour: trigger.hour, minute: trigger.minute }
  }
  return null
}

// Hook: listens for notification taps (use in root layout)
export function useNotificationListener() {
  const responseListener = useRef<Notifications.EventSubscription | null>(null)

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      // User tapped a notification — app opens to foreground automatically
    })

    return () => {
      if (responseListener.current) {
        responseListener.current.remove()
      }
    }
  }, [])
}
