# Invitación Interactiva de Baby Shower

Invitación estática y adaptable para publicar en GitHub Pages. Incluye apertura
animada del sobre, confeti opcional, botones de ubicación y confirmación, y un
selector de tema claro/oscuro cuya preferencia se guarda en el navegador. Los
estilos son propios e inspirados en componentes limpios tipo Bootstrap, por lo
que no requieren cargar AdminLTE ni Bootstrap desde el servidor local.

## Estructura

```
├── index.html
├── event-config.json
├── README.md
├── css/
│   └── style.css
├── img/
│   └── (imagen de portada opcional, administrada desde el gestor)
└── js/
    └── script.js
```

Los pictogramas de la invitación son SVG integrados y no usan emojis ni requieren
una librería de iconos externa.

## Imagen de fondo del sobre

Para personalizar la portada cerrada, selecciona una imagen JPG, PNG o WebP
desde **Imagen de portada** en el gestor local y publícala junto con los demás
cambios. Se limita a 8 MB y 25 megapíxeles. El gestor actualiza la ruta en los
estilos y agrega un identificador de caché; el degradado suave se conserva
encima de la imagen y la tarjeta abierta no cambia. Puedes quitarla desde el
gestor para volver al fondo predeterminado.

## Gestor local y publicación

El repositorio para GitHub Pages es `openlotussv/invitacion-babyshower`, con
rama `main`. Créalo en GitHub; puede contener solo el README para empezar. El
gestor local está en `http://localhost/invitacion_babyshower_admin/` y no se
incluye en el repositorio público.

La primera vez, crea un token fine-grained limitado a ese repositorio con
`Contents: Read and write`; introdúcelo en el gestor local. El token se guarda
fuera de `htdocs` y nunca se publica. **Publicar por primera vez** agrega la
invitación al repositorio, incluso si solo tiene un README. En las siguientes
publicaciones, el gestor compara los archivos locales con la rama `main`, lista
las diferencias y pide confirmación si un archivo también fue cambiado en
GitHub. Los archivos que el gestor no administra se conservan.

Se publican `index.html`, `css/style.css`, `js/script.js`, `event-config.json`,
`README.md` y la imagen de portada seleccionada. Los cambios se guardan primero
en esta computadora. Para servir la página, configura GitHub Pages una vez en
**Settings → Pages**, usando `main` y la carpeta raíz (`/(root)`), si aún no está
habilitado.

El archivo `event-config.json` contiene los datos visibles del evento y se
publica junto con la tarjeta. El menú **Administrar** solo aparece al visitar el
sitio desde `localhost`; no aparece en GitHub Pages.

## Configuración antes de compartir

En el gestor local puedes editar estos datos sin cambiar código:

- `whatsappHostNumber`: WhatsApp del organizador, con código internacional, solo
  dígitos y sin el signo `+`.
- `venueName` y `venueAddress`: nombre y dirección del lugar.
- `mapSearchQuery`: dirección o nombre que abrirá Google Maps.
- `eventDate` y `eventTime`: fecha y hora mostradas.
- `giftTitle` y `giftMessage`: tipo de regalo y mensaje correspondiente.

El botón de RSVP abre WhatsApp con el nombre y la cantidad de asistentes; la
persona debe pulsar **Enviar**. Al volver a la invitación puede marcar que ya
envió su respuesta. Cada invitación es individual: la cantidad está fija en una
persona. El campo acepta nombre y apellido; los espacios se conservan mientras
se escribe.

El tema, el borrador de RSVP y la confirmación marcada se guardan en `localStorage`
del navegador y dispositivo de cada invitado. Al recargar, la invitación vuelve
a mostrarse cerrada para que puedan abrirla de nuevo; al abrirla, los datos del
RSVP guardados siguen disponibles. No se envían a GitHub Pages ni se comparten
con el organizador o con otros dispositivos.
Para recibir y reunir confirmaciones, cada invitado debe enviar el mensaje por
WhatsApp; una recopilación automática requeriría un servidor o un servicio de
formularios.
