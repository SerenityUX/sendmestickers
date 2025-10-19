import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, username, handle, discountCode } = req.body;

    // Validate required fields
    if (!imageUrl || !username || !handle) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['imageUrl', 'username', 'handle']
      });
    }

    // Check for test discount code
    const testCode = process.env.TEST_DISCOUNT_CODE;
    const isTestMode = testCode && discountCode === testCode;
    const price = isTestMode ? 0 : 1500; // $0 for test, $15 for real

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `10 Custom Stickers to ${username}${isTestMode ? ' (TEST MODE)' : ''}`,
              description: isTestMode 
                ? `TEST: Free stickers to ${username}` 
                : `Send 10 personalized stickers to ${username}`,
              images: [imageUrl], // Use the uploaded image
            },
            unit_amount: price, // $0 for test, $15 for real
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/?canceled=true`,
      metadata: {
        // Store metadata for later use
        imageUrl: imageUrl,
        username: username,
        handle: handle,
        isTest: isTestMode ? 'true' : 'false',
      },
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
}

