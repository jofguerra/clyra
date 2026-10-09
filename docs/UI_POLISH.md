# Pulido visual de Clyra

Se unificaron la tipografía, los fondos claros, los bordes y el acento rosa. La navegación inferior ahora utiliza una barra flotante con estados seleccionados accesibles. Inicio tiene un encabezado compacto con la mascota completa, el puntaje aparece inmediatamente y su explicación puede desplegarse.

La tarjeta de puntos utiliza un fondo oscuro para destacar el total y su progreso. Acciones, Tendencias, el mapa corporal y Exámenes tienen espacios y tarjetas más consistentes.

## Capturas

Capturas móviles de 390 px con datos sintéticos de prueba:

- [Inicio](ui-polish/home.png)
- [Acciones y puntos](ui-polish/activity.png)
- [Tendencias](ui-polish/progress.png)

## Validación

- Suite local completa: 38 pruebas aprobadas durante este pase.
- Después de los últimos ajustes: las 5 pruebas de revisión visual aprobaron, incluyendo pantallas a 320 y 1280 px, animación local, exportación de datos y confirmaciones.
- Comprobación manual de la explicación desplegable del puntaje y navegación a Acciones.
- TypeScript y exportación de paquetes web, iOS y Android completados.
- Sin errores de espacios en `git diff --check`.

La exportación nativa verifica la compilación de los paquetes; no equivale a una prueba en dispositivos iOS o Android. El puntaje sigue siendo orientativo, sin validación clínica.
