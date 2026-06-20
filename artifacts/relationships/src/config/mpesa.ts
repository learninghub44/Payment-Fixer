export const MPESA_CONFIG = {
  membershipFeeKES: 200,
  currency: "KES",
};

// Becomes true once the backend has MPESA_CONSUMER_KEY / MPESA_SHORTCODE /
// MPESA_PASSKEY configured. Until then, payment buttons show a friendly
// "not available yet" message instead of attempting an STK push.
export const isMpesaConfigured = true;
