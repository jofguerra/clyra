# Zyva App — Brief de Diseno para el Disenador

## Que es Zyva?
Una app de salud que analiza PDFs de examenes de sangre usando IA, muestra biomarcadores en un mapa corporal interactivo, calcula puntajes de salud, rastrea tendencias a lo largo del tiempo, y gamifica el camino de mejora de salud con XP, niveles, logros y misiones. Bilingue (Ingles / Espanol).

---

## Stack Tecnico (Lo que el disenador necesita saber)
- **Plataforma**: React Native + Expo (iOS + Android)
- **Iconos**: Usamos [Lucide Icons](https://lucide.dev/icons/) — cualquier icono de esta libreria se puede usar. El disenador puede referenciar iconos por nombre.
- **Tipografia**: Fuentes del sistema (San Francisco en iOS, Roboto en Android). Dos pesos: texto regular de cuerpo y titulares bold de display.
- **Colores**: Definidos abajo. El disenador puede proponer una paleta nueva pero debe mantener la misma estructura semantica.

---

## Sistema de Colores Actual

| Token | Hex | Uso |
|-------|-----|-----|
| **primary** | #0058BE | Azul principal de marca — botones, links, estados activos |
| **background** | #F6FAFE | Fondo de la app |
| **surface** | #FFFFFF | Fondo de tarjetas |
| **surfaceLow** | #F0F4F8 | Chips inactivos, fondos secundarios |
| **foreground** | #171C1F | Texto principal |
| **mutedForeground** | #424754 | Texto secundario/subtitulos |
| **outline** | #72787E | Texto terciario, bordes |
| **optimal** (verde) | #006947 | Marcadores normales/saludables, mejoras |
| **borderline** (amarillo) | #CA8A04 | Marcadores en el limite/advertencia |
| **attention** (rojo) | #BA1A1A | Marcadores fuera de rango, errores, alertas |
| **gold** | #D4A017 | Logros, nivel elite |
| **purple** | #7C3AED | Sistema de XP, acentos de gamificacion |

Cada color de estado tiene una variante al 10% de opacidad para fondos (ej: optimal10, attention10).

---

## Vista General de Pantallas (12 pantallas + 1 componente principal)

### FLUJO DE ONBOARDING (4 pantallas)

#### Pantalla 1: Bienvenida
- Logo/icono de la app (grande, centrado)
- Titular principal + subtitulo
- 4 badges de confianza en fila (iconos: Shield, Lock, Sparkles, BookOpen)
- 2 botones abajo: "Comenzar" (primario) + "Ver Demo" (outline)

#### Pantalla 2: Configurar Perfil
- Header con boton atras
- 3 campos de formulario:
  - Nombre (input de texto)
  - Edad (input numerico)
  - Sexo (2 botones toggle: Masculino / Femenino)
- Boton "Continuar" (deshabilitado hasta que todo este lleno)

#### Pantalla 3: Seleccion de Objetivos
- Header con boton atras
- Titulo + subtitulo
- 7 tarjetas de objetivo en cuadricula de 2 columnas, cada una con:
  - Icono emoji (arriba-izquierda)
  - Badge de checkmark (arriba-derecha, cuando seleccionado)
  - Etiqueta del objetivo (abajo)
  - Estado seleccionado: fondo azul tenue + borde azul
- Boton en footer: "Continuar" u "Omitir por ahora"

**Objetivos**: Bienestar/Animo, Metabolismo, Rendimiento, Testosterona, Hormonas Femeninas, Longevidad, Salud Preventiva

#### Pantalla 4: Crear Cuenta
- Header con boton atras
- Titular + subtitulo
- Input de email + Input de contrasena
- Boton "Crear Cuenta" (primario)
- Link "Ya tengo cuenta (Iniciar sesion)"

---

### APP PRINCIPAL (4 tabs + 2 pantallas de detalle + 1 suscripcion)

#### Pantalla 5: Dashboard Principal (Tab 1 — "Salud")
La pantalla mas compleja. Scrollable, con estas secciones en orden:

1. **Saludo Coach** — "Hola, {nombre}" + 2-3 mensajes contextuales del coach (puntos de colores)
2. **Tarjeta Hero de Score** — Gauge circular grande (0-100) + badge de nivel + indicador de tendencia + edad biologica + 2 CTAs pequenos
3. **Barra de Progreso XP** — Barra delgada morada mostrando progreso de nivel XP
4. **Tus Prioridades** (hasta 3 tarjetas) — Cada una muestra: icono emoji, titulo, subtitulo, badge de impacto ("+5 puntos"), chevron
5. **Simulacion de Mejora** — "Si mejoras X, tu score sube de 77 a 82" con comparacion actual/proyectado
6. **Tus Misiones** (hasta 2 tarjetas) — Cada una muestra: icono emoji, nombre de mision, descripcion, barra de progreso, badge de XP
7. **Tu Progreso** (cuadricula 2x2) — 4 cajas de estadisticas: marcadores mejorados, sistemas en verde, cobertura %, semanas activas
8. **Mapa Corporal** — Silueta interactiva del cuerpo con puntos de colores por sistema (ver seccion de Componente)
9. **Mapa de Cobertura** — 8 sistemas corporales con barras de progreso horizontales mostrando % de cobertura
10. **Todos los Marcadores** — Chips de filtro horizontal (por sistema) + lista de filas de marcadores (nombre, valor, chip de estado, chevron)
11. **Dashboard de Riesgo** — 3 tarjetas de riesgo lado a lado (Cardiovascular, Metabolico, Inflamacion) cada una con icono, nivel, barra
12. **Logros** — Fila horizontal scrollable de iconos de badges (desbloqueado = brillo dorado, bloqueado = atenuado con candado)
13. **Banner de Alerta Critica** — Banner rojo al fondo si existen marcadores urgentes

**Estado vacio** (sin datos): Mapa corporal + boton CTA "Sube tus resultados"

#### Pantalla 6: Tendencias (Tab 2 — "Tendencias")

**Con 2+ examenes:**
1. Grafica de Historial de Score — Grafica de linea con puntos, linea proyectada punteada, etiquetas de fecha
2. Banner de Celebracion — Banner verde si el score mejoro
3. Tarjeta de Score Actual — Numero grande + mini gauge circular + delta de tendencia
4. Marcadores Mejorando — Filas verdes con icono flecha-arriba, nombre de marcador, cambio de estado
5. Marcadores Empeorando — Filas rojas con icono flecha-abajo
6. Simulacion de Mejora — Comparacion de doble anillo (actual -> proyectado)
7. Preguntas para el Doctor — Tarjetas con preguntas citadas, chip de marcador, boton compartir
8. Tarjetas de Accion — Por marcador: alimentos a comer (verde), alimentos a evitar (rojo), ejercicio (azul)
9. Historial de Examenes — Filas con badge de score, fecha, cuenta de marcadores, etiqueta "Ultimo"

**Con 1 examen (estado gamificado de desbloqueo):**
1. Grafica de Score (punto unico + proyeccion)
2. Tarjeta de Score Actual
3. **3 Tarjetas de Desbloqueo** — Cada una con icono + "Desbloquea tendencias/edad bio/insights" + icono de candado
4. **Incentivo XP** — Banner morado "+100 XP por subir tu segundo examen"
5. **CTA Subir** — Boton azul "Subir nuevo examen"
6. Simulacion de Mejora
7. Preguntas para el Doctor + Tarjetas de Accion

**Estado vacio:** Icono + "Sin datos aun" + subtitulo

#### Pantalla 7: Examenes / Subir (Tab 3 — "Examenes")

**Vista por defecto:**
1. Boton "Agregar Examen" (prominente, azul, arriba)
2. Lista de historial de uploads (si hay examenes) — badge de score + info + chevron por examen
3. Seccion de Examenes Recomendados — agrupados por sistema corporal, cada uno con icono + nombre de examen + descripcion

**Selector de metodo de upload:**
3 opciones (solo PDF activo, Foto y Manual muestran "Proximamente"):
- PDF: Icono de upload + titulo + descripcion + chevron
- Foto: Icono de camara (gris) + chip "Proximamente"
- Manual: Icono de teclado (gris) + chip "Proximamente"

**Estados de procesamiento:** Spinner de carga + texto de estado
**Estado completado:** Checkmark verde + "Analisis Completado!" + cuenta de marcadores + 2 botones

#### Pantalla 8: Chat con IA (tab oculto, accesible via botones)
1. Lista de mensajes — Burbujas IA (izquierda, blancas, avatar Bot) + Burbujas Usuario (derecha, azules, avatar Usuario)
2. Chips de preguntas rapidas — Scroll horizontal de preguntas predefinidas
3. Barra de input de texto — Campo de input + Boton Enviar (circulo azul)
4. Texto de disclaimer — "No es consejo medico"

#### Pantalla 9: Configuracion (Tab 4)
1. Tarjeta de perfil — Circulo avatar (letra inicial) + nombre + cuenta de examenes
2. **Banner de Suscripcion** — "Ser Pro" con icono de corona (si no es Pro) o "Eres miembro Pro" (si es Pro)
3. **Stats de Gamificacion** — Barra de XP + 3 columnas de stats (logros, semanas de racha, nombre de nivel)
4. Toggle de idioma — 2 botones con emojis de bandera (Ingles / Espanol)
5. Objetivos de Salud — Cuadricula wrap de chips de objetivo (igual que onboarding, toggleable)
6. Controles de privacidad — 3 filas de configuracion con toggles/badges (visibilidad, encriptacion, notificaciones)
7. Gestion de datos — Boton exportar + Boton eliminar (rojo, destructivo)
8. Footer disclaimer

#### Pantalla 10: Detalle de Biomarcador (se navega desde filas de marcadores)
1. Boton atras
2. **Barra de Rango** — Barra de gradiente (rojo->amarillo->verde->amarillo->rojo) con burbuja de posicion del marcador
3. Etiquetas de zona debajo de la barra (Bajo / Normal / Limite / Alto con valores de referencia)
4. Mensaje de estado — Texto de explicacion con color
5. **Tarjeta de Velocidad de Envejecimiento** — Advertencia o celebracion sobre tendencia consistente (si 3+ examenes)
6. Badge de tendencia — Icono de flecha + valor delta
7. **Linea de Tiempo** — Timeline vertical de todos los resultados con puntos, fechas, valores
8. Banner de recordatorio de re-examen (si esta vencido)
9. **Tarjeta de Insight IA** — Icono de Sparkles + texto de insight personalizado + link regenerar
10. Recomendaciones de alimentos a comer / evitar / ejercicio / sueno

#### Pantalla 11: Detalle de Examen (se navega desde historial)
1. Header con atras + titulo + boton editar/guardar
2. Tarjeta de score — Fecha + nombre de archivo + burbuja grande de score
3. Banner de modo edicion (cuando se edita)
4. Seccion Fuera de Rango — Filas de biomarcadores con color (valores editables en modo edicion)
5. Seccion En Rango — Filas de biomarcadores verdes
6. Boton eliminar (rojo, abajo)

#### Pantalla 12: Suscripcion / Paywall (NUEVA)

Esta pantalla aparece como **modal o overlay a pantalla completa** cuando un usuario gratuito intenta acceder a una funcion premium, O desde el boton "Ser Pro" en Configuracion.

##### Division de Funciones Free vs Pro

| Funcion | Gratis | Pro |
|---------|--------|-----|
| Subir examenes (PDF) | Solo 1 examen | Ilimitados |
| Puntaje de salud | Si | Si |
| Mapa corporal | Si | Si |
| Detalle de biomarcador | Basico (valor + estado) | Completo (insight IA, alimentos, ejercicio, tendencia) |
| Chat IA | 3 mensajes/dia | Ilimitado |
| Tendencias y comparaciones | Bloqueado | Acceso completo |
| Edad biologica | Bloqueado | Acceso completo |
| Dashboard de riesgo | Bloqueado | Acceso completo |
| Simulacion de mejora | Bloqueado | Acceso completo |
| Preguntas para el doctor | Bloqueado | Acceso completo |
| Logros y XP | Basico | Gamificacion completa |
| Recomendaciones prioritarias | Bloqueado | Acceso completo |
| Exportar datos | Bloqueado | Acceso completo |

##### Layout de la Pantalla (de arriba a abajo)

1. **Boton Cerrar** (arriba-derecha)
   - Icono X (24px), tappable para cerrar
   - Solo aparece cuando se accede desde Configuracion (no desde paywall duro)

2. **Ilustracion Hero** (centrada, ~200px de alto)
   - Ilustracion personalizada mostrando concepto de salud/bienestar
   - Podria ser: persona con mapa corporal brillante, metricas de salud flotando
   - **Asset necesario del disenador**: SVG o PNG @3x

3. **Titular**
   - "Desbloquea Tu Salud Completa"
   - Fuente: Display, 28px, Bold(800), centrado

4. **Subtitulo**
   - "Obten analisis ilimitado con IA, tendencias y coaching personalizado"
   - Fuente: Body, 15px, mutedForeground, centrado, line-height 22

5. **Lista de Funciones** (4-5 filas, gap 14)
   - Cada fila: Icono checkmark (verde, 20px) + texto de funcion (14px, foreground)
   - Funciones a destacar:
     1. "Examenes ilimitados y analisis con IA"
     2. "Seguimiento de tendencias y edad biologica"
     3. "Coach de salud personalizado con IA"
     4. "Scores de riesgo y simulacion de mejora"
     5. "Recomendaciones prioritarias y planes de accion"

6. **Tarjetas de Plan** (2 opciones lado a lado)

   **Plan Mensual:**
   - Borde: 1px outline
   - Etiqueta: "Mensual" (14px, bold)
   - Precio: "$4.99/mes" (24px, bold, foreground)
   - Sub-etiqueta: "Cobro mensual" (12px, muted)

   **Plan Anual (recomendado):**
   - Borde: 2px azul primario (destacado)
   - Badge "MEJOR VALOR" (arriba, fondo primario, texto blanco, pequeno)
   - Etiqueta: "Anual" (14px, bold)
   - Precio: "$29.99/ano" (24px, bold, primario)
   - Sub-etiqueta: "$2.49/mes — Ahorra 50%" (12px, primario)

7. **Boton Suscribirse** (ancho completo)
   - "Prueba Gratis 7 Dias" o "Suscribete Ahora"
   - Azul primario, grande, texto blanco bold
   - Si trial: "Prueba 7 dias gratis, luego $X/mes"

8. **Fila de Terminos** (centrado, texto pequeno)
   - Link "Restaurar Compras" (tappable)
   - Links "Terminos de Servicio" + "Politica de Privacidad"
   - Fuente: 11px, muted, subrayado

9. **Garantia** (elemento de confianza)
   - Icono Shield + "Cancela cuando quieras, sin preguntas"
   - Fuente: 12px, muted

##### Puntos donde aparece el Paywall
- Al tocar una funcion bloqueada (tendencias, dashboard de riesgo, insight IA, etc.)
- Al intentar subir un 2do examen en plan gratis
- Al tocar boton "Ser Pro" en Configuracion
- Despues del 3er mensaje de chat IA del dia
- Al tocar exportar en Configuracion

##### Mini Paywall (Banner Inline)
Tambien se necesita: un **banner pequeno inline** que aparece dentro de las pantallas cerca de funciones bloqueadas:
- Alto: ~60px
- Layout: Fila — Icono candado + texto "Desbloquea con Zyva Pro" + boton pequeno "Ser Pro"
- Fondo: primary10 o gold10
- Border radius: 12px
- Usado en: Home (cerca de secciones bloqueadas), Tendencias, Detalle de Biomarcador

---

### COMPONENTE PRINCIPAL: Mapa Corporal

Una silueta interactiva del cuerpo con 8 puntos de sistema:

| Sistema | Emoji | Posicion |
|---------|-------|----------|
| Tiroides | 🦋 | Area del cuello |
| Sangre e Inmunidad | 🩸 | Pecho izquierdo |
| Cardiovascular | ❤️ | Pecho centro |
| Vitaminas y Minerales | ✨ | Pecho derecho |
| Higado | 🟤 | Abdomen derecho |
| Metabolico | ⚡ | Abdomen centro |
| Rinones | 🫘 | Parte baja derecha |
| Hormonas | 💊 | Parte baja centro |

Cada punto es un circulo de color (verde/amarillo/rojo/gris) con animacion de pulso para los no-normales. Al tocar, muestra las pastillas de biomarcadores de ese sistema debajo del cuerpo.

---

## Lo que Necesito del Disenador

### 1. Screenshots que le Proporcionare
Se proporcionaran screenshots de la app actual. Para implementar las pantallas rediseñadas, necesito:

- **Mockups a pantalla completa** para cada una de las 12 pantallas (PNG o link de Figma)
- **Ambos estados** donde aplique: estado vacio + estado con datos
- **Ambos idiomas** no necesitan disenos separados — solo disenar en un idioma y yo manejo las traducciones

### 2. Requisitos de Formato de Assets

| Tipo de Asset | Formato | Notas |
|---------------|---------|-------|
| **Icono de app** | PNG 1024x1024 | Para App Store / Play Store |
| **Fondo del mapa corporal** | PNG o SVG | Actual es 484x970px PNG |
| **Splash screen** | PNG 1284x2778 (iPhone) | O proveer segun spec de Expo |
| **Ilustraciones custom** | SVG preferido, PNG @3x ok | Para estados vacios, onboarding |
| **Paleta de colores** | Codigos Hex | Mantener estructura semantica (primary, optimal, borderline, attention, etc.) |

### 3. Iconos
Usamos **Lucide Icons** (gratis, open source). El disenador puede:
- Explorar todos los iconos disponibles en https://lucide.dev/icons/
- Referenciar cualquier icono por nombre (ej: "Heart", "TrendingUp", "Shield")
- Si se necesita un icono custom que no existe en Lucide, proveerlo como **SVG, un solo color, viewBox 24x24**

### 4. Lo que Puedo Implementar Facilmente
- Cualquier cambio de color (solo dame los hex)
- Cualquier cambio de fuente (dame el nombre de la fuente, yo la instalo)
- Cualquier reordenamiento de layout (solo muestrame el nuevo orden)
- Animaciones (describir timing y easing)
- Nuevas secciones o tarjetas (solo muestrame el diseno)
- Fondos con gradiente
- Cambios de sombras y elevacion
- Cambios de border radius
- Cualquier cambio de icono Lucide

### 5. Lo que Requiere Mas Esfuerzo (pero se puede)
- Ilustraciones SVG custom (necesito el archivo SVG)
- Estilos custom de graficas/charts (necesito spec clara de que datos mostrar)
- Animaciones complejas (archivos Lottie JSON preferidos, o describir en detalle)
- Nuevos patrones de navegacion (nuevos tabs, modals, etc.)

### 6. Formato de Entrega (Ideal)
**Lo mejor**: Archivo Figma con:
- Un frame por pantalla
- Componentes para elementos reutilizables (tarjetas, botones, badges)
- Estilos de color que coincidan con nuestros nombres de tokens
- Auto-layout para poder ver valores de espaciado
- Assets listos para exportar marcados

**Tambien sirve**:
- Mockups PNG/PDF en alta resolucion con un doc de specs separado listando:
  - Colores (hex)
  - Espaciado (en px o dp)
  - Tamanos y pesos de fuente
  - Valores de border radius
  - Cualquier asset como archivos separados

---

## Referencia Rapida: Conteo de Pantallas

| Categoria | Pantallas | Detalle |
|-----------|-----------|---------|
| Onboarding | 4 | Bienvenida, Perfil, Objetivos, Cuenta |
| Tabs Principales | 4 | Home, Tendencias, Examenes, Configuracion |
| Tab Oculto | 1 | Chat IA |
| Pantallas de Detalle | 2 | Detalle Biomarcador, Detalle Examen |
| Suscripcion | 1 | Paywall / Upgrade Pro |
| **Total** | **12** | |

---

## Elementos de Gamificacion a Disenar

| Elemento | Donde se Usa | Descripcion |
|----------|-------------|-------------|
| Gauge de Score | Home, Tendencias | Gauge circular 0-100 |
| Badge de Nivel | Home | Nombre de nivel de score + barra de progreso (5 niveles: Atencion -> Elite) |
| Barra de XP | Home, Configuracion | Barra de progreso morada con numero de nivel |
| Tarjetas de Prioridad | Home | Tarjetas de salud accionables con badges de impacto |
| Tarjetas de Mision | Home | Tarjetas de quest con barra de progreso + recompensa XP |
| Badges de Logros | Home | 12 badges, desbloqueado (brillo dorado) vs bloqueado (atenuado) |
| Mapa de Cobertura | Home | 8 sistemas con barras de % |
| Cuadricula de Progreso | Home | 2x2 cajas de estadisticas |
| Simulacion de Mejora | Home, Tendencias | Comparacion Score Actual -> Proyectado |
| Tarjetas de Desbloqueo | Tendencias | "Sube 2do examen para desbloquear X" con iconos de candado |
| Tarjetas de Riesgo | Home | 3 tarjetas de nivel de riesgo lado a lado |
| Banner de Celebracion | Tendencias | "Tu score mejoro!" |
| Modal Paywall | Multiples | Pantalla completa de upgrade Pro con tarjetas de plan |
| Banner Inline Pro | Home, Tendencias, Detalle | Pequeno CTA inline "Desbloquea con Pro" |
| Badge Pro | Configuracion | Badge pequeno junto al nombre si esta suscrito |

---

## Resumen de Estados por Pantalla

Cada pantalla puede tener multiples estados visuales que el disenador debe cubrir:

| Pantalla | Estados |
|----------|---------|
| Home | Vacio (sin datos), Con datos, Con alertas criticas |
| Tendencias | Vacio, 1 examen (desbloqueo gamificado), 2+ examenes (completo), Score mejoro |
| Examenes | Vacio, Con historial, Selector de metodo, Subiendo, Procesando, Completado |
| Chat | Sin datos (CTA subir), Con datos (chips de preguntas), Escribiendo (typing) |
| Configuracion | Usuario Free, Usuario Pro |
| Detalle Biomarcador | Normal, Limite, Alto, Bajo, Con tendencia, Sin tendencia |
| Detalle Examen | Vista normal, Modo edicion |
| Suscripcion | Plan mensual seleccionado, Plan anual seleccionado, Ya es Pro |
