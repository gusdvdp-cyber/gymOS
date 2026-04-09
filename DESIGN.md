# GymOS — Design System

## Dirección estética
Industrial/utilitario refinado. Dark-first. Gimnasio serio, no app de fitness de juguete.
Inspiración: Notion + Linear + aplicación de gym de alto rendimiento.

## Paleta
- Background principal: #0a0a0a
- Surface cards: #111111 y #1a1a1a
- Borde sutil: #2a2a2a
- Acento principal: #e8ff47 (lima eléctrico — energía, fuerza)
- Acento secundario: #ffffff
- Error/alerta: #ff4444
- Éxito: #22c55e
- Texto primario: #ffffff
- Texto secundario: #888888

## Tipografía
- Display/headings: 'Bebas Neue' (impacto, gym, fuerza)
- Body/UI: 'DM Sans' (legible, moderno, no genérico)
- Monospace (datos, métricas): 'JetBrains Mono'
- Nunca usar: Inter, Roboto, Arial, system-ui

## Componentes — Reglas
- Cards: fondo #111111, borde 1px #2a2a2a, border-radius 12px, sin sombras suaves → usar glow sutil con el acento cuando hay hover
- Botones primarios: fondo #e8ff47, texto #0a0a0a, font-weight 700, sin border-radius excesivo (8px máximo)
- Botones secundarios: borde 1px #2a2a2a, fondo transparente, texto #ffffff
- Inputs: fondo #1a1a1a, borde #2a2a2a, focus → borde #e8ff47
- Sidebar: #0d0d0d, ancho 240px, íconos con Lucide React
- Badges de estado: Activo → lima, Por vencer → amarillo, Vencido → rojo, Inactivo → gris

## Animaciones
- Usar Framer Motion para transiciones de página y mount de componentes
- Hover en cards: translateY(-2px) + glow en borde
- Loading states: skeleton con shimmer effect en #1a1a1a → #2a2a2a
- Nunca usar emojis como íconos → reemplazar con Lucide React siempre
- Números/métricas: animar conteo al montar (count-up animation)
- Staggered reveal en listas y grids al cargar

## Layouts
- Sidebar fijo izquierda + contenido principal
- Grids asimétricos para dashboards (no todo igual tamaño)
- Métricas grandes: número enorme en Bebas Neue + label pequeño en DM Sans
- Generous negative space — no llenar todo

## Lo que NUNCA hacer
- Emojis como íconos de navegación o cards (ya están, hay que reemplazarlos)
- Fondos blancos o grises claros
- Gradientes púrpura
- Cards con sombra drop-shadow genérica
- Bordes redondeados excesivos (>12px en cards)
- Botones con gradiente arcoíris

## Branding dinámico por gym
El color primario del gym reemplaza #e8ff47 en toda la UI vía CSS variable:
--color-accent: [color primario del gym]
Se inyecta desde la config del gym al cargar el dashboard.
