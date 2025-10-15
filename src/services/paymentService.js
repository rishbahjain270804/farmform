const API_BASE_URL = 'http://localhost:5000/api';

const normalizeOrderResponse = (payload) => {
  if (!payload) {
    return null;
  }

  if (payload.order && payload.key) {
    return payload;
  }

  if (payload.data && payload.data.order && payload.data.key) {
    return payload.data;
  }

  if (payload.success && payload.data && payload.data.order && payload.data.key) {
    return payload.data;
  }

  return null;
};

export const paymentService = {
  async createPaymentOrder(data) {
    const response = await fetch(`${API_BASE_URL}/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const text = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch {
        throw new Error('Server error: Invalid response format');
      }
      throw new Error(errorData.message || 'Failed to create payment order');
    }

    const payload = await response.json();
    const normalized = normalizeOrderResponse(payload);

    if (!normalized) {
      throw new Error('Payment response did not include order details');
    }

    return normalized;
  },

  async verifyPayment(paymentData) {
    const response = await fetch(`${API_BASE_URL}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const text = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch {
        throw new Error('Server error: Invalid response format');
      }
      throw new Error(errorData.message || 'Failed to verify payment');
    }

    return await response.json();
  }
};
