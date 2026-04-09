# GymOS — Master Context

## Qué es
SaaS multi-tenant para gimnasios. Digitaliza la operación completa de un gym.
Dos versiones del producto: PART y FULL.

## Roles del sistema
- SuperAdmin (yo, el creador del SaaS) → solo web, gestión global de todos los gyms, soporte, métricas globales, puede impersonar cualquier gym
- Admin/Dueño del gym → web + móvil, gestión total de su gym
- Profe → web + móvil, gestión de rutinas y clientes (el admin configura si ve solo sus alumnos o todos)
- Cliente → solo móvil, ve su rutina y progreso personal

## Versión PART (base)
Módulos:
- Mi Rutina: rutina asignada por el gym, organizada por días (3/4/5 días), cada día tiene ejercicios con sets/reps/kg registrables, check al completar el día, historial de pesos por ejercicio
- Preview de ejercicio: cada ejercicio tiene un video ≤30 segundos anclado, el cliente lo puede ver desde la app antes de ejecutar el ejercicio
- Entrenamiento Libre: el cliente elige ejercicios de la lista del gym, carga kg/sets/reps, queda registrado con fecha
- Mi Cuerpo: registro de peso corporal y masa muscular con fecha y gráfica de evolución
- Mi Progreso: métricas personales — días entrenados, volumen total, progresión por ejercicio clave
- Notificaciones push: recordatorios de entrenamiento y motivación

## Versión FULL (PART + esto)
Módulos adicionales:
- Control de acceso biométrico: lector dactilar USB en la PC del gym → software liviano (Python o Electron) → webhook n8n → valida suscripción en DB → permite o deniega acceso. Log de ingresos en tiempo real en el dashboard
- CRM completo de clientes: datos personales, WhatsApp, suscripción, estado (activo/por vencer/vencido/inactivo), historial de asistencia, rutina asignada, progreso físico
- Planes y membresías configurables por el gym
- Registro de pagos opcional (o simplemente botón "Renovar")
- Automatizaciones con n8n + Evolution API + WhatsApp:
  - Recordatorio automático X días antes del vencimiento
  - Secuencia de reactivación para clientes inactivos (remarketing)
  - Mensaje de bienvenida a nuevos clientes
- Panel de clientes en riesgo de abandono (no vienen hace +7/+15/+30 días)
- Métricas del gym: retención, tasa de abandono, horas pico, ingresos, renovaciones próximas
- Foto de progreso del cliente (visible para él y su profe)
- Evaluación inicial del cliente al darse de alta

## Branding por gym (multi-tenant visual)
Cada gym configura:
- Logo (upload)
- Color primario y secundario
- Nombre del gym
Se aplica en el dashboard web y en la app mobile via theming dinámico (CSS variables en web, ThemeContext en Expo)
Storage aislado: /gyms/{gym_id}/logo.png, /gyms/{gym_id}/videos/{exercise_id}.mp4

## Sistema de soporte integrado
- Chat widget visible en el dashboard del Admin
- Agente IA (GPT-4.1) responde primero con documentación del sistema
- Si no resuelve → escala → webhook n8n → WhatsApp al SuperAdmin con resumen + link al ticket
- SuperAdmin gestiona todos los tickets desde su panel

## Stack técnico
- Monorepo: pnpm workspaces
- apps/web: Next.js 15 + Tailwind CSS + TypeScript (dashboard web)
- apps/mobile: Expo + React Native + TypeScript (app del cliente)
- packages/: código compartido (tipos, utils, constantes)
- DB + Auth + Storage: Supabase
- Multi-tenancy: Row Level Security (RLS) por gym_id en todas las tablas
- Automatizaciones: n8n self-hosted
- WhatsApp: Evolution API
- Videos/Storage: Cloudflare R2 o Supabase Storage
- Push notifications: Expo Push Notifications
- Hardware biométrico (FULL): ZKTeco o Digital Persona + script Python/Electron

## Multi-tenancy — Regla de oro
TODAS las tablas tienen gym_id. RLS activo en todas. El SuperAdmin tiene bypass de RLS. Un gym nunca puede ver data de otro.

## Modelo de negocio
- PART: ~$300.000 ARS/mes
- FULL: $500.000 ARS/mes
- Objetivo: primeros 10 clientes (gyms medianos, Córdoba Argentina primero)

## Orden de desarrollo
- Fase 0: Schema Supabase multi-tenant + RLS + Auth + Super Admin panel básico + sistema de branding por gym
- Fase 1: Dashboard Web Admin — PART (rutinas, ejercicios + videos, clientes, profes)
- Fase 2: App Mobile — PART (todas las vistas del cliente + push notifications)
- Fase 3: FULL (CRM, biométrico, n8n, WhatsApp, métricas avanzadas)

## Convenciones
- Español para nombres de vistas y UI
- Inglés para código, variables, funciones, nombres de tablas en DB
- Componentes: PascalCase
- Funciones y variables: camelCase
- Tablas Supabase: snake_case
- Siempre tipado estricto con TypeScript, sin any
- Preferir rewrites completos de archivos sobre diffs parciales
