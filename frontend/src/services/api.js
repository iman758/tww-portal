const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('tww_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    if (res.status === 401 && !window.location.pathname.includes('/login')) {
      // Token expired or invalid
      localStorage.removeItem('tww_token');
      localStorage.removeItem('tww_customer');
      window.dispatchEvent(new Event('tww_auth_logout'));
    }
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Auth
  async login(accountNumber, pin) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountNumber, pin }),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getDemoCustomers(search = '') {
    const res = await fetch(`${API_BASE}/auth/demo-customers?search=${encodeURIComponent(search)}`);
    return handleResponse(res);
  },

  // Invoices
  async getInvoices(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/invoices?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getInvoiceById(id) {
    const res = await fetch(`${API_BASE}/invoices/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Customer & Financials
  async getAgingSummary() {
    const res = await fetch(`${API_BASE}/customers/aging-summary`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Payments
  async getStripeConfig() {
    const res = await fetch(`${API_BASE}/payments/stripe/config`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createStripeIntent(invoiceId, amount) {
    const res = await fetch(`${API_BASE}/payments/stripe/create-intent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ invoiceId, amount }),
    });
    return handleResponse(res);
  },

  async confirmStripePayment(invoiceId, amount, paymentIntentId, method = 'STRIPE_CARD') {
    const res = await fetch(`${API_BASE}/payments/stripe/confirm`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ invoiceId, amount, paymentIntentId, method }),
    });
    return handleResponse(res);
  },

  async getZelleInstructions() {
    const res = await fetch(`${API_BASE}/payments/zelle-instructions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async submitZellePayment(payload) {
    const res = await fetch(`${API_BASE}/payments/zelle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async submitCheckPayment(payload) {
    const res = await fetch(`${API_BASE}/payments/check`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getPayments() {
    const res = await fetch(`${API_BASE}/payments`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // RMA & Warranty
  async getRmaClaims() {
    const res = await fetch(`${API_BASE}/rma`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getRmaClaimById(id) {
    const res = await fetch(`${API_BASE}/rma/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async submitRmaClaim(payload) {
    const res = await fetch(`${API_BASE}/rma`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
};

