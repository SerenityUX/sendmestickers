import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Check if the payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Return session details including metadata
    res.status(200).json({
      id: session.id,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      metadata: session.metadata || {},
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ error: 'Failed to verify session' });
  }
}

