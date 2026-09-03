const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Creates a real Stripe recurring-subscription checkout session (server-side,
 * $15/mo Pro) and opens it. The server returns a live checkout URL whose
 * completion grants Pro automatically via the webhook (userId metadata).
 * @param {string} userId
 */
export const createCheckoutSession = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    if (data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } else {
      throw new Error('No checkout URL received');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};

export const cancelSubscription = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/api/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId
      }
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Cancel error:', error);
    throw error;
  }
};