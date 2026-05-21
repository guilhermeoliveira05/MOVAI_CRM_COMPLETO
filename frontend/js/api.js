/* ============================================
   MOVAI - API Client
   Centralized fetch wrapper for backend API
   ============================================ */

const MovaiAPI = (function () {
  'use strict';

  const BASE_URL = 'http://localhost:3001/api';

  /* ---------- Core Fetch Wrapper ---------- */
  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('movai_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Erro na requisição');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Erro de conexão. Verifique se o servidor está rodando.');
      }
      throw err;
    }
  }

  /* ---------- HTTP Methods ---------- */
  function get(endpoint) {
    return request(endpoint, { method: 'GET' });
  }

  function post(endpoint, body) {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  function put(endpoint, body) {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  function del(endpoint) {
    return request(endpoint, { method: 'DELETE' });
  }

  /* ---------- Leads API ---------- */
  const leads = {
    create(data) {
      // Normalize source: backend uses 'site' not 'website'
      if (data.source === 'website') data.source = 'site';
      return post('/leads', data);
    },
    getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return get(`/leads?${query}`);
    },
  };

  /* ---------- Properties API ---------- */
  const properties = {
    getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return get(`/properties?${query}`);
    },
    getById(id) {
      return get(`/properties/${id}`);
    },
  };

  /* ---------- Appointments API ---------- */
  const appointments = {
    publicCreate(data) {
      return post('/appointments/public', data);
    },
  };

  /* ---------- Chatbot API ---------- */
  const chatbot = {
    createConversation(data) {
      return post('/chatbot/conversations', data);
    },
    addMessage(conversationId, message) {
      return post(`/chatbot/conversations/${conversationId}/messages`, { message });
    },
  };

  /* ---------- Auth API ---------- */
  const auth = {
    login(email, password) {
      return post('/auth/login', { email, password });
    },
    register(data) {
      return post('/auth/register', data);
    },
  };

  /* ---------- Public API ---------- */
  return {
    BASE_URL,
    request,
    get,
    post,
    put,
    del,
    leads,
    properties,
    appointments,
    chatbot,
    auth,
  };
})();
