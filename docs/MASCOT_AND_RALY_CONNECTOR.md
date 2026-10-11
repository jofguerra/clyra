# Acompañante y conector local de Raly

## Mascota

El corazón original acompaña el recorrido en una franja reservada que no tapa
controles ni valores. Cambia de pose y mensaje según la pantalla, saluda al tocarlo,
celebra estudios guardados y acciones que otorgan XP y descansa tras 45 segundos
sin cambiar de pantalla o reacción. Las celebraciones duran 3,5 segundos; no
celebra valores clínicos ni interpreta que un resultado significa buena salud.

El botón de pausa silencia sus reacciones durante la sesión. Las animaciones del
componente Mascot respetan la preferencia del sistema de reducir movimiento y se
detienen cuando la app nativa pasa a segundo plano. Se limpian al cambiar de estado
o desmontar. La respiración combina flotación suave y escala, y los saludos usan
balanceo. Los dibujos originales permanecen completos: no hay aún un rig que mueva
cada brazo, ojo o boca por separado.

## Conexión local experimental

Hay una implementación de conector y pantalla, pero **el inicio de sesión con una
cuenta real no ha sido validado**. El portal no proporciona una API pública
confirmada; el adaptador usa el formulario y listado observados. Si cambia el
portal, aparece MFA/CAPTCHA o se rechaza el acceso, no intenta eludir esos controles.
Se conserva la alternativa de descargar el PDF del portal e importarlo manualmente.

Necesita Node y las dependencias de desarrollo del repositorio. Ejecutar en la
misma computadora que el navegador del usuario:

```sh
npm ci
npx playwright install chromium
npm run raly:connector
```

Para Chromium instalado por el sistema:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run raly:connector
```

En otra terminal, iniciar el app en el puerto admitido:

```sh
EXPO_PUBLIC_LOCAL_MODE=true npm run web -- --localhost --port 8090
```

1. Abrir el archivo local `.raly-connector-token` y copiar su clave en
   **Exámenes → Conectar Raly**. No compartirla por chat ni subirla a Git.
2. Introducir las credenciales de Raly en esa pantalla. La contraseña no se
   persiste. Al terminar la solicitud se limpia del formulario.
3. Confirmar que los estudios pertenecen a la persona del perfil actual. No hay
   selección automática de dependientes.
4. Seleccionar **Descargar y revisar**. El archivo pasa en memoria al lector local
   existente; revisar y confirmar cada resultado antes de guardar.
5. Volver a la pantalla de Raly para actualizar o desconectar. Una recarga del app
   pierde la conexión del cliente; la sesión del servicio expira en 15 minutos o
   al detenerlo. Desconectar destruye el contexto local y sus cookies; no se ha
   validado la revocación de sesión en el servidor remoto de Raly.

El servicio escucha únicamente en `127.0.0.1:8098`, valida Host/Origin, exige una
clave aleatoria de emparejamiento y separa la sesión mediante otro identificador.
Admite por defecto los orígenes `http://localhost:8090` y
`http://127.0.0.1:8090`. Para otro puerto de desarrollo, configurar
`CLYRA_APP_ORIGINS` con los orígenes exactos separados por comas al arrancar.
Las cookies, contraseñas y URLs firmadas no se guardan en disco ni se devuelven a
la UI. Las descargas aceptan únicamente identificadores del listado actual y
PDF de hasta 10 MB. El extractor conserva el límite de 30 páginas.

Un app abierto desde HTTPS/cloud no equivale a este despliegue local: el navegador
puede bloquear el acceso a loopback. No exponer el puerto públicamente. Un servicio
multiusuario requiere HTTPS, autenticación propia, aislamiento y almacenamiento de
sesiones diseñado para ese entorno. Esta versión no implementa sincronización
periódica ni importación PDF nativa.

## Pruebas

- `npm run typecheck`
- `npm run test:connector`: origen, emparejamiento, sesión, caducidad, desconexión,
  sanitización de errores y restricción de enlaces. Usa un adaptador sintético.
- `npm run test:local`: incluye acompañante a 320 px y flujo de descarga simulada
  de Raly hasta revisión obligatoria del PDF, sin guardar credenciales.

Estas pruebas no establecen que la autenticación real de Raly funcione. Ese paso
requiere una sesión autorizada introducida por el usuario en la interfaz local.

## Capturas y resultado de la revisión

- [Inicio con acompañante](companion-review/home.png)
- [Conexión local de Raly](companion-review/raly.png)

La suite local completa pasó 40 pruebas antes de los últimos ajustes menores.
La revisión dirigida añade la comprobación de movimiento reducido y vuelve a
verificar saludo, pausa, descarga sintética, revisión y desconexión. TypeScript y
las exportaciones JavaScript web/iOS/Android pasaron; esto no sustituye pruebas en
un dispositivo nativo ni el acceso autenticado real a Raly.
