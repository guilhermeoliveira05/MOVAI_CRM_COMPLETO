/* ============================================
   MOVAI - Main JavaScript
   Animations, Carousel, Scroll Effects,
   Form Handlers, Chatbot, Toast Notifications
   ============================================ */

;(function () {
  'use strict';

  /* ---------- DOM Ready ---------- */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupNavbar();
    setupSmoothScroll();
    setupScrollReveal();
    setupCounterAnimation();
    setupCarousel();
    setupMobileNav();
    setupContactForm();
    setupScheduleVisitModal();
    setupPropertyCards();
    setupChatbot();
    setupHeroSearch();
  }

  /* ========================================
     TOAST NOTIFICATION SYSTEM
     ======================================== */
  function showToast(message, type = 'success', duration = 4000) {
    // Create container if not exists
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;top:90px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:10px;max-width:400px;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const icons = {
      success: 'fa-circle-check',
      error: 'fa-circle-xmark',
      warning: 'fa-triangle-exclamation',
      info: 'fa-circle-info',
    };
    const colors = {
      success: '#059669',
      error: '#DC2626',
      warning: '#D97706',
      info: '#2563EB',
    };

    toast.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;padding:14px 20px;background:#fff;border-radius:12px;
        box-shadow:0 8px 30px rgba(0,0,0,.12);border-left:4px solid ${colors[type]};
        animation:slideInRight .3s ease;font-size:14px;font-family:'Inter',sans-serif;">
        <i class="fa-solid ${icons[type]}" style="color:${colors[type]};font-size:18px;"></i>
        <span style="flex:1;color:#1e293b;">${message}</span>
        <button onclick="this.closest('div').parentElement.remove()" style="border:none;background:none;cursor:pointer;color:#94a3b8;font-size:16px;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOutRight .3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Add toast animations to page
  const toastStyle = document.createElement('style');
  toastStyle.textContent = `
    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
  `;
  document.head.appendChild(toastStyle);

  /* ========================================
     FORM VALIDATION HELPERS
     ======================================== */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return !phone || /^[\d\s\-\(\)\+]{8,}$/.test(phone);
  }

  function validateRequired(value) {
    return value && value.trim().length > 0;
  }

  function setFieldError(input, message) {
    input.classList.add('field-error');
    let errorEl = input.parentElement.querySelector('.error-message');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'error-message';
      errorEl.style.cssText = 'color:#DC2626;font-size:12px;margin-top:4px;display:block;';
      input.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  function clearFieldError(input) {
    input.classList.remove('field-error');
    const errorEl = input.parentElement.querySelector('.error-message');
    if (errorEl) errorEl.remove();
  }

  function clearFormErrors(form) {
    form.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
    form.querySelectorAll('.error-message').forEach(el => el.remove());
  }

  /* ========================================
     LOADING STATE HELPERS
     ======================================== */
  function setLoading(button, loading) {
    if (loading) {
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
      button.disabled = true;
      button.style.opacity = '0.7';
    } else {
      button.innerHTML = button.dataset.originalText || button.innerHTML;
      button.disabled = false;
      button.style.opacity = '1';
    }
  }

  /* ========================================
     1. NAVBAR — solid bg & shadow on scroll
     ======================================== */
  function setupNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ========================================
     2. SMOOTH SCROLL for anchor links
     ======================================== */
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        document.querySelector('.navbar')?.classList.remove('nav-open');
      });
    });
  }

  /* ========================================
     3. SCROLL REVEAL — Intersection Observer
     ======================================== */
  function setupScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ========================================
     4. COUNTER ANIMATION for stats
     ======================================== */
  function setupCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString('pt-BR') + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ========================================
     5. PROPERTY CAROUSEL
     ======================================== */
  function setupCarousel() {
    const track = document.querySelector('.carousel-track');
    if (!track) return;

    const cards = track.querySelectorAll('.property-card');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dotsContainer = document.querySelector('.carousel-dots');

    let currentIndex = 0;
    let cardsPerView = getCardsPerView();
    let totalPages = Math.ceil(cards.length / cardsPerView);
    let autoPlayTimer;

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
        dot.setAttribute('aria-label', `Página ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function goTo(index) {
      if (index < 0) index = totalPages - 1;
      if (index >= totalPages) index = 0;
      currentIndex = index;

      const card = cards[0];
      if (!card) return;
      const gap = parseFloat(getComputedStyle(track).gap) || 24;
      const cardWidth = card.offsetWidth + gap;
      const offset = currentIndex * cardsPerView * cardWidth;
      track.style.transform = `translateX(-${offset}px)`;

      updateDots();
      resetAutoPlay();
    }

    function next() { goTo(currentIndex + 1); }
    function prev() { goTo(currentIndex - 1); }

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    function startAutoPlay() {
      autoPlayTimer = setInterval(next, 5000);
    }
    function resetAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }

    function getCardsPerView() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function handleResize() {
      const newPerView = getCardsPerView();
      if (newPerView !== cardsPerView) {
        cardsPerView = newPerView;
        totalPages = Math.ceil(cards.length / cardsPerView);
        currentIndex = 0;
        goTo(0);
        buildDots();
      }
    }

    window.addEventListener('resize', debounce(handleResize, 250));

    let touchStartX = 0;
    let touchEndX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
      }
    }, { passive: true });

    buildDots();
    startAutoPlay();
  }

  /* ========================================
     6. MOBILE NAV TOGGLE
     ======================================== */
  function setupMobileNav() {
    const toggle = document.querySelector('.navbar-toggle');
    const navbar = document.querySelector('.navbar');
    if (!toggle || !navbar) return;

    toggle.addEventListener('click', () => {
      navbar.classList.toggle('nav-open');
    });
  }

  /* ========================================
     7. CONTACT FORM HANDLER
     ======================================== */
  function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormErrors(form);

      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const phone = form.querySelector('[name="phone"]').value.trim();
      const message = form.querySelector('[name="message"]').value.trim();

      // Validation
      let valid = true;
      if (!validateRequired(name)) {
        setFieldError(form.querySelector('[name="name"]'), 'Nome é obrigatório');
        valid = false;
      }
      if (!validateRequired(email)) {
        setFieldError(form.querySelector('[name="email"]'), 'Email é obrigatório');
        valid = false;
      } else if (!validateEmail(email)) {
        setFieldError(form.querySelector('[name="email"]'), 'Email inválido');
        valid = false;
      }
      if (phone && !validatePhone(phone)) {
        setFieldError(form.querySelector('[name="phone"]'), 'Telefone inválido');
        valid = false;
      }
      if (!validateRequired(message)) {
        setFieldError(form.querySelector('[name="message"]'), 'Mensagem é obrigatória');
        valid = false;
      }

      if (!valid) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      setLoading(submitBtn, true);

      try {
        await MovaiAPI.leads.create({
          name,
          email,
          phone,
          message,
          source: 'website',
        });
        showToast('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
        form.reset();
      } catch (err) {
        showToast(err.message || 'Erro ao enviar mensagem. Tente novamente.', 'error');
      } finally {
        setLoading(submitBtn, false);
      }
    });
  }

  /* ========================================
     8. SCHEDULE VISIT MODAL
     ======================================== */
  function setupScheduleVisitModal() {
    const modal = document.getElementById('schedule-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    const form = document.getElementById('schedule-form');

    // Close handlers
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    if (overlay) overlay.addEventListener('click', () => closeModal(modal));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal(modal);
    });

    // Open handlers (delegate to document for dynamic buttons)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-schedule-visit');
      if (btn) {
        e.preventDefault();
        const propertyId = btn.dataset.propertyId || '';
        const propertyTitle = btn.dataset.propertyTitle || '';
        const idField = form.querySelector('[name="property_id"]');
        const titleField = modal.querySelector('.modal-property-title');
        if (idField) idField.value = propertyId;
        if (titleField) titleField.textContent = propertyTitle;
        openModal(modal);
      }
    });

    // Form submit
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormErrors(form);

        const name = form.querySelector('[name="name"]').value.trim();
        const email = form.querySelector('[name="email"]').value.trim();
        const phone = form.querySelector('[name="phone"]').value.trim();
        const date = form.querySelector('[name="date"]').value;
        const time = form.querySelector('[name="time"]').value;
        const propertyId = form.querySelector('[name="property_id"]').value;
        const notes = form.querySelector('[name="notes"]')?.value.trim() || '';

        // Validation
        let valid = true;
        if (!validateRequired(name)) {
          setFieldError(form.querySelector('[name="name"]'), 'Nome é obrigatório');
          valid = false;
        }
        if (email && !validateEmail(email)) {
          setFieldError(form.querySelector('[name="email"]'), 'Email inválido');
          valid = false;
        }
        if (!date) {
          setFieldError(form.querySelector('[name="date"]'), 'Data é obrigatória');
          valid = false;
        }
        if (!time) {
          setFieldError(form.querySelector('[name="time"]'), 'Horário é obrigatório');
          valid = false;
        }

        if (!valid) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        setLoading(submitBtn, true);

        try {
          await MovaiAPI.appointments.publicCreate({
            name,
            email,
            phone,
            property_id: propertyId ? parseInt(propertyId) : null,
            date,
            time,
            notes,
          });
          showToast('Visita agendada com sucesso! Entraremos em contato para confirmar.', 'success');
          form.reset();
          closeModal(modal);
        } catch (err) {
          showToast(err.message || 'Erro ao agendar visita. Tente novamente.', 'error');
        } finally {
          setLoading(submitBtn, false);
        }
      });
    }
  }

  function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ========================================
     9. PROPERTY CARD LINKS
     ======================================== */
  function setupPropertyCards() {
    // Make property cards clickable to go to detail page
    document.querySelectorAll('.property-card').forEach(card => {
      const propertyId = card.dataset.propertyId;
      if (!propertyId) return;

      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        // Don't navigate if clicking favorite or schedule button
        if (e.target.closest('.property-favorite') || e.target.closest('.btn-schedule-visit')) return;
        window.location.href = `imovel.html?id=${propertyId}`;
      });
    });
  }

  /* ========================================
     10. HERO SEARCH
     ======================================== */
  function setupHeroSearch() {
    const form = document.querySelector('.hero-search');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const selects = form.querySelectorAll('select');
      const input = form.querySelector('input');

      const type = selects[0]?.value || '';
      const location = input?.value || '';
      const price = selects[1]?.value || '';

      // Build query params for a future properties listing page
      const params = new URLSearchParams();
      if (type) params.set('type', type.toLowerCase());
      if (location) params.set('location', location);
      if (price) params.set('price', price);

      // For now, scroll to properties section
      const propertiesSection = document.getElementById('properties');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      showToast('Busca realizada! Confira os imóveis em destaque abaixo.', 'info');
    });
  }

  /* ========================================
     11. CHATBOT INTEGRATION
     ======================================== */
  function setupChatbot() {
    const fab = document.querySelector('.chatbot-fab');
    if (!fab) return;

    // Remove the href redirect, replace with chatbot panel
    fab.removeAttribute('onclick');
    fab.addEventListener('click', toggleChatbot);

    // Build chatbot panel
    buildChatbotPanel();
  }

  let chatConversationId = null;
  let chatMessages = [];

  function buildChatbotPanel() {
    const panel = document.createElement('div');
    panel.id = 'chatbot-panel';
    panel.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-header-info">
          <div class="chatbot-avatar"><i class="fa-solid fa-robot"></i></div>
          <div>
            <strong>MOVAI Assistente</strong>
            <small>Online agora</small>
          </div>
        </div>
        <button class="chatbot-close" aria-label="Fechar chat"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages">
        <div class="chat-message bot">
          <div class="chat-bubble">Olá! 👋 Sou o assistente virtual da MOVAI. Como posso ajudar você hoje?<br><br>
            Posso ajudar com:<br>
            • Informações sobre imóveis<br>
            • Agendamento de visitas<br>
            • Dúvidas sobre financiamento<br>
            • Falar com um corretor
          </div>
        </div>
      </div>
      <div class="chatbot-input-area">
        <input type="text" id="chatbot-input" placeholder="Digite sua mensagem..." autocomplete="off">
        <button id="chatbot-send" aria-label="Enviar"><i class="fa-solid fa-paper-plane"></i></button>
      </div>
    `;
    document.body.appendChild(panel);

    // Events
    panel.querySelector('.chatbot-close').addEventListener('click', toggleChatbot);
    const input = panel.querySelector('#chatbot-input');
    const sendBtn = panel.querySelector('#chatbot-send');

    sendBtn.addEventListener('click', () => sendChatMessage(input));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChatMessage(input);
    });
  }

  function toggleChatbot() {
    const panel = document.getElementById('chatbot-panel');
    if (panel) {
      panel.classList.toggle('active');
      if (panel.classList.contains('active')) {
        panel.querySelector('#chatbot-input')?.focus();
      }
    }
  }

  async function sendChatMessage(input) {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendChatMessage('user', text);

    // Save message
    const userMsg = { role: 'user', content: text };
    chatMessages.push(userMsg);

    // Process locally (simple keyword bot)
    const botReply = generateBotReply(text);

    // Show typing indicator
    const typingEl = appendChatMessage('bot', '<i class="fa-solid fa-ellipsis fa-beat"></i>', true);

    setTimeout(async () => {
      typingEl.remove();
      appendChatMessage('bot', botReply);
      chatMessages.push({ role: 'bot', content: botReply });

      // Save conversation to backend
      try {
        if (!chatConversationId) {
          const res = await MovaiAPI.chatbot.createConversation({
            messages: chatMessages,
            status: 'ativo',
          });
          chatConversationId = res.data?.id;
        } else {
          await MovaiAPI.chatbot.addMessage(chatConversationId, {
            role: 'bot',
            content: botReply,
          });
        }
      } catch (e) {
        // Silently fail - chatbot should work even without backend
        console.warn('Chatbot API save failed:', e.message);
      }
    }, 800 + Math.random() * 700);
  }

  function appendChatMessage(role, content, isTyping = false) {
    const container = document.getElementById('chatbot-messages');
    if (!container) return null;

    const div = document.createElement('div');
    div.className = `chat-message ${role}${isTyping ? ' typing' : ''}`;
    div.innerHTML = `<div class="chat-bubble">${content}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  function generateBotReply(text) {
    const lower = text.toLowerCase();

    if (lower.includes('visita') || lower.includes('agendar') || lower.includes('agendamento')) {
      return 'Para agendar uma visita, clique no botão <strong>"Agendar Visita"</strong> em qualquer imóvel, ou preencha o formulário na seção de contato! 📅';
    }
    if (lower.includes('preço') || lower.includes('valor') || lower.includes('custo') || lower.includes('financ')) {
      return 'Temos imóveis a partir de R$ 200.000. Para financiamento, trabalhamos com os principais bancos e taxas a partir de 8,5% a.a. Quer saber mais sobre alguma faixa de preço? 💰';
    }
    if (lower.includes('apartamento') || lower.includes('casa') || lower.includes('imóvel') || lower.includes('imovel')) {
      return 'Temos diversas opções de imóveis! Confira nossos <strong>destaques</strong> na página principal ou use a busca inteligente no topo do site. Posso ajudar com algo específico? 🏠';
    }
    if (lower.includes('corretor') || lower.includes('falar') || lower.includes('contato') || lower.includes('humano')) {
      return 'Claro! Você pode falar com um corretor preenchendo o formulário de contato abaixo, ou ligue para <strong>(11) 9999-0000</strong>. Horário de atendimento: Seg a Sex, 8h às 18h. 📞';
    }
    if (lower.includes('localiz') || lower.includes('cidade') || lower.includes('bairro') || lower.includes('onde')) {
      return 'Atuamos em mais de 15 cidades, com foco em São Paulo, Campinas, Curitiba e Florianópolis. Em qual região você está buscando? 📍';
    }
    if (lower.includes('olá') || lower.includes('oi') || lower.includes('bom dia') || lower.includes('boa tarde') || lower.includes('boa noite') || lower.includes('hey')) {
      return 'Olá! Tudo bem? 😊 Como posso ajudar você hoje? Estou aqui para tirar dúvidas sobre imóveis, agendar visitas ou conectar você com um corretor!';
    }
    if (lower.includes('obrigad')) {
      return 'Por nada! Fico feliz em ajudar! 😊 Se precisar de mais alguma coisa, é só perguntar!';
    }

    return 'Entendi! Para melhor atendimento, sugiro:<br>• Usar a <strong>busca inteligente</strong> no topo da página<br>• Preencher o <strong>formulário de contato</strong> para falar com um corretor<br>• Agendar uma <strong>visita online</strong> no imóvel desejado<br><br>Posso ajudar com algo mais específico? 🤔';
  }

  /* ========================================
     UTILITY — debounce
     ======================================== */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

})();
