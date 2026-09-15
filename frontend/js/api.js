const NEXUS_API = 'http://localhost:5000/api';

async function nexusRequest(endpoint, options = {}) {
  const token = localStorage.getItem('nexus_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${NEXUS_API}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

const NexusAPI = {
  login(email, password) {
    return nexusRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  customers() {
    return nexusRequest('/customers');
  },

  products() {
    return nexusRequest('/products');
  },

  inventory() {
    return nexusRequest('/inventory');
  },

  adjustInventory(id, quantity) {
    return nexusRequest(`/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity })
    });
  },

  transferInventory(product_id, from_warehouse, to_warehouse, quantity) {
    return nexusRequest('/inventory/transfer', {
      method: 'POST',
      body: JSON.stringify({
        product_id,
        from_warehouse,
        to_warehouse,
        quantity
      })
    });
  },

  orders() {
    return nexusRequest('/orders');
  },

  invoices() {
    return nexusRequest('/invoices');
  },

  deals() {
    return nexusRequest('/deals');
  },

  createCustomer(customer) {
    return nexusRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customer)
    });
  },

  updateCustomer(id, customer) {
    return nexusRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer)
    });
  },

  deleteCustomer(id) {
    return nexusRequest(`/customers/${id}`, {
      method: 'DELETE'
    });
  },

  createInvoice(invoice) {
    return nexusRequest("/invoices", {
      method: "POST",
      body: JSON.stringify(invoice)
    });
  },

  updateInvoiceStatus(id, status) {
    return nexusRequest(`/invoices/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  },
  createOrder(order) {
    return nexusRequest("/orders", {
      method: "POST",
      body: JSON.stringify(order)
    });
  },

  updateOrderStatus(id, status, payment_status) {
    return nexusRequest(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, payment_status })
    });
  },
  createProduct(product) {
    return nexusRequest('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  }
};

window.NexusAPI = NexusAPI;
