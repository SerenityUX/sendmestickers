import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [countdown, setCountdown] = useState(15);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session_id) return;

    // Process payment in background
    const processPayment = async () => {
      try {
        const verifyRes = await fetch(`/api/verify-session?session_id=${session_id}`);
        const verifyData = await verifyRes.json();

        if (verifyData.error) {
          setError(verifyData.error);
          return;
        }

        // Complete the send to database
        const { imageUrl, handle } = verifyData.metadata;
        
        if (imageUrl && handle) {
          await fetch('/api/complete-send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl,
              handle,
              sessionId: session_id,
            }),
          });
        }
      } catch (err) {
        console.error('Error processing payment:', err);
      }
    };

    processPayment();

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session_id, router]);

  if (error) {
    return (
      <html>
        <head>
          <title>Error - sendmestickers</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style={{ 
          margin: 0, 
          padding: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          backgroundColor: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', color: '#ff6b6b', marginBottom: '20px' }}>
              {error}
            </h1>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Go Back Home
            </button>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html>
      <head>
        <title>Success! - sendmestickers</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '48px', 
            color: '#000', 
            margin: '0 0 20px 0',
            fontWeight: '500'
          }}>
            Stickers on the way...
          </h1>
          <p style={{ 
            fontSize: '24px', 
            color: '#666',
            margin: 0
          }}>
            redirecting in {countdown}
          </p>
        </div>
      </body>
    </html>
  );
}

