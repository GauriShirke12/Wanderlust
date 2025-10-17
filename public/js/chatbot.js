(() => {
  const root = document.getElementById('chatbot-root');
  if (!root) {
    return;
  }

  const panel = root.querySelector('[data-chatbot-panel]');
  const toggleButton = root.querySelector('[data-chatbot-toggle]');
  const closeButton = root.querySelector('[data-chatbot-close]');
  const messagesEl = root.querySelector('[data-chatbot-messages]');
  const form = root.querySelector('[data-chatbot-form]');
  const input = root.querySelector('[data-chatbot-input]');

  const dataScript = document.getElementById('listing-chatbot-data');
  let listingData = null;

  if (dataScript && dataScript.textContent) {
    try {
      listingData = JSON.parse(dataScript.textContent);
    } catch (error) {
      listingData = null;
    }
  }

  const isListingDetailRoute = () => {
    if (listingData) {
      return true;
    }
    return /^\/listings\/[A-Za-z0-9]+/.test(window.location.pathname);
  };

  if (!isListingDetailRoute()) {
    root.style.display = 'none';
    root.setAttribute('aria-hidden', 'true');
    return;
  }

  let hasWelcomed = false;

  const timestamp = () => {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date());
  };

  const appendMessage = (text, author) => {
    const bubble = document.createElement('div');
    bubble.className = author === 'user' ? 'chatbot-message user' : 'chatbot-message bot';
    bubble.textContent = text;

    const stamp = document.createElement('small');
    stamp.textContent = timestamp();
    bubble.appendChild(stamp);

    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  const listingSummary = () => {
    if (!listingData) {
      return null;
    }
    const parts = [];
    if (listingData.title) {
      parts.push(`You are exploring "${listingData.title}".`);
    }
    if (typeof listingData.price === 'number') {
      parts.push(`The nightly rate is $${listingData.price.toLocaleString()}.`);
    }
    if (listingData.location) {
      parts.push(`It is located in ${listingData.location}.`);
    }
    if (listingData.owner) {
      parts.push(`Hosted by ${listingData.owner}.`);
    }
    if (!parts.length) {
      return null;
    }
    return parts.join(' ');
  };

  const createBotReply = (raw) => {
    const text = raw.trim().toLowerCase();
    if (!text) {
      return "Could you let me know what you would like help with?";
    }

    if (/price|cost|rate/.test(text) && listingData && typeof listingData.price === 'number') {
      return `This stay is currently listed at $${listingData.price.toLocaleString()} per night.`;
    }

    if (/owner|host/.test(text) && listingData && listingData.owner) {
      return `${listingData.owner} is the host for this stay.`;
    }

    if ((/where|located|location/.test(text)) && listingData && listingData.location) {
      return `The listing is located in ${listingData.location}.`;
    }

    if (/available|book|date|night/.test(text)) {
      return 'Availability varies; please use the booking form to select dates that work for you.';
    }

    if (/amenit|facility|feature/.test(text)) {
      return 'You can find amenity details within the listing description. Feel free to ask if you need clarification on something specific!';
    }

    return "Thanks for your message! I will forward it to the host so they can follow up soon.";
  };

  const ensureWelcome = () => {
    if (hasWelcomed) {
      return;
    }
    hasWelcomed = true;
    appendMessage('Hi there! I am your stay assistant. Ask me anything about this place.', 'bot');
    const summary = listingSummary();
    if (summary) {
      setTimeout(() => {
        appendMessage(summary, 'bot');
      }, 400);
    }
  };

  const setOpenState = (open) => {
    root.classList.toggle('is-open', open);
    toggleButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      ensureWelcome();
      window.requestAnimationFrame(() => {
        input.focus();
      });
    }
  };

  toggleButton.addEventListener('click', () => {
    const willOpen = !root.classList.contains('is-open');
    setOpenState(willOpen);
  });

  closeButton.addEventListener('click', () => {
    setOpenState(false);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) {
      return;
    }
    appendMessage(value, 'user');
    input.value = '';
    setTimeout(() => {
      appendMessage(createBotReply(value), 'bot');
    }, 450);
  });

  setOpenState(true);
})();
