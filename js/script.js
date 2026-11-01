document.addEventListener('DOMContentLoaded', async () => {
  const defaultEventConfig = {
    whatsappHostNumber: '5037616505',
    venueName: 'Santa Ana',
    venueAddress: 'XCVV+W76, Avenida Independencia Sur, Santa Ana, El Salvador',
    mapSearchQuery: 'Parque Libertad, Santa Ana',
    eventDate: 'Sábado, 20 de noviembre de 2026',
    eventTime: '4:00 PM',
    giftTitle: 'Mesa de Regalos / Lluvia de Sobres',
    giftMessage: 'Tu presencia es nuestro mejor regalo (Lluvia de Sobres)'
  };
  let eventConfig = defaultEventConfig;
  const envelope = document.getElementById('envelope');
  const cardInner = document.getElementById('cardInner');
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpButton = document.getElementById('rsvpBtn');
  const guestNameInput = document.getElementById('guestName');
  const guestCountInput = document.getElementById('guestCount');
  const confirmation = document.getElementById('rsvpConfirmation');
  const confirmationText = document.getElementById('rsvpConfirmationText');
  const markConfirmedButton = document.getElementById('markConfirmedBtn');
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  const configWarning = document.getElementById('configWarning');
  const themeStorageKey = 'baby-shower-theme-v1';
  const guestStorageKey = 'baby-shower-guest-state-v1';

  document.getElementById('localManagerLink').hidden =
    !['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

  function applyEventConfig(config) {
    eventConfig = config;
    document.getElementById('venueName').firstChild.textContent = config.venueName;
    document.getElementById('venueAddress').textContent = config.venueAddress;
    document.getElementById('eventDate').textContent = config.eventDate;
    document.getElementById('eventTime').textContent = config.eventTime;
    document.getElementById('giftTitle').textContent = config.giftTitle;
    document.getElementById('giftMessage').textContent = config.giftMessage;
    document.getElementById('mapLink').href =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.mapSearchQuery)}`;
  }

  async function loadEventConfig() {
    try {
      const response = await fetch('event-config.json', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`No se pudo cargar la configuración del evento (HTTP ${response.status}).`);
      }
      const config = await response.json();
      const fields = Object.keys(defaultEventConfig);
      if (config?.version !== 1 || fields.some(field => typeof config[field] !== 'string')) {
        throw new Error('El archivo event-config.json no tiene la estructura esperada.');
      }
      applyEventConfig(config);
    } catch (error) {
      console.error('Error al cargar los datos de la invitación:', error);
      applyEventConfig(defaultEventConfig);
      configWarning.textContent =
        'No se pudieron cargar los datos publicados del evento. Se muestran los valores locales de respaldo.';
      configWarning.hidden = false;
    }
  }

  let guestState = {
    guestName: '',
    guestCount: 1,
    whatsappOpened: false,
    confirmedAt: null
  };
  let storageWarning = '';

  function showStorageError(message) {
    storageWarning = message;
    confirmation.hidden = false;
    confirmation.classList.add('is-error');
    confirmationText.textContent = message;
  }

  function saveGuestState() {
    try {
      localStorage.setItem(guestStorageKey, JSON.stringify(guestState));
      storageWarning = '';
      return true;
    } catch (error) {
      console.error('No se pudo guardar la respuesta de la invitación:', error);
      showStorageError('No se pudo guardar en este dispositivo. Aún puedes confirmar por WhatsApp.');
      return false;
    }
  }

  function loadGuestState() {
    try {
      const savedState = localStorage.getItem(guestStorageKey);
      if (!savedState) return;
      const parsedState = JSON.parse(savedState);
      if (!parsedState || typeof parsedState !== 'object' || Array.isArray(parsedState)) {
        throw new Error('El estado guardado de la invitación no tiene un formato válido.');
      }

      guestState = {
        guestName: typeof parsedState.guestName === 'string'
          ? parsedState.guestName.slice(0, 80)
          : '',
        guestCount: Number.isInteger(parsedState.guestCount)
          ? Math.min(20, Math.max(1, parsedState.guestCount))
          : 1,
        whatsappOpened: parsedState.whatsappOpened === true,
        confirmedAt: typeof parsedState.confirmedAt === 'string'
          ? parsedState.confirmedAt
          : null
      };
    } catch (error) {
      console.error('No se pudo recuperar la respuesta guardada:', error);
      showStorageError('No se pudo recuperar la respuesta guardada en este dispositivo.');
    }
  }

  function applyTheme(theme, persist = true) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', `Activar modo ${isDark ? 'claro' : 'oscuro'}`);
    themeToggle.title = `Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`;
    themeLabel.textContent = `Modo ${isDark ? 'claro' : 'oscuro'}`;
    document.querySelector('meta[name="theme-color"]')
      .setAttribute('content', isDark ? '#111827' : '#f5f3f0');

    if (!persist) return;
    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch (error) {
      console.error('No se pudo guardar el tema de la invitación:', error);
      showStorageError('No se pudo guardar la preferencia del tema en este dispositivo.');
    }
  }

  function renderGuestState() {
    confirmation.classList.remove('is-error');
    guestNameInput.value = guestState.guestName;
    guestCountInput.value = String(guestState.guestCount);

    if (storageWarning) {
      confirmationText.textContent = storageWarning;
      confirmation.hidden = false;
      return;
    }

    if (guestState.confirmedAt) {
      const name = guestState.guestName ? `, ${guestState.guestName}` : '';
      confirmationText.textContent = `Confirmación marcada como enviada${name}. Se guardó en este dispositivo.`;
      confirmation.hidden = false;
      markConfirmedButton.hidden = true;
      rsvpButton.querySelector('span').textContent = 'Actualizar por WhatsApp';
    } else if (guestState.whatsappOpened) {
      confirmationText.textContent =
        'WhatsApp se abrió. Cuando termines de enviar el mensaje, marca tu confirmación aquí.';
      confirmation.hidden = false;
      markConfirmedButton.hidden = false;
      rsvpButton.querySelector('span').textContent = 'Enviar de nuevo por WhatsApp';
    } else {
      confirmation.hidden = true;
      markConfirmedButton.hidden = true;
      rsvpButton.querySelector('span').textContent = 'Enviar por WhatsApp';
    }
  }

  loadGuestState();

  await loadEventConfig();

  let initialTheme = 'light';
  try {
    const storedTheme = localStorage.getItem(themeStorageKey);
    if (storedTheme === 'light' || storedTheme === 'dark') initialTheme = storedTheme;
  } catch (error) {
    console.error('No se pudo recuperar el tema de la invitación:', error);
    showStorageError('No se pudo recuperar el tema guardado en este dispositivo.');
  }
  applyTheme(initialTheme, false);
  renderGuestState();

  themeToggle.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  envelope.addEventListener('click', () => {
    envelope.disabled = true;
    envelope.classList.add('opening');

    window.setTimeout(() => {
      envelope.hidden = true;
      cardInner.hidden = false;
      window.requestAnimationFrame(() => {
        cardInner.classList.add('visible');
        cardInner.focus({ preventScroll: true });
        launchConfetti();
      });
    }, 620);
  });

  function saveGuestDraft() {
    guestState.guestName = guestNameInput.value.trim();
    guestState.guestCount = Number(guestCountInput.value) || 1;
    if (guestState.confirmedAt) {
      guestState.confirmedAt = null;
      guestState.whatsappOpened = false;
    }
    saveGuestState();
    renderGuestState();
  }

  guestNameInput.addEventListener('input', saveGuestDraft);
  guestCountInput.addEventListener('input', saveGuestDraft);

  rsvpForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!rsvpForm.reportValidity()) return;

    guestState.guestName = guestNameInput.value.trim();
    guestState.guestCount = Number(guestCountInput.value);
    guestState.whatsappOpened = true;
    guestState.confirmedAt = null;
    saveGuestState();
    renderGuestState();

    const message = encodeURIComponent(
      `¡Hola! Confirmo mi asistencia al Baby Shower.\n\nMi nombre es: ${guestState.guestName}\nPersonas que asistirán: ${guestState.guestCount}\n\n¡Muchas gracias por la invitación!`
    );
    window.open(
      `https://wa.me/${eventConfig.whatsappHostNumber}?text=${message}`,
      '_blank',
      'noopener,noreferrer'
    );
  });

  markConfirmedButton.addEventListener('click', () => {
    guestState.guestName = guestNameInput.value.trim();
    guestState.guestCount = Number(guestCountInput.value) || 1;
    guestState.confirmedAt = new Date().toISOString();
    guestState.whatsappOpened = true;
    saveGuestState();
    renderGuestState();
  });

  function launchConfetti() {
    if (typeof confetti !== 'function'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    confetti({
      particleCount: 90,
      spread: 72,
      startVelocity: 32,
      origin: { y: 0.62 },
      colors: ['#78b8b2', '#e7aa9e', '#e8c781', '#fff8ed'],
      disableForReducedMotion: true
    });
  }
});
